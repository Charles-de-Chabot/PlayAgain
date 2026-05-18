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
        level: data.level,
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
        level: data.level,
        frequency: data.frequency ? parseInt(data.frequency) : null,
        handOrientation: data.handOrientation,
        boardStance: data.boardStance,
        interests: data.interests,
      },
    });

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
      where: { userId: parseInt(session.user.id) }
    });
    return profile;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil sportif:", error);
    return null;
  }
}
