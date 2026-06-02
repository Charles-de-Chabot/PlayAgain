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

// 🔵 POST : Fusionner une marque provisoire mal orthographiée vers la marque principale cible
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { provisionalBrandId, targetBrandId } = await req.json();

    if (!provisionalBrandId || !targetBrandId) {
      return NextResponse.json({ error: "Les identifiants des deux marques sont requis." }, { status: 400 });
    }

    const provId = parseInt(provisionalBrandId);
    const targetId = parseInt(targetBrandId);

    if (provId === targetId) {
      return NextResponse.json({ error: "Impossible de fusionner une marque avec elle-même." }, { status: 400 });
    }

    // Vérifier l'existence des deux marques
    const provisionalBrand = await prisma.brand.findUnique({ where: { id: provId } });
    const targetBrand = await prisma.brand.findUnique({ where: { id: targetId } });

    if (!provisionalBrand) {
      return NextResponse.json({ error: "Marque source introuvable." }, { status: 404 });
    }

    if (!targetBrand) {
      return NextResponse.json({ error: "Marque cible introuvable." }, { status: 404 });
    }

    // Réaliser la fusion en transaction Prisma
    let updatedProductsCount = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Réassocier toutes les fiches produits vers la marque correcte officielle
      const updateResult = await tx.product.updateMany({
        where: { brand_id: provId },
        data: { brand_id: targetId }
      });
      updatedProductsCount = updateResult.count;

      // 2. Supprimer la marque doublon
      await tx.brand.delete({
        where: { id: provId }
      });
    });

    // Enregistrer l'action dans le journal d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "BRAND_MERGE",
        targetId: targetId,
        metadata: {
          provisionalBrandLabel: provisionalBrand.label,
          targetBrandLabel: targetBrand.label,
          updatedProductsCount
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `La marque "${provisionalBrand.label}" a été fusionnée avec "${targetBrand.label}". ${updatedProductsCount} annonce(s) corrigée(s) et le doublon supprimé.`
    });
  } catch (error: any) {
    console.error("Erreur lors de la fusion des marques :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue lors de la fusion." }, { status: 500 });
  }
}
