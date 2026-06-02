import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    console.log("DEBUG [Fraud API] session:", session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
    }

    const adminId = parseInt(session.user.id);
    console.log("DEBUG [Fraud API] adminId parsed:", adminId);

    if (isNaN(adminId)) {
      return NextResponse.json({ error: `ID utilisateur non valide (NaN). Reçu: ${session.user.id}` }, { status: 400 });
    }

    // Vérification du rôle ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId }
    });
    console.log("DEBUG [Fraud API] adminUser from DB:", adminUser);

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ 
        error: `Accès refusé. Rôle requis: ADMIN. Rôle en base de données: ${adminUser?.role || 'aucun'} (ID: ${adminId})` 
      }, { status: 403 });
    }

    // 1. Détection des collisions par Adresse IP (Via la nouvelle table UserActivityLog)
    let ipCollisions: any[] = [];
    try {
      const logs = await prisma.userActivityLog.findMany({
        select: {
          ipAddress: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              is_active: true,
            }
          }
        }
      });

      const ipGroups: Record<string, Map<number, { id: number; email: string; username: string | null; is_active: boolean }>> = {};
      for (const log of logs) {
        if (!ipGroups[log.ipAddress]) {
          ipGroups[log.ipAddress] = new Map();
        }
        ipGroups[log.ipAddress].set(log.user.id, {
          id: log.user.id,
          email: log.user.email,
          username: log.user.username,
          is_active: log.user.is_active,
        });
      }

      ipCollisions = Object.entries(ipGroups)
        .map(([ipAddress, userMap]) => ({
          ipAddress,
          users: Array.from(userMap.values())
        }))
        .filter(group => group.users.length > 1);
    } catch (dbErr) {
      console.warn("UserActivityLog not fully migrated yet or empty:", dbErr);
    }

    // 2. Détection des collisions par ID Stripe Connect
    const sellers = await prisma.user.findMany({
      where: {
        stripeConnectId: { not: null }
      },
      select: {
        id: true,
        email: true,
        username: true,
        stripeConnectId: true,
        is_active: true,
      }
    });

    const stripeGroups: Record<string, typeof sellers> = {};
    for (const seller of sellers) {
      const stripeId = seller.stripeConnectId!;
      if (!stripeGroups[stripeId]) {
        stripeGroups[stripeId] = [];
      }
      stripeGroups[stripeId].push(seller);
    }

    const stripeCollisions = Object.entries(stripeGroups)
      .map(([stripeConnectId, users]) => ({
        stripeConnectId,
        users
      }))
      .filter(group => group.users.length > 1);

    // 3. Détection des collisions par Numéro de Téléphone
    const usersWithPhone = await prisma.user.findMany({
      where: {
        phone: { not: null }
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        is_active: true,
      }
    });

    const phoneGroups: Record<string, typeof usersWithPhone> = {};
    for (const u of usersWithPhone) {
      const phone = u.phone!.trim();
      if (!phone) continue;
      if (!phoneGroups[phone]) {
        phoneGroups[phone] = [];
      }
      phoneGroups[phone].push(u);
    }

    const phoneCollisions = Object.entries(phoneGroups)
      .map(([phone, users]) => ({
        phone,
        users
      }))
      .filter(group => group.users.length > 1);

    return NextResponse.json({
      ipCollisions,
      stripeCollisions,
      phoneCollisions
    });

  } catch (error: any) {
    console.error("Erreur dans l'API de détection de fraude :", error);
    return NextResponse.json({ error: error.message || "Une erreur interne est survenue." }, { status: 500 });
  }
}
