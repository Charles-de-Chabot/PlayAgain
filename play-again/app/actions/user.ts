"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

export async function updateProfilePicture(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour modifier votre photo de profil");
  }

  const userId = parseInt(session.user.id);
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Aucun fichier n'a été fourni");
  }

  // Validation basique du type de fichier
  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image");
  }

  // Limitation à 5 Mo
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("L'image ne doit pas dépasser 5 Mo");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Définition du chemin d'enregistrement
    const uploadDir = join(process.cwd(), "public", "uploads", "profile");
    
    // Création récursive du dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    // Nettoyage et unicité du nom de fichier
    const cleanFilename = `profile_${userId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = join(uploadDir, cleanFilename);

    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/profile/${cleanFilename}`;

    // Mise à jour de l'utilisateur dans la base de données
    // On met à jour profile_picture ET image pour être parfaitement synchronisés avec NextAuth
    await prisma.user.update({
      where: { id: userId },
      data: {
        profile_picture: relativeUrl,
        image: relativeUrl,
      },
    });

    revalidatePath("/profile");

    return { success: true, url: relativeUrl };
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la photo de profil :", error);
    return { success: false, error: error.message || "Une erreur est survenue lors du téléversement" };
  }
}
