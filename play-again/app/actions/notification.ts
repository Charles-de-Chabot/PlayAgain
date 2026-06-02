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
      take: limit + 20, // Surallocation de sécurité pour compenser les notifs soft-deleted
    });

    const parsed = notifications.map(n => {
      let parsedMeta = null;
      if (n.metadata) {
        parsedMeta = typeof n.metadata === "string" ? JSON.parse(n.metadata) : n.metadata;
      }
      return {
        ...n,
        metadata: parsedMeta,
      };
    });

    // Ignorer les sondages supprimés par l'utilisateur mais dont le vote est persisté
    return parsed.filter(n => !n.metadata?.isDeletedByUser).slice(0, limit);
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

  const userId = parseInt(session.user.id);

  try {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.user_id !== userId) {
      return { success: false, error: "Notification introuvable" };
    }

    const meta = typeof notif.metadata === "string" ? JSON.parse(notif.metadata) : (notif.metadata as any) || {};

    if (notif.type === "POLL" && meta.userVote) {
      // Si c'est un sondage auquel l'utilisateur a voté, on fait un soft-delete
      // pour persister le vote dans les statistiques globales.
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          metadata: {
            ...meta,
            isDeletedByUser: true,
          } as any,
        },
      });
    } else {
      // Sinon, on effectue une suppression physique de la base de données
      await prisma.notification.delete({
        where: { id: notificationId },
      });
    }

    revalidatePath("/");
    revalidatePath("/profile/notifications");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur de suppression de notification:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Envoie un broadcast ciblé (annonce ou sondage) aux utilisateurs actifs correspondants.
 */
