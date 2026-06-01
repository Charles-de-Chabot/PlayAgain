import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/app/actions/notification";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "ID de facture invalide" }, { status: 400 });
    }

    // 1. Récupération de la facture avec les relations
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: true,
              }
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    const item = invoice.items[0];
    if (!item) {
      return NextResponse.json({ error: "Aucun article dans cette facture" }, { status: 400 });
    }

    // 2. Sécurité : seul le vendeur du produit (ou un admin) peut simuler la livraison
    const isSeller = item.product.user_id === userId;
    const isAdmin = (session.user as any).role === "ADMIN";
    
    if (!isSeller && !isAdmin) {
      return NextResponse.json({ error: "Non autorisé à modifier cette livraison" }, { status: 403 });
    }

    if (invoice.status !== "SHIPPED") {
      return NextResponse.json({ error: "Le colis doit être en cours d'expédition pour simuler sa livraison" }, { status: 400 });
    }

    // 3. Validation et transition de statut (SHIPPED -> DELIVERED)
    const result = await prisma.$transaction(async (tx) => {
      // A. Mettre à jour le statut de la facture à DELIVERED
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: "DELIVERED",
          delivered_at: new Date()
        },
      });

      // B. Trouver la conversation de transaction
      let conversation = await tx.conversation.findFirst({
        where: {
          user_id: invoice.user_id, // L'acheteur
          product_id: item.product_id,
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            user_id: invoice.user_id,
            product_id: item.product_id,
          },
        });
      }

      // C. Envoyer un message système pour informer l'acheteur que le colis a été livré
      await tx.message.create({
        data: {
          content: `🚚 Colis livré ! L'acheteur dispose de 48 heures pour confirmer la réception de l'équipement sportif ou déclarer un problème via son interface.`,
          user_id: item.product.user_id, // Vendeur
          conversation_id: conversation.id,
          metadata: {
            type: "SYSTEM",
          },
        },
      });

      return { conversationId: conversation.id };
    });

    // 4. Déclencher la notification in-app pour l'acheteur
    try {
      const productImageUrl = item.product.media?.[0]?.url || null;
      await createNotification({
        userId: invoice.user_id, // Acheteur
        type: "TRANSACTION",
        message: `🚚 Bonne nouvelle ! Votre colis pour l'article "${item.product.title}" a été livré. Vous avez 48h pour valider.`,
        metadata: {
          redirectUrl: `/messages?conversationId=${result.conversationId}`,
          invoiceId: invoice.id,
          productId: item.product_id,
          productImageUrl,
          isDelivery: true,
        }
      });
    } catch (err) {
      console.error("Erreur d'envoi de la notification de livraison :", err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la simulation de livraison :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
