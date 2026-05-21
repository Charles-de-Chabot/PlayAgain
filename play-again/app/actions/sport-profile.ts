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
