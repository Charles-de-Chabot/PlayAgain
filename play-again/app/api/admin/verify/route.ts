import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
    }

    const adminId = parseInt(session.user.id);

    // 1. Vérification stricte du rôle ADMIN de l'appelant en base de données
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé. Vous devez être administrateur pour effectuer cette action." }, { status: 403 });
    }

    const { requestId, action, rejectionReason } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: "Les champs 'requestId' et 'action' sont obligatoires." }, { status: 400 });
    }

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "L'action doit être 'APPROVE' ou 'REJECT'." }, { status: 400 });
    }

    if (action === "REJECT" && !rejectionReason) {
      return NextResponse.json({ error: "Un motif de rejet ('rejectionReason') est obligatoire pour refuser une demande." }, { status: 400 });
    }

    // 2. Récupérer la demande de vérification
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!verificationRequest) {
      return NextResponse.json({ error: "Demande de vérification introuvable." }, { status: 404 });
    }

    if (verificationRequest.status !== "PENDING" && verificationRequest.status !== "PROCESSING_AI") {
      return NextResponse.json({ error: "Cette demande a déjà été traitée." }, { status: 400 });
    }

    const targetUserId = verificationRequest.userId;

    if (action === "APPROVE") {
      // 3. Approbation : Mettre à jour la requête et certifier l'utilisateur
      await prisma.$transaction([
        prisma.verificationRequest.update({
          where: { id: verificationRequest.id },
          data: {
            status: "APPROVED",
            reviewedById: adminId,
            reviewedAt: new Date(),
            rejectionReason: null
          }
        }),
        prisma.user.update({
          where: { id: targetUserId },
          data: {
            is_certified: true
          }
        }),
        prisma.notification.create({
          data: {
            user_id: targetUserId,
            type: "VERIFICATION_APPROVED",
            message: "Félicitations ! Votre demande de vérification a été approuvée. Vous arborez désormais le badge de confiance sur PlayAgain !",
            is_opened: false
          }
        })
      ]);

      return NextResponse.json({ success: true, message: "Demande approuvée avec succès. L'utilisateur est maintenant certifié." });
    } else {
      // 4. Rejet : Mettre à jour la requête en statut REJECTED sans certifier l'utilisateur
      await prisma.$transaction([
        prisma.verificationRequest.update({
          where: { id: verificationRequest.id },
          data: {
            status: "REJECTED",
            reviewedById: adminId,
            reviewedAt: new Date(),
            rejectionReason: rejectionReason
          }
        }),
        prisma.notification.create({
          data: {
            user_id: targetUserId,
            type: "VERIFICATION_REJECTED",
            message: `Votre demande de vérification a été refusée. Motif : ${rejectionReason}. Vous pouvez corriger vos informations et soumettre une nouvelle demande.`,
            is_opened: false
          }
        })
      ]);

      return NextResponse.json({ success: true, message: "Demande rejetée avec succès. L'utilisateur a été notifié." });
    }
  } catch (error: any) {
    console.error("Erreur dans l'API de modération :", error);
    return NextResponse.json({ error: error.message || "Une erreur interne est survenue." }, { status: 500 });
  }
}
