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

    // 2. Sécurité : Seul l'acheteur de la commande peut signaler un problème
    if (invoice.user_id !== userId) {
      return NextResponse.json({ error: "Seul l'acheteur peut signaler un problème" }, { status: 403 });
    }

    if (invoice.status === "COMPLETED") {
      return NextResponse.json({ error: "Impossible de signaler un problème, la transaction est déjà clôturée" }, { status: 400 });
    }

    const item = invoice.items[0];
    if (!item) {
      return NextResponse.json({ error: "Aucun article dans cette facture" }, { status: 400 });
    }

    let reason = "Problème non détaillé lors de l'ouverture du litige.";
    try {
      const body = await req.json();
      if (body.reason && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch (_) {
      // Pas de corps JSON fourni ou vide
    }

    let supportConversationId = 0;

    // 3. Validation et transition de statut vers DISPUTED
    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: "DISPUTED",
          is_disputed: true 
        },
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

      // Envoyer un message système pour informer de l'ouverture du litige
      await tx.message.create({
        data: {
          content: `⚠️ Un problème ou litige a été signalé par l'acheteur concernant l'état du matériel de sport **${item.product.title}**. La transaction est temporairement gelée sous séquestre sécurisé. Le service de médiation PlayAgain va analyser le dossier.`,
          user_id: userId, // Acheteur
          conversation_id: conversation.id,
          metadata: {
            type: "SYSTEM",
          },
        },
      });

      // --- CRÉATION DU TICKET DE SUPPORT D'ASSISTANCE POUR L'ADMINISTRATEUR ---
      const ticket = await tx.supportTicket.create({
        data: {
          userId: userId,
          subject: `Litige Colis - Commande #${invoiceId} - ${item.product.title}`,
          content: reason,
          status: "NEW",
        }
      });

      // Premier message dans le ticket de support interne
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          isAdminReply: false,
          content: reason,
        }
      });

      // --- CRÉATION D'UN NOUVEAU FIL SUPPORT MESSAGERIE POUR CE LITIGE ---
      const supportConv = await tx.conversation.create({
        data: {
          user_id: userId,
          isSupportThread: true,
          metadata: {
            title: `Litige: Commande #${invoiceId}`,
            official: true,
            ticketId: ticket.id
          }
        }
      });

      supportConversationId = supportConv.id;

      // Envoyer le message de signalement de litige dans le fil support de la messagerie
      await tx.message.create({
        data: {
          conversation_id: supportConv.id,
          user_id: userId,
          content: `⚠️ [LITIGE OUVERT - Commande #${invoiceId} - ${item.product.title}]\n\nDescription du problème rencontré :\n"${reason}"\n\nVotre réclamation a bien été transmise à notre équipe de support. Un administrateur va prendre en charge votre dossier très rapidement. Vous recevrez les réponses directement dans cette discussion.`,
          is_read: true,
        }
      });
    });

    return NextResponse.json({ success: true, conversationId: supportConversationId });
  } catch (error: any) {
    console.error("Erreur lors de la déclaration du litige :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
