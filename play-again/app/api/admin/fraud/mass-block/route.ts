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

    // Vérification du rôle ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé. Vous devez être administrateur." }, { status: 403 });
    }

    const { userIds, reason } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Une liste d'identifiants d'utilisateurs ('userIds') est requise." }, { status: 400 });
    }

    const blockReason = reason || "Suspension automatique via détection de fraude et multi-comptes";

    // Exécuter la suspension de masse dans une transaction Prisma
    const results = await prisma.$transaction(async (tx) => {
      const actions = [];

      for (const id of userIds) {
        const userId = parseInt(id);
        if (isNaN(userId)) continue;

        // 1. Soft-delete de l'utilisateur
        const userUpdate = tx.user.update({
          where: { id: userId },
          data: { is_active: false }
        });

        // 2. Désactivation de ses annonces non vendues
        const productsUpdate = tx.product.updateMany({
          where: { user_id: userId, is_sold: false },
          data: { is_active: false }
        });

        // 3. Log de l'action dans le journal d'audit
        const auditLog = tx.adminLog.create({
          data: {
            adminId: adminId,
            adminEmail: adminUser.email,
            action: "USER_MASS_BLOCK_FRAUD",
            targetId: userId,
            metadata: {
              reason: blockReason,
              associatedSuspiciousNetwork: userIds
            }
          }
        });

        actions.push(userUpdate, productsUpdate, auditLog);
      }

      await Promise.all(actions);
      return { count: userIds.length };
    });

    return NextResponse.json({
      success: true,
      message: `${results.count} utilisateurs suspendus avec succès et leurs annonces désactivées.`,
    });

  } catch (error: any) {
    console.error("Erreur lors du mass-block de fraude :", error);
    return NextResponse.json({ error: error.message || "Une erreur interne est survenue." }, { status: 500 });
  }
}
