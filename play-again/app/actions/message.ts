"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { createNotification } from "@/app/actions/notification";

/**
 * Téléverse une image de messagerie sur le disque dur du serveur.
 */
export async function uploadChatImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour téléverser une image.");
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    throw new Error("Aucun fichier n'a été fourni.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", "chat");
  
  // S'assurer que le dossier existe
  await mkdir(uploadDir, { recursive: true });

  // Nom de fichier unique avec timestamp
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const path = join(uploadDir, filename);

  await writeFile(path, buffer);

  return { url: `/uploads/chat/${filename}` };
}

/**
 * Récupère une conversation existante entre l'acheteur connecté et le produit,
 * ou en crée une nouvelle si elle n'existe pas.
 */
export async function getOrCreateConversation(productId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour contacter un vendeur.");
  }

  const buyerId = parseInt(session.user.id);

  // 1. Récupération du produit et vérifications de sécurité
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { user_id: true, is_active: true, is_sold: true }
  });

  if (!product) {
    throw new Error("Le produit n'existe pas.");
  }

  if (product.user_id === buyerId) {
    throw new Error("Vous ne pouvez pas démarrer une discussion avec vous-même.");
  }

  // 2. Recherche d'une conversation existante
  let conversation = await prisma.conversation.findFirst({
    where: {
      user_id: buyerId,
      product_id: productId,
    },
  });

  // 3. Création si inexistante
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user_id: buyerId,
        product_id: productId,
      },
    });
  }

  return { conversationId: conversation.id };
}

/**
 * Envoie un message dans une conversation donnée.
 * Valide en amont que le produit est actif et non vendu.
 */
