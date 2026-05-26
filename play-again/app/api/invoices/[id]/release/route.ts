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

    // 1. Récupération de la facture
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

    // 2. Sécurité : Seul l'acheteur de la commande peut libérer les fonds
    if (invoice.user_id !== userId) {
      return NextResponse.json({ error: "Seul l'acheteur peut libérer les fonds de séquestre" }, { status: 403 });
    }

    if (invoice.status === "COMPLETED") {
      return NextResponse.json({ error: "Cette transaction est déjà finalisée" }, { status: 400 });
    }

    const item = invoice.items[0];
    if (!item) {
      return NextResponse.json({ error: "Aucun article dans cette facture" }, { status: 400 });
    }

    // 3. Validation et transition de statut (DELIVERED -> COMPLETED)
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "COMPLETED" },
      });

      // Trouver la conversation de transaction
      let conversation = await tx.conversation.findFirst({
        where: {
          user_id: userId,
          product_id: item.product_id,
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            user_id: userId,
            product_id: item.product_id,
          },
        });
      }

      // Envoyer un message système pour informer de la validation
      await tx.message.create({
        data: {
          content: `🛡️ L'acheteur a validé la réception du colis. Tout est OK ! Les fonds d'un montant de **${item.unit_price} €** ont été débloqués et versés au vendeur. Merci d'avoir utilisé PlayAgain !`,
          user_id: userId, // Acheteur
          conversation_id: conversation.id,
          metadata: {
            type: "SYSTEM",
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la libération manuelle des fonds :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
