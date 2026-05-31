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

// 🟢 GET : Liste filtrable des annonces du catalogue
export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const brandId = searchParams.get("brandId") || "";
    const status = searchParams.get("status") || ""; // "active", "inactive", "sold"
    const state = searchParams.get("state") || ""; // "NEUF", "EXCELLENT", "BON", "SATISFAISANT"
    const sortBy = searchParams.get("sortBy") || "date_desc";

    // Clause where dynamique
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (categoryId) {
      whereClause.category_id = parseInt(categoryId);
    }

    if (brandId) {
      whereClause.brand_id = parseInt(brandId);
    }

    if (state) {
      whereClause.state = state;
    }

    if (status === "active") {
      whereClause.is_active = true;
      whereClause.is_sold = false;
    } else if (status === "inactive") {
      whereClause.is_active = false;
    } else if (status === "sold") {
      whereClause.is_sold = true;
    }

    // Gestion du tri dynamique
    let orderByClause: any = { created_at: "desc" };
    if (sortBy === "date_asc") {
      orderByClause = { created_at: "asc" };
    } else if (sortBy === "price_desc") {
      orderByClause = { price: "desc" };
    } else if (sortBy === "price_asc") {
      orderByClause = { price: "asc" };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        brand: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        media: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: orderByClause
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Erreur de récupération du catalogue :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔴 PUT : Toggle active listing (Désactivation / Réactivation d'une annonce)
export async function PUT(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { productId, is_active } = await req.json();

    if (productId === undefined || is_active === undefined) {
      return NextResponse.json({ error: "Les champs 'productId' et 'is_active' sont requis." }, { status: 400 });
    }

    const targetProductId = parseInt(productId);

    const product = await prisma.product.findUnique({
      where: { id: targetProductId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Article introuvable dans le catalogue." }, { status: 404 });
    }

    // Exécution de l'action de modération
    await prisma.$transaction(async (tx) => {
      // 1. Modifier l'état de l'annonce
      await tx.product.update({
        where: { id: targetProductId },
        data: { is_active: is_active }
      });

      // 2. Enregistrer dans l'audit log
      await tx.adminLog.create({
        data: {
          adminId: adminCheck.id!,
          adminEmail: adminCheck.admin!.email,
          action: is_active ? "CATALOG_PRODUCT_ACTIVATE" : "CATALOG_PRODUCT_DEACTIVATE",
          targetId: targetProductId,
          metadata: {
            productTitle: product.title,
            sellerEmail: product.user.email,
            reason: is_active ? "Réactivation manuelle" : "Infraction aux conditions d'utilisation (suspension produit)"
          }
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: is_active ? "Annonce réactivée et visible en boutique." : "Annonce suspendue du catalogue et retirée de la vente.",
      is_active 
    });

  } catch (error: any) {
    console.error("Erreur de modification d'activité du produit :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
