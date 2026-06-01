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

// 🟢 GET : Liste tous les codes de réduction avec scope catégorie et type
export async function GET() {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const coupons = await prisma.promoCode.findMany({
      include: {
        category: true,
        type: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Erreur de récupération des coupons :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔵 POST : Créer un nouveau code promo
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { code, discountPercent, minBasketAmount, expiresAt, categoryId, typeId } = await req.json();

    if (!code || !discountPercent || !minBasketAmount || !expiresAt) {
      return NextResponse.json({ error: "Tous les champs ('code', 'discountPercent', 'minBasketAmount', 'expiresAt') sont requis." }, { status: 400 });
    }

    // Vérifier l'unicité du code
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCode) {
      return NextResponse.json({ error: "Ce code promo existe déjà." }, { status: 400 });
    }

    const newCoupon = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: parseInt(discountPercent),
        minBasketAmount: parseFloat(minBasketAmount),
        expiresAt: new Date(expiresAt),
        isActive: true,
        categoryId: categoryId ? parseInt(categoryId) : null,
        typeId: typeId ? parseInt(typeId) : null
      },
      include: {
        category: true,
        type: true
      }
    });

    // Enregistrer dans les logs d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "PROMO_CODE_CREATED",
        targetId: newCoupon.id,
        metadata: {
          code: newCoupon.code,
          discountPercent: newCoupon.discountPercent,
          minBasketAmount: newCoupon.minBasketAmount,
          categoryScope: newCoupon.category?.label || "Tous",
          typeScope: newCoupon.type?.label || "Tous"
        }
      }
    });

    return NextResponse.json({ success: true, coupon: newCoupon, message: "Code promotionnel créé avec succès." });

  } catch (error: any) {
    console.error("Erreur de création du coupon :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
