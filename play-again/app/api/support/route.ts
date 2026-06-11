import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 400 });
    }

    let subject = "";
    let content = "";

    try {
      const body = await req.json();
      subject = body.subject?.trim() || "";
      content = body.content?.trim() || "";
    } catch (_) {
      return NextResponse.json({ error: "Données de requête invalides" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Le contenu du message est obligatoire." }, { status: 400 });
    }

    const finalSubject = subject || "Demande d'assistance générale";
    let supportConversationId = 0;

    // Utilisation d'une transaction Prisma pour garantir la cohérence
    await prisma.$transaction(async (tx) => {
      // 1. Création du ticket de support
      const ticket = await tx.supportTicket.create({
        data: {
          userId: userId,
          subject: finalSubject,
          content: content,
          status: "NEW",
        }
      });

      // 2. Création du premier message dans le ticket de support interne
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          isAdminReply: false,
          content: content,
        }
      });

      // 3. Création d'un nouveau fil de support pour ce ticket
      const supportConv = await tx.conversation.create({
        data: {
          user_id: userId,
          isSupportThread: true,
          metadata: {
            title: `Support: ${finalSubject}`,
            official: true,
            ticketId: ticket.id
          }
        }
      });

      supportConversationId = supportConv.id;

      // 4. Envoi du message de confirmation dans la messagerie privée de l'utilisateur
      await tx.message.create({
        data: {
          conversation_id: supportConv.id,
          user_id: userId,
          content: `[SUPPORT - ${finalSubject}]\n\nVotre message :\n"${content}"\n\nVotre demande a bien été transmise à notre équipe. Un administrateur va prendre en charge votre dossier sous 12h. Les réponses s'afficheront directement dans cette discussion.`,
          is_read: true,
        }
      });
    });

    return NextResponse.json({ success: true, conversationId: supportConversationId });
  } catch (error: any) {
    console.error("Erreur lors de la création du ticket de support :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
