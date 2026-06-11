import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper de vérification d'accès administrateur
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

// 🟢 GET : Liste tous les tickets de support
export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || ""; // "NEW", "IN_PROGRESS", "RESOLVED"

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
            profile_picture: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const userIds = Array.from(new Set(tickets.map(t => t.userId)));
    const conversations = await prisma.conversation.findMany({
      where: {
        user_id: { in: userIds },
        isSupportThread: true
      },
      include: {
        messages: {
          orderBy: { created_at: "asc" }
        }
      }
    });

    const ticketsWithMessages = tickets.map((ticket) => {
      const conversation = conversations.find(c => {
        const meta = c.metadata as any;
        return meta && (meta.ticketId === ticket.id || Number(meta.ticketId) === ticket.id);
      });

      let ticketMessages = conversation ? conversation.messages.map(msg => ({
        id: msg.id,
        ticketId: ticket.id,
        senderId: msg.user_id,
        isAdminReply: msg.user_id !== ticket.userId,
        content: msg.content,
        createdAt: msg.created_at
      })) : [];

      // Si le premier message de la conversation est la confirmation contenant le sujet, ou s'il commence par [SUPPORT - ,
      // ou s'il est identique au contenu initial du ticket, on le filtre pour éviter les doublons dans l'historique du chat admin.
      if (ticketMessages.length > 0) {
        const firstContent = ticketMessages[0].content;
        if (
          firstContent === ticket.content || 
          firstContent.includes(`[SUPPORT - `) || 
          firstContent.includes(`Litige Colis - Commande #`)
        ) {
          ticketMessages = ticketMessages.slice(1);
        }
      }

      return {
        ...ticket,
        messages: ticketMessages
      };
    });

    return NextResponse.json({ tickets: ticketsWithMessages });
  } catch (error: any) {
    console.error("Erreur de récupération des tickets de support :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔵 POST : Envoyer une réponse de support admin & l'injecter dans la messagerie permanente de l'utilisateur
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { ticketId, content, status } = await req.json();

    if (!ticketId || !content || !content.trim()) {
      return NextResponse.json({ error: "Les champs 'ticketId' et 'content' sont requis." }, { status: 400 });
    }

    const parsedTicketId = parseInt(ticketId);

    // 1. Récupérer le ticket cible
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: parsedTicketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket de support introuvable." }, { status: 404 });
    }

    const targetUserId = ticket.userId;

    // 2. Transaction Prisma : réponse support + statut ticket + messagerie permanente + notification
    await prisma.$transaction(async (tx) => {
      // A. Créer le message de support interne
      await tx.supportMessage.create({
        data: {
          ticketId: parsedTicketId,
          senderId: adminCheck.id!,
          isAdminReply: true,
          content: content.trim()
        }
      });

      // B. Mettre à jour le statut du ticket
      await tx.supportTicket.update({
        where: { id: parsedTicketId },
        data: {
          status: status || "IN_PROGRESS",
          updatedAt: new Date()
        }
      });

      // C. Trouver le fil de discussion associé à ce ticket dans la messagerie de l'utilisateur
      const conversations = await tx.conversation.findMany({
        where: {
          user_id: targetUserId,
          isSupportThread: true
        }
      });

      let conversation = conversations.find(c => {
        const meta = c.metadata as any;
        return meta && (meta.ticketId === parsedTicketId || Number(meta.ticketId) === parsedTicketId);
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            user_id: targetUserId,
            isSupportThread: true,
            metadata: {
              title: `Support: ${ticket.subject || "Sans sujet"}`,
              official: true,
              ticketId: parsedTicketId
            }
          }
        });
      }

      // D. Créer le message dans le fil de discussion de la messagerie de l'utilisateur
      await tx.message.create({
        data: {
          conversation_id: conversation.id,
          user_id: adminCheck.id!, // Expéditeur admin officiel
          content: content.trim(),
          is_read: false
        }
      });

      // E. Créer la notification in-app d'alerte
      await tx.notification.create({
        data: {
          user_id: targetUserId,
          type: "SUPPORT_REPLY",
          message: "Le Support Officiel PlayAgain vous a envoyé un message dans votre boîte de messagerie privée.",
          is_opened: false,
          metadata: {
            conversationId: conversation.id,
            redirectUrl: `/messages/${conversation.id}`
          }
        }
      });
    });

    // Enregistrer dans les logs d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "SUPPORT_TICKET_REPLY",
        targetId: parsedTicketId,
        metadata: {
          userId: targetUserId
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Réponse envoyée avec succès et injectée dans la messagerie permanente de l'utilisateur.",
      status: "IN_PROGRESS"
    });

  } catch (error: any) {
    console.error("Erreur d'envoi de réponse au ticket :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
