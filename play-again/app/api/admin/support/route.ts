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
            profile_picture: true
          }
        },
        messages: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ tickets });
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

    const { ticketId, content } = await req.json();

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
          status: "IN_PROGRESS",
          updatedAt: new Date()
        }
      });

      // C. Trouver ou Créer le fil de discussion "Support PlayAgain" permanent dans la messagerie de l'utilisateur
      // Le fil n'est lié à aucun produit spécifique (product_id = null/undefined)
      let conversation = await tx.conversation.findFirst({
        where: {
          user_id: targetUserId,
          isSupportThread: true
        }
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            user_id: targetUserId,
            isSupportThread: true,
            // Pour contourner le fait que product_id est requis ou non, on vérifie s'il existe un produit support générique
            // ou s'il est nullable. Comme il est optionnel (product_id Int?), on peut ne pas l'inclure.
            metadata: {
              title: "Support PlayAgain",
              official: true
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
          is_opened: false
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
