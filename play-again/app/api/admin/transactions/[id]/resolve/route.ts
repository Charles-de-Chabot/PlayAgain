import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { createNotification } from "@/app/actions/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non autorisé. Veuillez vous connecter.", status: 401 };
  }

  const adminId = parseInt(session.user.id);
  const adminUser = await prisma.user.findUnique({
    where: { id: adminId }
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    return { error: "Accès refusé. Privilèges insuffisants.", status: 403 };
  }

  return { admin: adminUser, id: adminId };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "ID de facture invalide" }, { status: 400 });
    }

    const { action, explanation } = await req.json();
    if (!action || !["RELEASE_TO_SELLER", "REFUND_TO_BUYER"].includes(action)) {
      return NextResponse.json({ error: "Action invalide ou manquante" }, { status: 400 });
    }

    // 1. Récupération de la facture avec les détails complets
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: true,
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const item = invoice.items[0];
    if (!item) {
      return NextResponse.json({ error: "Aucun article de sport rattaché à cette facture" }, { status: 400 });
    }

    // Exécution de l'arbitrage
    if (action === "RELEASE_TO_SELLER") {
      // --- CAS A : DÉBLOQUER LES FONDS AU VENDEUR ---
      if (invoice.status === "COMPLETED") {
        return NextResponse.json({ error: "Cette facture est déjà clôturée avec succès" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // 1. Mise à jour de la facture
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { 
            status: "COMPLETED",
            is_disputed: false 
          }
        });

        // 2. Virement Stripe Connect vers le vendeur
        const seller = await tx.user.findUnique({
          where: { id: item.product.user_id },
          select: { stripeConnectId: true }
        });

        if (seller?.stripeConnectId) {
          if (process.env.STRIPE_SECRET_KEY) {
            try {
              const amountInCents = Math.round(Number(item.unit_price) * 100);
              await stripe.transfers.create({
                amount: amountInCents,
                currency: "eur",
                destination: seller.stripeConnectId,
                description: `Arbitrage SAV - Déblocage Facture #${invoiceId} - Produit ${item.product.title}`,
                source_transaction: invoice.payment_intent_id || undefined,
              });
            } catch (stripeErr: any) {
              console.error("Stripe Connect Transfer failed (Simulation Fallback):", stripeErr.message);
            }
          }
        }

        // 3. Résolution du ticket de support lié
        const ticket = await tx.supportTicket.findFirst({
          where: {
            subject: {
              contains: `Commande #${invoiceId}`
            }
          }
        });

        if (ticket) {
          await tx.supportTicket.update({
            where: { id: ticket.id },
            data: { status: "RESOLVED" }
          });

          const resolutionText = explanation 
            ? `Arbitrage administratif : Litige résolu en faveur du vendeur.\n\nExplication : ${explanation}`
            : `Arbitrage administratif : Litige résolu en faveur du vendeur. Les fonds de ${item.unit_price} € ont été débloqués et transférés.`;

          await tx.supportMessage.create({
            data: {
              ticketId: ticket.id,
              senderId: adminCheck.id!,
              isAdminReply: true,
              content: resolutionText
            }
          });

          // Envoyer également la réponse dans le chat privé de support de l'acheteur
          const conversations = await tx.conversation.findMany({
            where: {
              user_id: ticket.userId,
              isSupportThread: true
            }
          });
          const supportConv = conversations.find(c => {
            const meta = c.metadata as any;
            return meta && (meta.ticketId === ticket.id || Number(meta.ticketId) === ticket.id);
          });
          if (supportConv) {
            await tx.message.create({
              data: {
                conversation_id: supportConv.id,
                user_id: adminCheck.id!,
                content: resolutionText,
                is_read: false
              }
            });
          }
        }

        // 4. Message système dans le chat acheteur-vendeur
        let conversation = await tx.conversation.findFirst({
          where: {
            user_id: invoice.user_id,
            product_id: item.product_id
          }
        });

        if (!conversation) {
          conversation = await tx.conversation.create({
            data: {
              user_id: invoice.user_id,
              product_id: item.product_id
            }
          });
        }

        await tx.message.create({
          data: {
            conversation_id: conversation.id,
            user_id: adminCheck.id!,
            content: `🛡️ [ARBITRAGE SAV] Le litige a été tranché par la médiation PlayAgain en faveur du vendeur. Les fonds d'un montant de **${item.unit_price} €** ont été débloqués et versés au vendeur. Merci pour votre patience.${explanation ? `\n\n**Explication de la décision :** *${explanation}*` : ""}`,
            metadata: {
              type: "SYSTEM"
            }
          }
        });

        // 5. Log administratif
        await tx.adminLog.create({
          data: {
            adminId: adminCheck.id!,
            adminEmail: adminCheck.admin!.email,
            action: "DISPUTE_RESOLVE_SELLER",
            targetId: invoiceId,
            metadata: {
              reason: "Arbitrage de litige en faveur du vendeur",
              amount: Number(item.unit_price),
              productId: item.product_id
            }
          }
        });
      });

      // 6. Notifications in-app hors transaction
      const productImageUrl = item.product.media?.[0]?.url || null;
      
      // Vendeur
      await createNotification({
        userId: item.product.user_id,
        type: "TRANSACTION",
        message: `🛡️ Le litige sur l'article "${item.product.title}" a été résolu en votre faveur. Les fonds ont été débloqués !`,
        metadata: {
          redirectUrl: `/profile`,
          invoiceId: invoice.id,
          productId: item.product.id,
          productImageUrl,
        }
      });

      // Acheteur
      await createNotification({
        userId: invoice.user_id,
        type: "TRANSACTION",
        message: `🛡️ Le litige sur l'article "${item.product.title}" a été clôturé par la médiation. Les fonds ont été transférés au vendeur.`,
        metadata: {
          redirectUrl: `/messages`,
          invoiceId: invoice.id,
          productId: item.product.id,
          productImageUrl,
        }
      });

    } else if (action === "REFUND_TO_BUYER") {
      // --- CAS B : REMBOURSER L'ACHETEUR ---
      if (invoice.status === "CANCELLED") {
        return NextResponse.json({ error: "Cette facture est déjà annulée/remboursée" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // 1. Mise à jour de la facture
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { 
            status: "CANCELLED",
            is_disputed: false 
          }
        });

        // 2. Remise hors-ligne saine de l'article (inactif, non vendu)
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            is_sold: false,
            is_active: false // Inactif pour contrôle qualité du matériel
          }
        });

        // 3. Remboursement Stripe
        if (invoice.payment_intent_id && process.env.STRIPE_SECRET_KEY) {
          try {
            await stripe.refunds.create({
              payment_intent: invoice.payment_intent_id,
              reason: "requested_by_customer"
            });
          } catch (stripeErr: any) {
            console.error("Stripe Refund failed (Simulation Fallback):", stripeErr.message);
          }
        }

        // 4. Résolution du ticket de support lié
        const ticket = await tx.supportTicket.findFirst({
          where: {
            subject: {
              contains: `Commande #${invoiceId}`
            }
          }
        });

        if (ticket) {
          await tx.supportTicket.update({
            where: { id: ticket.id },
            data: { status: "RESOLVED" }
          });

          const resolutionText = explanation
            ? `Arbitrage administratif : Litige résolu en faveur de l'acheteur.\n\nExplication : ${explanation}`
            : `Arbitrage administratif : Litige résolu en faveur de l'acheteur. Un remboursement complet de ${item.unit_price} € a été émis.`;

          await tx.supportMessage.create({
            data: {
              ticketId: ticket.id,
              senderId: adminCheck.id!,
              isAdminReply: true,
              content: resolutionText
            }
          });

          // Envoyer également la réponse dans le chat privé de support de l'acheteur
          const conversations = await tx.conversation.findMany({
            where: {
              user_id: ticket.userId,
              isSupportThread: true
            }
          });
          const supportConv = conversations.find(c => {
            const meta = c.metadata as any;
            return meta && (meta.ticketId === ticket.id || Number(meta.ticketId) === ticket.id);
          });
          if (supportConv) {
            await tx.message.create({
              data: {
                conversation_id: supportConv.id,
                user_id: adminCheck.id!,
                content: resolutionText,
                is_read: false
              }
            });
          }
        }

        // 5. Message système dans le chat acheteur-vendeur
        let conversation = await tx.conversation.findFirst({
          where: {
            user_id: invoice.user_id,
            product_id: item.product_id
          }
        });

        if (!conversation) {
          conversation = await tx.conversation.create({
            data: {
              user_id: invoice.user_id,
              product_id: item.product_id
            }
          });
        }

        await tx.message.create({
          data: {
            conversation_id: conversation.id,
            user_id: adminCheck.id!,
            content: `🛡️ [ARBITRAGE SAV] Le litige a été tranché par la médiation PlayAgain en faveur de l'acheteur. La vente est annulée et l'acheteur a été intégralement remboursé.${explanation ? `\n\n**Explication de la décision :** *${explanation}*` : ""}`,
            metadata: {
              type: "SYSTEM"
            }
          }
        });

        // 6. Log administratif
        await tx.adminLog.create({
          data: {
            adminId: adminCheck.id!,
            adminEmail: adminCheck.admin!.email,
            action: "DISPUTE_RESOLVE_BUYER",
            targetId: invoiceId,
            metadata: {
              reason: "Arbitrage de litige en faveur de l'acheteur (Remboursement)",
              amount: Number(item.unit_price),
              productId: item.product_id
            }
          }
        });
      });

      // 7. Notifications in-app hors transaction
      const productImageUrl = item.product.media?.[0]?.url || null;

      // Acheteur
      await createNotification({
        userId: invoice.user_id,
        type: "TRANSACTION",
        message: `🛡️ Votre remboursement de ${item.unit_price} € pour l'article "${item.product.title}" a été validé !`,
        metadata: {
          redirectUrl: `/messages`,
          invoiceId: invoice.id,
          productId: item.product.id,
          productImageUrl,
        }
      });

      // Vendeur
      await createNotification({
        userId: item.product.user_id,
        type: "TRANSACTION",
        message: `Le litige sur l'article "${item.product.title}" a été résolu en faveur de l'acheteur. La vente est annulée.`,
        metadata: {
          redirectUrl: `/messages`,
          invoiceId: invoice.id,
          productId: item.product.id,
          productImageUrl,
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erreur d'arbitrage de transaction :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
