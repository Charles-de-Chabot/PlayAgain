import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
            product: true,
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
    await prisma.$transaction(async (tx) => {
      // A. Mettre à jour le statut de la facture à SHIPPED
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "SHIPPED" },
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
          content: `📦 Bonne nouvelle ! Le vendeur a expédié votre colis. Suivez l'envoi de votre article **${item.product.title}**. La discussion est désormais fermée en lecture seule.`,
          user_id: userId, // Vendeur
          conversation_id: conversation.id,
          metadata: {
            type: "SYSTEM",
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors du marquage de l'expédition :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
