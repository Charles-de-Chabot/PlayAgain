"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveSportProfile(data: any) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }

  const userId = parseInt(session.user.id);

  try {
    const profile = await prisma.sportProfile.upsert({
      where: { userId },
      update: {
        gender: data.gender,
        height: data.height ? parseInt(data.height) : null,
        weight: data.weight ? parseInt(data.weight) : null,
        shoeSize: data.shoeSize ? parseFloat(data.shoeSize) : null,
        level: data.level || "BEGINNER", // Garder un niveau de repli
        frequency: data.frequency ? parseInt(data.frequency) : null,
        handOrientation: data.handOrientation,
        boardStance: data.boardStance,
        interests: data.interests, // Expecting an array of strings
      },
      create: {
        userId,
        gender: data.gender,
        height: data.height ? parseInt(data.height) : null,
        weight: data.weight ? parseInt(data.weight) : null,
        shoeSize: data.shoeSize ? parseFloat(data.shoeSize) : null,
        level: data.level || "BEGINNER",
        frequency: data.frequency ? parseInt(data.frequency) : null,
        handOrientation: data.handOrientation,
        boardStance: data.boardStance,
        interests: data.interests,
      },
    });

    // Mettre à jour les compétences par sport (SportSkill)
    if (data.skills && Array.isArray(data.skills)) {
      const selectedSportNames = data.skills.map((s: any) => s.sportName.trim().toUpperCase());
      
      // 1. Supprimer les compétences qui ne sont plus sélectionnées
      await prisma.sportSkill.deleteMany({
        where: {
          sportProfileId: profile.id,
          sportName: { notIn: selectedSportNames },
        },
      });

      // 2. Créer ou mettre à jour les compétences actives
      for (const skill of data.skills) {
        const cleanName = skill.sportName.trim().toUpperCase();
        if (!cleanName) continue;

        await prisma.sportSkill.upsert({
          where: {
            sportProfileId_sportName: {
              sportProfileId: profile.id,
              sportName: cleanName,
            },
          },
          update: {
            level: skill.level,
          },
          create: {
            sportProfileId: profile.id,
            sportName: cleanName,
            level: skill.level,
          },
        });
      }
    }

    // Déclencher le calcul et l'envoi de notification de match IA instantané
    try {
      // 1. Récupérer tous les produits tiers actifs et non vendus
      const activeProducts = await prisma.product.findMany({
        where: {
          is_sold: false,
          is_active: true,
          user_id: { not: userId }, // Exclure ses propres produits
          user: {
            stripeConnectId: { not: null }
          }
        },
        include: {
          category: true,
          media: true,
          brand: true,
          type: true
        }
      });

      const matchedGear = [];

      // 2. Parcourir les produits et calculer le match IA
      // On recharge le profil avec ses compétences fraîches
      const freshProfile = await prisma.sportProfile.findUnique({
        where: { userId },
        include: { skills: true }
      });

      if (freshProfile) {
        // Import dynamique pour éviter tout couplage circulaire d'import serveur
        const { calculateMatch } = await import("@/lib/ai/matcher");
        const { createNotification } = await import("@/app/actions/notification");

        for (const product of activeProducts) {
          const matchResult = await calculateMatch(freshProfile, product);
          if (matchResult.score >= 90) {
            matchedGear.push({
              productId: product.id,
              title: product.title,
              score: matchResult.score,
              productImageUrl: product.media?.[0]?.url || null
            });
          }
        }

        // 3. Envoyer une notification s'il y a des matchs de haute qualité
        if (matchedGear.length > 0) {
          const count = matchedGear.length;
          const firstMatch = matchedGear[0];
          const productImageUrl = firstMatch.productImageUrl;

          let message = "";
          if (count === 1) {
            message = `⚡ Match IA : L'équipement "${firstMatch.title}" correspond à ${firstMatch.score}% à votre niveau de sport !`;
          } else {
            message = `⚡ Match IA : ${count} équipements sportifs correspondent à plus de 90% à votre profil de sportif !`;
          }

          // Limitation anti-spam : éviter les doublons instantanés si de nombreuses modifs sont faites à la suite
          const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
          const sentRecently = await prisma.notification.findFirst({
            where: {
              user_id: userId,
              type: "AI_MATCH",
              created_at: { gte: twentyHoursAgo }
            }
          });

          if (!sentRecently) {
            await createNotification({
              userId,
              type: "AI_MATCH",
              message,
              metadata: {
                redirectUrl: "/shop?playmatch=90",
                productId: firstMatch.productId,
                productImageUrl,
                matchedCount: count
              }
            });
            console.log(`✉️ [Instant Match IA] Notification envoyée à l'utilisateur #${userId} suite à la mise à jour de son profil.`);
          }
        }
      }
    } catch (matchErr) {
      console.error("❌ [Instant Match IA] Erreur lors du calcul instantané :", matchErr);
    }

    revalidatePath("/profile");
    return { success: true, profile };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du profil sportif:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

export async function getSportProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  try {
    const profile = await prisma.sportProfile.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: {
        skills: true,
      }
    });
    return profile;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil sportif:", error);
    return null;
  }
}
