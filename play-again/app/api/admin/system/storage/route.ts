import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { readdir, stat, unlink } from "fs/promises";
import { join, relative } from "path";

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

// Fonction récursive pour lister tous les fichiers d'un dossier
async function getAllFilesRecursive(dirPath: string): Promise<{ path: string; size: number }[]> {
  const files: { path: string; size: number }[] = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getAllFilesRecursive(fullPath);
        files.push(...subFiles);
      } else {
        const fileStat = await stat(fullPath);
        files.push({
          path: fullPath,
          size: fileStat.size
        });
      }
    }
  } catch (err) {
    // Si le dossier n'existe pas encore, on loggue l'erreur mais on ne bloque pas
    console.error(`Erreur de lecture du dossier ${dirPath}:`, err);
  }
  return files;
}

// Récupère l'ensemble des fichiers sur le disque et identifie les orphelins
async function getStorageStats() {
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const allFiles = await getAllFilesRecursive(uploadsDir);

  // 1. Récupération de tous les médias actifs référencés en BDD
  const dbMedia = await prisma.media.findMany({ select: { url: true } });
  const dbUsers = await prisma.user.findMany({ select: { profile_picture: true, image: true } });
  const dbVerifications = await prisma.verificationRequest.findMany({
    select: { idCardPhoto1Url: true, idCardPhoto2Url: true, selfieUrl: true }
  });
  const dbMessages = await prisma.message.findMany({
    where: {
      OR: [
        { content: { contains: "/uploads/chat/" } },
        { metadata: { not: Prisma.JsonNull } }
      ]
    },
    select: { content: true, metadata: true }
  });

  const activeUrls = new Set<string>();
  
  // Fichiers système ou par défaut protégés
  activeUrls.add("/uploads/avatars/default.png");
  activeUrls.add("/uploads/avatars/default.jpg");
  activeUrls.add("/uploads/profile/default.png");

  dbMedia.forEach(m => { if (m.url) activeUrls.add(m.url); });
  dbUsers.forEach(u => {
    if (u.profile_picture) activeUrls.add(u.profile_picture);
    if (u.image) activeUrls.add(u.image);
  });
  dbVerifications.forEach(v => {
    if (v.idCardPhoto1Url) activeUrls.add(v.idCardPhoto1Url);
    if (v.idCardPhoto2Url) activeUrls.add(v.idCardPhoto2Url);
    if (v.selfieUrl) activeUrls.add(v.selfieUrl);
  });

  // Extraire les images/fichiers actifs de la messagerie
  dbMessages.forEach(msg => {
    if (msg.content && msg.content.includes("/uploads/chat/")) {
      const matches = msg.content.match(/\/uploads\/chat\/[a-zA-Z0-9_\-\.]+/g);
      if (matches) {
        matches.forEach(url => activeUrls.add(url));
      }
    }
    if (msg.metadata) {
      try {
        const meta = typeof msg.metadata === "string" ? JSON.parse(msg.metadata) : msg.metadata;
        if (meta && typeof meta === "object") {
          const keys = ["url", "image", "imageUrl", "file"];
          keys.forEach(key => {
            const val = (meta as any)[key];
            if (val && typeof val === "string" && val.includes("/uploads/chat/")) {
              activeUrls.add(val);
            }
          });
        }
      } catch (e) {
        // Ignorer les métadonnées non valides ou non-JSON
      }
    }
  });

  let totalStorageUsedBytes = 0;
  const orphans: { path: string; url: string; size: number }[] = [];

  for (const file of allFiles) {
    totalStorageUsedBytes += file.size;

    // Convertir le chemin absolu du fichier en URL relative (ex: /uploads/products/...)
    const relativePath = "/" + relative(join(process.cwd(), "public"), file.path).replace(/\\/g, "/");

    if (!activeUrls.has(relativePath)) {
      orphans.push({
        path: file.path,
        url: relativePath,
        size: file.size
      });
    }
  }

  return {
    totalStorageUsedBytes,
    orphans,
    dbMediaCount: dbMedia.length
  };
}

// 🟢 GET : Calcule dynamiquement l'état réel du stockage et des images orphelines
export async function GET() {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { totalStorageUsedBytes, orphans, dbMediaCount } = await getStorageStats();

    return NextResponse.json({
      success: true,
      totalStorageUsedBytes,
      orphansCount: orphans.length,
      orphansStorageSizeDeltaBytes: orphans.reduce((sum, o) => sum + o.size, 0),
      orphans: orphans.map(o => ({ url: o.url, size: o.size })),
      dbMediaCount
    });

  } catch (error: any) {
    console.error("Erreur de scan de stockage :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔵 POST : Déclenche le nettoyage différentiel réel des images orphelines
export async function POST(request: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json().catch(() => ({}));
    const urls = body.urls || [];

    const { orphans } = await getStorageStats();
    let bytesFreed = 0;
    const deletedUrls: string[] = [];

    // Ne supprimer que les fichiers ciblés s'ils sont fournis, sinon tout supprimer
    const targets = urls.length > 0 
      ? orphans.filter(o => urls.includes(o.url))
      : orphans;

    // Supprimer réellement chaque fichier orphelin du disque dur
    for (const orphan of targets) {
      try {
        await unlink(orphan.path);
        bytesFreed += orphan.size;
        deletedUrls.push(orphan.url);
      } catch (err) {
        console.error(`Impossible de supprimer le fichier orphelin ${orphan.path}:`, err);
      }
    }

    // Enregistrer l'action de purge dans l'audit log
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "STORAGE_ORPHAN_CLEANUP",
        metadata: {
          deletedFilesCount: deletedUrls.length,
          bytesFreed,
          systemState: "HEALTHY",
          deletedUrls
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedUrls.length,
      bytesFreed,
      deletedUrls,
      message: `Nettoyage terminé. ${deletedUrls.length} images orphelines supprimées du serveur, libérant ${(bytesFreed / (1024 * 1024)).toFixed(2)} Mo.`
    });

  } catch (error: any) {
    console.error("Erreur de nettoyage du stockage :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
