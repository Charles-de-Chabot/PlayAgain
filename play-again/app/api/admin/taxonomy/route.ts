import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

// 🟢 GET : Récupérer toute la taxonomie, les marques et les règles d'expertise
export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // 1. Récupérer toutes les marques avec le compte des produits associés
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { label: "asc" }
    });

    // 2. Récupérer toutes les catégories
    const categories = await prisma.category.findMany({
      orderBy: { label: "asc" }
    });

    // 3. Récupérer toutes les règles d'expertise IA de la table BrandExpertise
    const brandExpertises = await prisma.brandExpertise.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      brands: brands.map(b => ({
        id: b.id,
        label: b.label,
        marketPosition: b.marketPosition,
        productCount: b._count.products
      })),
      categories,
      brandExpertises
    });
  } catch (error: any) {
    console.error("Erreur de récupération de la taxonomie :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔵 POST : Créer ou mettre à jour directement une marque (ex: pour forcer un statut de marché)
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { label, marketPosition } = await req.json();

    if (!label || !label.trim()) {
      return NextResponse.json({ error: "Le libellé de la marque est requis." }, { status: 400 });
    }

    // Vérifier si la marque existe déjà
    const existing = await prisma.brand.findFirst({
      where: { label: { equals: label.trim() } }
    });

    if (existing) {
      return NextResponse.json({ error: "Cette marque existe déjà dans le système." }, { status: 400 });
    }

    const newBrand = await prisma.brand.create({
      data: {
        label: label.trim(),
        marketPosition: marketPosition || "GENERALIST"
      }
    });

    // Enregistrer le log
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "BRAND_CREATED",
        targetId: newBrand.id,
        metadata: {
          label: newBrand.label,
          marketPosition: newBrand.marketPosition
        }
      }
    });

    return NextResponse.json({ success: true, brand: newBrand });
  } catch (error: any) {
    console.error("Erreur de création de la marque :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