export async function sendGlobalBroadcast({
  type,
  message,
  targetType = "GLOBAL",
  metadata = {},
}: {
  type: "POLL" | "ANNOUNCEMENT";
  message: string;
  targetType?: "GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED";
  metadata?: any;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non connecté" };
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    return { success: false, error: "Accès refusé" };
  }

  const adminId = parseInt(session.user.id);
  const adminEmail = session.user.email || "admin@playagain.fr";

  try {
    // 1. Définir le filtre dynamique selon le type de cible
    const userWhereClause: any = { is_active: true };

    if (targetType === "SELLERS") {
      userWhereClause.products = { some: {} };
    } else if (targetType === "BUYERS") {
      userWhereClause.invoices = { some: {} };
    } else if (targetType === "CERTIFIED") {
      userWhereClause.is_certified = true;
    } else if (targetType === "UNCERTIFIED") {
      userWhereClause.is_certified = false;
    }

    // 2. Récupérer tous les utilisateurs ciblés
    const activeUsers = await prisma.user.findMany({
      where: userWhereClause,
      select: { id: true },
    });

    if (activeUsers.length === 0) {
      return { success: false, error: "Aucun utilisateur actif ne correspond à cette cible." };
    }

    // 3. Générer un ID de broadcast unique
    const broadcastId = `bc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Enrichir le metadata
    const enrichedMetadata = {
      ...metadata,
      broadcastId,
      targetType,
      createdAt: new Date().toISOString(),
    };

    if (type === "POLL") {
      enrichedMetadata.userVote = null; // Initialement aucun vote
    }

    // 4. Créer une notification par utilisateur ciblé et la diffuser en direct
    const createdNotifications: { userId: number; notification: any }[] = [];
    
    // On effectue une transaction Prisma pour garantir l'intégrité de l'écriture massive
    await prisma.$transaction(async (tx) => {
      for (const u of activeUsers) {
        const notif = await tx.notification.create({
          data: {
            user_id: u.id,
            type,
            message,
            metadata: enrichedMetadata as any,
          },
        });
        createdNotifications.push({ userId: u.id, notification: notif });
      }
    });

    // 5. Déclencher SSE en tâche de fond pour ne pas bloquer l'appel
    createdNotifications.forEach(({ userId, notification }) => {
      notificationRegistry.trigger(userId, notification);
    });

    // 6. Enregistrer l'action dans le journal d'audit interne (AdminLog)
    await prisma.adminLog.create({
      data: {
        adminId,
        adminEmail,
        action: type === "POLL" ? "POLL_BROADCAST" : "ANNOUNCEMENT_BROADCAST",
        targetId: null,
        metadata: {
          broadcastId,
          message,
          targetType,
          question: metadata.question || null,
          optionsCount: metadata.options ? metadata.options.length : 0,
          notifiedCount: activeUsers.length,
        } as any,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile/notifications");
    
    return { 
      success: true, 
      count: activeUsers.length, 
      broadcastId,
      message: `${type === "POLL" ? "Sondage" : "Annonce"} envoyé avec succès à ${activeUsers.length} utilisateurs.`
    };
  } catch (error) {
    console.error("❌ Erreur lors du broadcast ciblé:", error);
    return { success: false, error: "Impossible d'envoyer le message de masse." };
  }
}

/**
 * Récupère le résumé et les résultats cumulés des sondages.
 */
export async function getPollsSummary() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  try {
    // Récupérer toutes les notifications de type POLL
    const polls = await prisma.notification.findMany({
      where: { type: "POLL" },
      select: {
        id: true,
        message: true,
        metadata: true,
        created_at: true,
        user_id: true,
      },
    });

    // Regrouper par broadcastId
    const groups: Record<string, {
      broadcastId: string;
      question: string;
      options: string[];
      createdAt: Date;
      votes: Record<string, number>;
      totalVotes: number;
      notifiedCount: number;
      isClosed: boolean;
    }> = {};

    polls.forEach((p) => {
      const meta = typeof p.metadata === "string" ? JSON.parse(p.metadata) : (p.metadata as any) || {};
      const broadcastId = meta.broadcastId || `poll_${p.created_at.getTime()}`;
      const question = meta.question || p.message;
      const options = meta.options || [];
      const userVote = meta.userVote || null;

      if (!groups[broadcastId]) {
        const votesInit: Record<string, number> = {};
        options.forEach((o: string) => {
          votesInit[o] = 0;
        });
        groups[broadcastId] = {
          broadcastId,
          question,
          options,
          createdAt: p.created_at,
          votes: votesInit,
          totalVotes: 0,
          notifiedCount: 0,
          isClosed: !!meta.isClosed,
        };
      }

      groups[broadcastId].notifiedCount += 1;

      if (userVote && options.includes(userVote)) {
        groups[broadcastId].votes[userVote] = (groups[broadcastId].votes[userVote] || 0) + 1;
        groups[broadcastId].totalVotes += 1;
      }
    });

    // Retourner un tableau trié du plus récent au plus ancien
    return Object.values(groups).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("❌ Erreur de récupération du résumé des sondages:", error);
    return [];
  }
}

/**
 * Récupère l'historique complet des diffusions globales (annonces et sondages).
 */
export async function getAdminBroadcastHistory() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  try {
    // Récupérer toutes les notifications de type POLL et ANNOUNCEMENT
    const broadcasts = await prisma.notification.findMany({
      where: {
        type: { in: ["POLL", "ANNOUNCEMENT"] }
      },
      select: {
        id: true,
        type: true,
        message: true,
        metadata: true,
        created_at: true,
        user_id: true,
      },
    });

    const groups: Record<string, {
      broadcastId: string;
      type: "POLL" | "ANNOUNCEMENT";
      question?: string;
      message: string;
      options?: string[];
      createdAt: Date;
      votes?: Record<string, number>;
      totalVotes?: number;
      notifiedCount: number;
      isClosed?: boolean;
      closedAt?: string;
      redirectUrl?: string;
      coverImageUrl?: string;
      targetType?: string;
    }> = {};

    broadcasts.forEach((b) => {
      const meta = typeof b.metadata === "string" ? JSON.parse(b.metadata) : (b.metadata as any) || {};
      const broadcastId = meta.broadcastId;
      if (!broadcastId) return; // ignorer les notifications système individuelles non groupées

      const isPoll = b.type === "POLL";
      
      if (!groups[broadcastId]) {
        if (isPoll) {
          const options = meta.options || [];
          const votesInit: Record<string, number> = {};
          options.forEach((o: string) => {
            votesInit[o] = 0;
          });
          groups[broadcastId] = {
            broadcastId,
            type: "POLL",
            question: meta.question || b.message,
            message: b.message,
            options,
            createdAt: b.created_at,
            votes: votesInit,
            totalVotes: 0,
            notifiedCount: 0,
            isClosed: !!meta.isClosed,
            closedAt: meta.closedAt || null,
            targetType: meta.targetType || "GLOBAL",
          };
        } else {
          groups[broadcastId] = {
            broadcastId,
            type: "ANNOUNCEMENT",
            message: b.message,
            createdAt: b.created_at,
            notifiedCount: 0,
            redirectUrl: meta.redirectUrl || null,
            coverImageUrl: meta.coverImageUrl || null,
            targetType: meta.targetType || "GLOBAL",
          };
        }
      }

      groups[broadcastId].notifiedCount += 1;

      if (isPoll) {
        const userVote = meta.userVote || null;
        const options = groups[broadcastId].options || [];
        if (userVote && options.includes(userVote)) {
          groups[broadcastId].votes![userVote] = (groups[broadcastId].votes![userVote] || 0) + 1;
          groups[broadcastId].totalVotes! += 1;
        }
      }
    });

    // Retourner trié par date de création descendante
    return Object.values(groups).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("❌ Erreur de récupération de l'historique des diffusions:", error);
    return [];
  }
}

/**
 * Permet à un utilisateur de voter à un sondage spécifique.
 */
export async function voteInPoll(notificationId: number, option: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non connecté" };
  }

  const userId = parseInt(session.user.id);

  try {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.user_id !== userId) {
      return { success: false, error: "Notification introuvable" };
    }

    if (notif.type !== "POLL") {
      return { success: false, error: "Cette notification n'est pas un sondage" };
    }

    const meta = typeof notif.metadata === "string" ? JSON.parse(notif.metadata) : (notif.metadata as any) || {};

    if (meta.isClosed) {
      return { success: false, error: "Ce sondage est clôturé et n'accepte plus de votes." };
    }

    if (meta.userVote) {
      return { success: false, error: "Vous avez déjà voté à ce sondage." };
    }

    if (!meta.options || !meta.options.includes(option)) {
      return { success: false, error: "Option de vote invalide" };
    }

    // Mettre à jour la métadonnée avec le vote de l'utilisateur
    const updatedMetadata = {
      ...meta,
      userVote: option,
    };

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        metadata: updatedMetadata as any,
        is_opened: true, // Le fait de voter ouvre automatiquement la notif
      },
    });

    revalidatePath("/profile/notifications");
    revalidatePath("/");

    return { success: true, message: "Votre vote a été pris en compte !" };
  } catch (error) {
    console.error("❌ Erreur lors du vote dans le sondage:", error);
    return { success: false, error: "Impossible de soumettre votre vote." };
  }
}

/**
 * Clôture définitivement un sondage à l'aide de son broadcastId.
 */
export async function closePoll(broadcastId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non connecté" };
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    return { success: false, error: "Accès refusé" };
  }

  const adminId = parseInt(session.user.id);
  const adminEmail = session.user.email || "admin@playagain.fr";

  try {
    // 1. Récupérer toutes les notifications correspondantes de type POLL
    const polls = await prisma.notification.findMany({
      where: { type: "POLL" }
    });

    const targetNotifs = polls.filter((p) => {
      const meta = typeof p.metadata === "string" ? JSON.parse(p.metadata) : (p.metadata as any) || {};
      return meta.broadcastId === broadcastId;
    });

    if (targetNotifs.length === 0) {
      return { success: false, error: "Sondage introuvable ou déjà supprimé." };
    }

    // 2. Mettre à jour l'ensemble des notifications dans une transaction Prisma
    await prisma.$transaction(
      targetNotifs.map((n) => {
        const meta = typeof n.metadata === "string" ? JSON.parse(n.metadata) : (n.metadata as any) || {};
        return prisma.notification.update({
          where: { id: n.id },
          data: {
            metadata: {
              ...meta,
              isClosed: true,
              closedAt: new Date().toISOString(),
            } as any,
          },
        });
      })
    );

    // 3. Ajouter une trace dans l'audit admin (AdminLog)
    await prisma.adminLog.create({
      data: {
        adminId,
        adminEmail,
        action: "POLL_CLOSE",
        targetId: null,
        metadata: {
          broadcastId,
          closedAt: new Date().toISOString(),
          notifiedCount: targetNotifs.length,
        } as any,
      },
    });

    revalidatePath("/");
    revalidatePath("/profile/notifications");

    return { 
      success: true, 
      message: "Le sondage a bien été clôturé avec succès." 
    };
  } catch (error) {
    console.error("❌ Erreur lors de la clôture du sondage:", error);
    return { success: false, error: "Impossible de clôturer le sondage." };
  }
}

/**
 * Récupère publiquement les statistiques cumulées d'un sondage pour affichage utilisateur.
 */
export async function getPollResultsPublic(broadcastId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non connecté" };
  }

  try {
    const polls = await prisma.notification.findMany({
      where: { type: "POLL" },
      select: {
        metadata: true,
      },
    });

    const targetPolls = polls.filter((p) => {
      const meta = typeof p.metadata === "string" ? JSON.parse(p.metadata) : (p.metadata as any) || {};
      return meta.broadcastId === broadcastId;
    });

    if (targetPolls.length === 0) {
      return { success: false, error: "Sondage introuvable" };
    }

    const firstMeta = typeof targetPolls[0].metadata === "string" 
      ? JSON.parse(targetPolls[0].metadata) 
      : (targetPolls[0].metadata as any) || {};

    const options = firstMeta.options || [];
    const votesInit: Record<string, number> = {};
    options.forEach((o: string) => {
      votesInit[o] = 0;
    });

    let totalVotes = 0;
    targetPolls.forEach((p) => {
      const meta = typeof p.metadata === "string" ? JSON.parse(p.metadata) : (p.metadata as any) || {};
      const userVote = meta.userVote;
      if (userVote && options.includes(userVote)) {
        votesInit[userVote] = (votesInit[userVote] || 0) + 1;
        totalVotes += 1;
      }
    });

    return {
      success: true,
      options,
      votes: votesInit,
      totalVotes,
      isClosed: !!firstMeta.isClosed
    };
  } catch (error) {
    console.error("❌ Erreur de récupération publique des résultats du sondage:", error);
    return { success: false, error: "Erreur serveur lors de la récupération des résultats." };
  }
}


