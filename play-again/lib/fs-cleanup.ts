import { unlink } from "fs/promises";
import { join } from "path";

/**
 * Supprime physiquement les documents d'une demande de vérification du disque dur.
 */
export async function deleteVerificationFiles(filenames: (string | null)[]) {
  const uploadDir = join(process.cwd(), "private", "uploads", "verifications");

  for (const filename of filenames) {
    if (!filename) continue;

    // Protection supplémentaire pour éviter de supprimer des fichiers en dehors du dossier verifications
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      console.warn(`[RGPD-Cleanup] Chemin suspect ignoré pour des raisons de sécurité : ${filename}`);
      continue;
    }

    const filePath = join(uploadDir, filename);
    try {
      await unlink(filePath);
      console.log(`[RGPD-Cleanup] Fichier supprimé : ${filename}`);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.warn(`[RGPD-Cleanup] Fichier déjà absent ou introuvable : ${filename}`);
      } else {
        console.error(`[RGPD-Cleanup] Échec de suppression de ${filename} :`, err);
      }
    }
  }
}
