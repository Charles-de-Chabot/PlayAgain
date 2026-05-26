import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: "ID de conversation invalide" }, { status: 400 });
    }

    // 1. Récupération de la conversation pour vérification de l'autorisation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        user_id: true,
        product_id: true,
        product: {
          select: {
            user_id: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    // Sécurité : seul l'acheteur ou le vendeur peut lire les messages
    if (conversation.user_id !== userId && conversation.product.user_id !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. Récupération des messages par ordre chronologique
    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: "asc" },
    });

    // 3. Récupération de la facture associée active
    const invoice = await prisma.invoice.findFirst({
      where: {
        items: {
          some: {
            product_id: conversation.product_id,
          },
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        id: true,
        status: true,
        address_id: true,
      },
    });

    return NextResponse.json({ 
      messages,
      invoice: invoice ? { id: invoice.id, status: invoice.status, address_id: invoice.address_id } : null
    });
  } catch (error: any) {
    console.error("❌ [API GET MESSAGES ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
