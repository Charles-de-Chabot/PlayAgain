"use server";

import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

/**
 * Uploads a document to public/uploads/verifications and returns the public url
 * @param formData FormData containing 'file'
 */
export async function uploadVerificationDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour charger des documents justificatifs");
  }

  const userId = parseInt(session.user.id);
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Aucun fichier n'a été fourni");
  }

  // Validation du type de fichier (images seulement)
  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image (JPEG, PNG, WEBP)");
  }

  // Limitation stricte à 5 Mo
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("L'image ne doit pas dépasser 5 Mo");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Répertoire d'upload dédié aux documents d'identité
    const uploadDir = join(process.cwd(), "private", "uploads", "verifications");
    
    // Création récursive s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });

    // Génération d'un nom de fichier unique et sécurisé (nettoyage des caractères spéciaux)
    const fileExtension = file.name.split(".").pop() || "png";
    const cleanFilename = `doc_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const filePath = join(uploadDir, cleanFilename);

    // Écriture locale sur le serveur
    await writeFile(filePath, buffer);

    return { success: true, url: cleanFilename };
  } catch (error: any) {
    console.error("Erreur lors de l'upload du document de vérification :", error);
    return { success: false, error: error.message || "Une erreur est survenue lors du téléversement" };
  }
}
