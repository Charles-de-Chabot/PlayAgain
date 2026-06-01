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

// 🟢 POST : Diffuser massivement le coupon à tous les utilisateurs
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { couponId } = await req.json();

    if (!couponId) {
      return NextResponse.json({ error: "Le champ 'couponId' est requis." }, { status: 400 });
    }

    // 1. Récupérer le coupon
    const coupon = await prisma.promoCode.findUnique({
      where: { id: parseInt(couponId) }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon introuvable." }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Impossible de diffuser un coupon inactif." }, { status: 400 });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Impossible de diffuser un coupon expiré." }, { status: 400 });
    }

    // 2. Récupérer les utilisateurs actifs
    const activeUsers = await prisma.user.findMany({
      where: { is_active: true },
      select: { id: true }
    });

    if (activeUsers.length === 0) {
      return NextResponse.json({ success: true, notifiedCount: 0, message: "Aucun utilisateur actif à notifier." });
    }

    // 3. Insérer les notifications massives
    const messageContent = `Fêtez le sport sur PlayAgain ! Bénéficiez de -${coupon.discountPercent}% sur vos achats (dès ${parseFloat(coupon.minBasketAmount.toString()).toFixed(2)}€ d'achat) avec le code unique : ${coupon.code}`;

    await prisma.notification.createMany({
      data: activeUsers.map(u => ({
        user_id: u.id,
        type: "PROMO_CODE",
        message: messageContent,
        metadata: {
          promoCode: coupon.code,
          discountPercent: coupon.discountPercent,
          minBasketAmount: coupon.minBasketAmount
        },
        is_opened: false
      }))
    });

    // 4. Enregistrer dans l'audit log
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "PROMO_CODE_BROADCAST",
        targetId: coupon.id,
        metadata: {
          code: coupon.code,
          notifiedCount: activeUsers.length
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      notifiedCount: activeUsers.length,
      message: `Offre promotionnelle diffusée avec succès auprès de ${activeUsers.length} utilisateurs actifs.` 
    });

  } catch (error: any) {
    console.error("Erreur lors de la diffusion du coupon :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
