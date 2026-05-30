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

// 🟢 GET : Liste filtrable des utilisateurs
export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || ""; // "active" ou "inactive"

    // Clause where dynamique
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { firstname: { contains: search } },
        { lastname: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status === "active") {
      whereClause.is_active = true;
    } else if (status === "inactive") {
      whereClause.is_active = false;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        profile_picture: true,
        created_at: true,
        is_active: true,
        is_certified: true,
        role: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Erreur de récupération des utilisateurs :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔴 PUT : Toggle soft-delete (is_active) + désactivation des annonces
export async function PUT(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { userId, is_active } = await req.json();

    if (userId === undefined || is_active === undefined) {
      return NextResponse.json({ error: "Les champs 'userId' et 'is_active' sont requis." }, { status: 400 });
    }

    const targetUserId = parseInt(userId);

    // Ne pas pouvoir se désactiver soi-même
    if (targetUserId === adminCheck.id) {
      return NextResponse.json({ error: "Action impossible. Vous ne pouvez pas désactiver votre propre compte administrateur." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Exécution transactionnelle : modification statut utilisateur + annonces + log d'audit
    await prisma.$transaction(async (tx) => {
      // 1. Modifier le statut d'activité de l'utilisateur
      await tx.user.update({
        where: { id: targetUserId },
        data: { is_active: is_active }
      });

      // 2. Si on le désactive (soft-delete), désactiver toutes ses annonces
      if (!is_active) {
        await tx.product.updateMany({
          where: { user_id: targetUserId },
          data: { is_active: false }
        });
      }

      // 3. Enregistrer l'action administrative dans les logs d'audit
      await tx.adminLog.create({
        data: {
          adminId: adminCheck.id!,
          adminEmail: adminCheck.admin!.email,
          action: is_active ? "USER_REACTIVATE" : "USER_SOFT_DELETE",
          targetId: targetUserId,
          metadata: {
            reason: is_active ? "Réactivation administrative" : "Désactivation administrative (Soft-Delete)",
            impactedProductsCount: !is_active 
              ? await tx.product.count({ where: { user_id: targetUserId } }) 
              : 0
          }
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: is_active ? "Compte réactivé avec succès." : "Compte utilisateur suspendu et annonces désactivées.",
      is_active 
    });

  } catch (error: any) {
    console.error("Erreur de modification d'activité utilisateur :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
