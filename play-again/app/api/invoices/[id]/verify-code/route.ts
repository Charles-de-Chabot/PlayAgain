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

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    // 1. Récupération de la facture avec les détails de l'article pour vérifier la propriété du produit
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

    // 2. Sécurité : seul le vendeur du produit peut saisir le code
    const isSeller = item.product.user_id === userId;
    if (!isSeller) {
      return NextResponse.json({ error: "Seul le vendeur peut valider cette rencontre" }, { status: 403 });
    }

    if (invoice.status === "COMPLETED") {
      return NextResponse.json({ error: "Cette transaction a déjà été finalisée avec succès" }, { status: 400 });
    }

    if (invoice.status !== "PAID") {
      return NextResponse.json({ error: "Le paiement de cette facture n'est pas encore validé" }, { status: 400 });
    }

    // 3. Comparaison du code (insensible à la casse, sans espaces et sans le préfixe PA-)
    const cleanedSubmittedCode = code.trim().toUpperCase().replace(/^PA-/, "");
    const actualCode = invoice.buyer_security_code?.trim().toUpperCase().replace(/^PA-/, "");

    if (!actualCode || cleanedSubmittedCode !== actualCode) {
      return NextResponse.json({ error: "Code de sécurité incorrect. Veuillez réessayer." }, { status: 400 });
    }

    // 4. Validation et transition de statut (PAID -> COMPLETED)
    await prisma.$transaction(async (tx) => {
      // A. Mettre à jour le statut de la facture à COMPLETED
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "COMPLETED" },
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

      // C. Envoyer un message système pour acter la remise en main propre réussie dans le chat
      await tx.message.create({
        data: {
          content: `🤝 La remise en main propre a été confirmée avec succès !`,
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
    console.error("Erreur lors de la validation du code de sécurité :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
