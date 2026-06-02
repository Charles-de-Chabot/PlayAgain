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

    const body = await req.json().catch(() => ({}));
    const { trackingNumber } = body;

    if (!trackingNumber || !trackingNumber.trim()) {
      return NextResponse.json({ error: "Le numéro de suivi est requis pour expédier le colis." }, { status: 400 });
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

    // 2. Sécurité : seul le vendeur du produit peut marquer comme expédié
    const isSeller = item.product.user_id === userId;
    if (!isSeller) {
      return NextResponse.json({ error: "Seul le vendeur peut marquer le colis comme expédié" }, { status: 403 });
    }

    if (invoice.status === "SHIPPED" || invoice.status === "DELIVERED" || invoice.status === "COMPLETED") {
      return NextResponse.json({ error: "Le colis a déjà été expédié ou la transaction est finalisée" }, { status: 400 });
    }

    if (invoice.status !== "PAID") {
      return NextResponse.json({ error: "Le paiement de cette facture n'est pas encore validé" }, { status: 400 });
    }

    // 3. Validation et transition de statut (PAID -> SHIPPED)
    const result = await prisma.$transaction(async (tx) => {
      // A. Mettre à jour le statut de la facture à SHIPPED et le numéro de suivi
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: "SHIPPED",
          tracking_number: trackingNumber.trim()
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

      // C. Envoyer un message système pour informer l'acheteur que le colis a été expédié
      await tx.message.create({
        data: {
          content: `📦 Bonne nouvelle ! Le vendeur a expédié votre colis. Suivez l'envoi de votre article **${item.product.title}** avec le numéro de suivi : **${trackingNumber.trim()}**. La discussion est désormais fermée en lecture seule.`,
          user_id: userId, // Vendeur
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
        message: `📦 Bonne nouvelle ! Le vendeur a expédié votre article "${item.product.title}".`,
        metadata: {
          redirectUrl: `/messages?conversationId=${result.conversationId}`,
          invoiceId: invoice.id,
          productId: item.product_id,
          productImageUrl,
        }
      });
    } catch (err) {
      console.error("Erreur d'envoi de la notification d'expédition :", err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors du marquage de l'expédition :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
