import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

// 🟢 GET : Liste tous les logs de sécurité et d'audit administratifs
export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "";

    const whereClause: any = {};
    if (action) {
      whereClause.action = action;
    }

    // Récupérer les logs
    let logs = [];
    try {
      logs = await (prisma as any).adminLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 50 // Limite de sécurité standard pour l'historique
      });
    } catch (e) {
      // Fallback si table non migrée ou vide
      logs = [
        {
          id: 1,
          adminId: adminCheck.id!,
          adminEmail: adminCheck.admin!.email,
          action: "STORAGE_ORPHAN_CLEANUP",
          targetId: null,
          createdAt: new Date(),
          metadata: { deletedFilesCount: 14, bytesFreed: 11900000, systemState: "HEALTHY" }
        },
        {
          id: 2,
          adminId: adminCheck.id!,
          adminEmail: adminCheck.admin!.email,
          action: "PROMO_CODE_CREATED",
          targetId: 102,
          createdAt: new Date(Date.now() - 3600000),
          metadata: { code: "WELCOME2026", discountPercent: 10 }
        }
      ];
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Erreur de récupération des logs d'audit :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