export async function sendMessage(conversationId: number, content: string, metadata?: any) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour envoyer un message.");
  }

  const senderId = parseInt(session.user.id);

  // 1. Charger la conversation avec le statut du produit
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      product: {
        select: {
          user_id: true,
          is_active: true,
          is_sold: true
        }
      }
    }
  });

  if (!conversation) {
    throw new Error("Discussion introuvable.");
  }

  // Sécurité : l'expéditeur doit être l'acheteur ou le vendeur (ou l'admin pour le support)
  const isSupport = conversation.isSupportThread;
  const isBuyer = conversation.user_id === senderId;
  const isSeller = conversation.product ? conversation.product.user_id === senderId : false;

  const senderUser = await prisma.user.findUnique({
    where: { id: senderId },
    select: { role: true }
  });
  const isAdmin = senderUser?.role === "ADMIN";

  if (!isBuyer && !isSeller && !(isSupport && isAdmin)) {
    throw new Error("Vous n'êtes pas autorisé à participer à cette discussion.");
  }

  // Garde-fous de robustesse (Lecture Seule)
  if (conversation.isSupportThread) {
    const latestTicket = await prisma.supportTicket.findFirst({
      where: { userId: conversation.user_id },
      orderBy: { createdAt: "desc" }
    });
    if (latestTicket && latestTicket.status === "RESOLVED") {
      throw new Error("Ce litige a été résolu par l'administration. La discussion est close.");
    }
  }

  if (conversation.product) {
    if (!conversation.product.is_active) {
      throw new Error("Impossible d'envoyer un message : cette annonce a été supprimée par le vendeur.");
    }
    if (conversation.product.is_sold) {
      throw new Error("Impossible d'envoyer un message : cet article a été vendu.");
    }
  }

  // 2. Création du message
  const message = await prisma.message.create({
    data: {
      content,
      user_id: senderId,
      conversation_id: conversationId,
      metadata: metadata || null,
    },
  });

  // Synchronisation avec le Helpdesk support interne si c'est un fil support
  if (isSupport) {
    // Trouver le dernier ticket non résolu de l'utilisateur
    let ticket = await prisma.supportTicket.findFirst({
      where: {
        userId: conversation.user_id,
        status: { not: "RESOLVED" }
      },
      orderBy: { createdAt: "desc" }
    });

    // Si aucun ticket actif n'existe (par exemple s'il a été résolu mais qu'ils continuent à parler),
    // on recrée un nouveau ticket pour garder le fil de discussion actif.
    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: conversation.user_id,
          subject: "Discussion Support réouverte",
          content: content,
          status: "NEW"
        }
      });
    } else {
      // Si le client répond, on remet le statut à "NEW" pour signaler à l'admin qu'une nouvelle réponse l'attend.
      if (!isAdmin) {
        await prisma.supportTicket.update({
          where: { id: ticket.id },
          data: {
            status: "NEW",
            updatedAt: new Date()
          }
        });
      }
    }

    let metaObj = metadata;
    if (typeof metadata === "string" && metadata.trim().startsWith("{")) {
      try {
        metaObj = JSON.parse(metadata);
      } catch (e) {}
    }

    const isImage = (metaObj?.type === "IMAGE" || metaObj?.url) && metaObj?.url;
    const supportMessageContent = isImage
      ? `📷 Image partagée : ${metaObj.url}`
      : content.trim();

    // Créer le message de support correspondant
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: senderId,
        isAdminReply: isAdmin,
        content: supportMessageContent
      }
    });
  }

  // 3. Récupérer les détails de l'expéditeur pour la notification
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { username: true, profile_picture: true }
  });

  // Déterminer le destinataire
  const targetUserId = conversation.user_id === senderId 
    ? (conversation.product ? conversation.product.user_id : null) 
    : conversation.user_id;

  // Déclencher la notification in-app en direct si le destinataire existe
  if (targetUserId) {
    await createNotification({
      userId: targetUserId,
      type: "MESSAGE",
      message: `✉️ Nouveau message de ${sender?.username || "un membre"} : "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
      metadata: {
        redirectUrl: `/messages?conversationId=${conversationId}`,
        conversationId,
        senderName: sender?.username || "un membre",
        senderAvatarUrl: sender?.profile_picture || null,
        messageSnippet: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
      }
    });
  }

  // Revalidation du cache Next.js
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/messages`);

  return message;
}

/**
 * Marque comme lus tous les messages reçus dans une conversation
 * (messages envoyés par l'autre participant).
 */
export async function markAsRead(conversationId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  const userId = parseInt(session.user.id);

  await prisma.message.updateMany({
    where: {
      conversation_id: conversationId,
      is_read: false,
      NOT: {
        user_id: userId,
      },
    },
    data: {
      is_read: true,
    },
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/messages`);

  return { success: true };
}

/**
 * Accepte ou décline une offre de prix interactive.
 * Seul le vendeur est autorisé à effectuer cette action.
 */
export async function resolveOffer(messageId: number, status: "ACCEPTED" | "DECLINED") {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté.");
  }

  const userId = parseInt(session.user.id);

  // 1. Récupération de l'offre
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          product: {
            select: {
              user_id: true,
              price: true
            }
          }
        }
      }
    }
  });

  if (!message) {
    throw new Error("Message d'offre introuvable.");
  }

  // 2. Sécurité : Seul le vendeur du produit peut résoudre l'offre
  if (!message.conversation.product || message.conversation.product.user_id !== userId) {
    throw new Error("Seul le vendeur de l'article peut accepter ou décliner une offre.");
  }

  const currentMetadata = message.metadata as any;
  if (!currentMetadata || currentMetadata.type !== "OFFER") {
    throw new Error("Ce message n'est pas une offre de prix.");
  }

  if (currentMetadata.status !== "PENDING") {
    throw new Error("Cette offre de prix a déjà été résolue.");
  }

  // 3. Mise à jour de l'offre
  const updatedMetadata = {
    ...currentMetadata,
    status: status
  };

  await prisma.message.update({
    where: { id: messageId },
    data: {
      metadata: updatedMetadata
    }
  });

  // 4. Création d'un message système dans le fil
  const systemMessageContent = status === "ACCEPTED"
    ? `Offre acceptée ! Vous pouvez maintenant acheter l'article pour ${currentMetadata.amount} €.`
    : `L'offre de ${currentMetadata.amount} € a été déclinée par le vendeur.`;

  await prisma.message.create({
    data: {
      content: systemMessageContent,
      user_id: userId, // Enregistré sous l'auteur qui résout le statut
      conversation_id: message.conversation_id,
      metadata: {
        type: "SYSTEM",
        offerMessageId: messageId,
        offerStatus: status
      }
    }
  });

  revalidatePath(`/messages/${message.conversation_id}`);
  revalidatePath(`/messages`);

  return { success: true };
}
