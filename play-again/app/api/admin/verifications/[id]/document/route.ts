import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Vérification de la session
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // 2. Vérification du rôle Administrateur
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    });

    if (currentUser?.role !== "ADMIN") {
      return new NextResponse("Accès réservé aux administrateurs", { status: 403 });
    }

    // 3. Récupération de la demande de vérification en base de données
    const { id } = await params;
    const requestId = parseInt(id);
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });

    if (!verificationRequest) {
      return new NextResponse("Demande introuvable", { status: 404 });
    }

    // 4. Déterminer quel document est demandé via query param (?type=id1 | id2 | selfie)
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); 
    
    let filename = "";
    if (type === "id1") filename = verificationRequest.idCardPhoto1Url;
    else if (type === "id2") filename = verificationRequest.idCardPhoto2Url || "";
    else if (type === "selfie") filename = verificationRequest.selfieUrl;

    if (!filename) {
      return new NextResponse("Fichier non trouvé pour ce type de document", { status: 400 });
    }

    // 5. Lecture physique sécurisée du fichier dans le dossier privé
    const filePath = join(process.cwd(), "private", "uploads", "verifications", filename);
    let fileBuffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch (fsError) {
      console.warn(`[KYC] Fichier introuvable sur le disque : ${filePath}`);
      return new NextResponse("Fichier physique introuvable sur le serveur", { status: 404 });
    }
    
    // Détection dynamique du Content-Type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    // 6. Renvoyer le fichier sous forme de flux
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=600" // Évite la mise en cache publique
      }
    });
  } catch (error) {
    console.error("Erreur de récupération du document :", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
