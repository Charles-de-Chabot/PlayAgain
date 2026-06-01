"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notificationRegistry } from "@/lib/notificationRegistry";

export interface CreateNotificationParams {
  userId: number;
  type: "MESSAGE" | "TRANSACTION" | "SYSTEM" | "AI_MATCH";
  message: string;
  metadata?: {
    redirectUrl?: string;
    productImageUrl?: string | null;
    senderAvatarUrl?: string | null;
    [key: string]: any;
  };
}

/**
 * Crée une notification pour un utilisateur et la diffuse en direct si connecté.
 */
export async function createNotification({
  userId,
  type,
  message,
  metadata,
}: CreateNotificationParams) {
  try {
    let notification: any = null;

    // 1. Regroupement Intelligent (Debouncing / Anti-Spam) pour les messages de chat
    if (type === "MESSAGE" && metadata?.conversationId) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const existingNotification = await prisma.notification.findFirst({
        where: {
          user_id: userId,
          type: "MESSAGE",
          is_opened: false,
          created_at: { gte: fifteenMinutesAgo },
        },
      });

      if (existingNotification) {
        const existingMeta = existingNotification.metadata
          ? (typeof existingNotification.metadata === "string"
              ? JSON.parse(existingNotification.metadata)
              : (existingNotification.metadata as any))
          : {};

        if (existingMeta.conversationId === metadata.conversationId) {
          const messageCount = (existingMeta.messageCount || 1) + 1;
          const updatedMessage = `✉️ ${metadata.senderName || "Un membre"} vous a envoyé ${messageCount} nouveaux messages`;

          notification = await prisma.notification.update({
            where: { id: existingNotification.id },
            data: {
              message: updatedMessage,
              created_at: new Date(), // Remonter en haut de liste
              metadata: {
                ...existingMeta,
                messageCount,
                messageSnippet: metadata.messageSnippet,
                senderAvatarUrl: metadata.senderAvatarUrl,
              },
            },
          });
        }
      }
    }

    // 2. Cas standard (pas de regroupement possible ou autre type de notification)
    if (!notification) {
      notification = await prisma.notification.create({
        data: {
          user_id: userId,
          type,
          message,
          metadata: metadata ? (metadata as any) : undefined,
        },
      });
    }

    // 3. Diffuser la notification en temps réel via le registre SSE
    notificationRegistry.trigger(userId, notification);

    // 4. Nettoyage automatique en tâche de fond (notifications lues > 30 jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    prisma.notification.deleteMany({
      where: {
        user_id: userId,
        is_opened: true,
        created_at: { lt: thirtyDaysAgo },
      },
    }).catch(err => {
      console.error("Erreur de nettoyage automatique des anciennes notifications:", err);
    });

    return { success: true, notification };
  } catch (error) {
    console.error("❌ Erreur de création de notification:", error);
    return { success: false, error: "Impossible de créer la notification." };
  }
}

/**
 * Récupère les notifications de l'utilisateur connecté.
 */
export async function getUserNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const userId = parseInt(session.user.id);

  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return notifications.map(n => {
      let parsedMeta = null;
      if (n.metadata) {
        parsedMeta = typeof n.metadata === "string" ? JSON.parse(n.metadata) : n.metadata;
      }
      return {
        ...n,
        metadata: parsedMeta,
      };
    });
  } catch (error) {
    console.error("❌ Erreur de récupération des notifications:", error);
    return [];
  }
}

/**
 * Marque une notification spécifique comme ouverte/lue.
 */
export async function markAsOpened(notificationId: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { is_opened: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors du marquage comme lu:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Marque TOUTES les notifications de l'utilisateur connecté comme lues.
 */
export async function markAllAsOpened() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };
  
  const userId = parseInt(session.user.id);

  try {
    await prisma.notification.updateMany({
      where: { user_id: userId, is_opened: false },
      data: { is_opened: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors du marquage de tout comme lu:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Supprime physiquement une notification de l'historique.
 */
export async function deleteNotification(notificationId: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur de suppression de notification:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
