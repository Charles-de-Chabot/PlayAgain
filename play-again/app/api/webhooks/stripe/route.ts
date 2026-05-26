import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") || "";

  let event: Stripe.Event;

  // 1. Validation cryptographique de la signature Stripe
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Gestion de l'événement payment_intent.succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentIntentId = paymentIntent.id;

    try {
      // Récupération de la facture associée au PaymentIntent
      const invoice = await prisma.invoice.findUnique({
        where: { payment_intent_id: paymentIntentId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  user: true,
                },
              },
            },
          },
          user: true, // Acheteur
        },
      });

      if (!invoice) {
        console.error(`Invoice non trouvée pour le PaymentIntent: ${paymentIntentId}`);
        return NextResponse.json({ error: "Invoice non trouvée" }, { status: 404 });
      }

      // Si la facture a déjà été marquée comme payée, on arrête pour éviter les doublons de traitement
      if (invoice.status === "PAID" || invoice.status === "COMPLETED") {
        return NextResponse.json({ received: true });
      }

      const invoiceItem = invoice.items[0];
      if (!invoiceItem) {
        throw new Error("Aucun article trouvé pour cette facture.");
      }

      const product = invoiceItem.product;
      const buyerId = invoice.user_id;
      const sellerId = product.user_id;
      const productId = product.id;

      // 3. Lancement de la transaction BDD avec gestion de la concurrence (Anti-doublon)
      const result = await prisma.$transaction(async (tx) => {
        // Verrouillage/Lecture fraîche du produit pour s'assurer qu'il n'a pas été vendu par une autre transaction concurrente
        const activeProduct = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!activeProduct) {
          throw new Error("Produit non trouvé.");
        }

        // Cas de double achat simultané (Concurrence P2P)
        if (activeProduct.is_sold) {
          console.warn(`[Anti-doublon] Produit ${productId} déjà vendu. Remboursement automatique de l'acheteur.`);
          
          // A. Remboursement instantané automatique via Stripe API
          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });

          // B. Mise à jour de la facture en statut ANNULÉ
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: "CANCELLED" },
          });

          // C. Trouver ou créer la conversation entre acheteur et vendeur
          let conversation = await tx.conversation.findFirst({
            where: {
              user_id: buyerId,
              product_id: productId,
            },
          });

          if (!conversation) {
            conversation = await tx.conversation.create({
              data: {
                user_id: buyerId,
                product_id: productId,
              },
            });
          }

          // D. Envoyer un message privé système à l'acheteur pour l'informer du remboursement
          await tx.message.create({
            data: {
              content: `Désolé, l'article **${product.title}** n'est actuellement plus disponible car il a été acheté par un autre utilisateur simultanément. Votre paiement a été intégralement annulé et remboursé.`,
              user_id: buyerId,
              conversation_id: conversation.id,
              metadata: {
                visibleTo: "buyer",
                type: "refunded_duplicate",
              },
            },
          });

          return { refund: true };
        }

        // Cas Nominal : Le produit est disponible, validation de la transaction !
        
        // A. Marquer le produit comme vendu
        await tx.product.update({
          where: { id: productId },
          data: { is_sold: true },
        });

        // B. Mettre à jour le statut de la facture à PAID
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID" },
        });

        // C. Trouver ou créer la conversation de transaction
        let conversation = await tx.conversation.findFirst({
          where: {
            user_id: buyerId,
            product_id: productId,
          },
        });

        if (!conversation) {
          conversation = await tx.conversation.create({
            data: {
              user_id: buyerId,
              product_id: productId,
            },
          });
        }

        // D. Injecter les messages asymétriques privés selon le mode de livraison
        const isShipping = invoice.address_id !== null;

        if (isShipping) {
          // --- Mode Expédition par Colis ---
          
          // Message Acheteur (Privé)
          await tx.message.create({
            data: {
              content: `🎉 Félicitations ! Votre achat pour l'article **${product.title}** a été confirmé avec succès. Le vendeur prépare votre colis et va procéder à l'expédition prochainement.`,
              user_id: buyerId,
              conversation_id: conversation.id,
              metadata: {
                visibleTo: "buyer",
                type: "purchase_confirmed_buyer",
              },
            },
          });

          // Message Vendeur (Privé + Raccourci de Téléchargement du Bordereau PDF)
          await tx.message.create({
            data: {
              content: `📦 Bonne nouvelle ! Votre article **${product.title}** a été acheté par **${invoice.user.username || 'un utilisateur'}**. Vous disposez de 5 jours pour expédier le colis. Téléchargez votre bordereau d'envoi ci-dessous pour le coller sur votre colis.`,
              user_id: buyerId, // Rattaché à l'action initiée par l'acheteur
              conversation_id: conversation.id,
              metadata: {
                visibleTo: "seller",
                type: "shipping_label_seller",
                pdfUrl: `/api/invoices/${invoice.id}/shipping-label`,
              },
            },
          });

        } else {
          // --- Mode Remise en main propre ---
          
          // Message Acheteur (Privé + Code de Sécurité)
          await tx.message.create({
            data: {
              content: `🎉 Achat confirmé ! Convenez d'un rendez-vous avec le vendeur. Lors de la remise de l'article, transmettez-lui ce code de sécurité à saisir sur son application pour débloquer les fonds : **${invoice.buyer_security_code}**`,
              user_id: buyerId,
              conversation_id: conversation.id,
              metadata: {
                visibleTo: "buyer",
                type: "hand_delivery_buyer",
                securityCode: invoice.buyer_security_code,
              },
            },
          });

          // Message Vendeur (Privé + Lien Interactif de Validation du Code)
          await tx.message.create({
            data: {
              content: `🤝 Achat confirmé en main propre ! Convenez d'un rendez-vous avec l'acheteur. Lors de la rencontre, demandez-lui son code de sécurité et saisissez-le ici pour finaliser la vente et recevoir vos fonds :`,
              user_id: buyerId,
              conversation_id: conversation.id,
              metadata: {
                visibleTo: "seller",
                type: "hand_delivery_seller",
                invoiceId: invoice.id,
              },
            },
          });
        }

        return { refund: false };
      });

      console.log(`[Stripe Webhook] PaymentIntent ${paymentIntentId} traité avec succès. Remboursement : ${result.refund}`);
    } catch (dbErr: any) {
      console.error("Erreur de base de données dans le webhook Stripe:", dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
