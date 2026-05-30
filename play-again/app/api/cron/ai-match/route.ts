import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateMatch } from "@/lib/ai/matcher";
import { createNotification } from "@/app/actions/notification";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Sécurité : Vérification du secret du Cron
    const { searchParams } = new URL(req.url);
    const urlSecret = searchParams.get("secret");
    
    const authHeader = req.headers.get("Authorization");
    const headerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    const expectedSecret = process.env.CRON_SECRET || "PLAYAGAIN_CRON_SECRET";

    if (urlSecret !== expectedSecret && headerSecret !== expectedSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("⚡ [Cron Match IA] Lancement du traitement quotidien...");

    // 2. Récupération de tous les produits tiers actifs et non vendus de la plateforme
    const activeProducts = await prisma.product.findMany({
      where: {
        is_sold: false,
        is_active: true,
        user: {
          stripeConnectId: {
            not: null, // Que les produits dont le vendeur est vérifié
          },
        },
      },
      include: {
        category: true,
        media: true,
        brand: true,
        type: true,
      },
    });

    if (activeProducts.length === 0) {
      console.log("ℹ️ [Cron Match IA] Aucun produit actif sur la plateforme.");
      return NextResponse.json({ success: true, message: "Aucun produit actif." });
    }

    // 3. Récupération de tous les utilisateurs disposant d'un profil sportif
    const usersWithProfiles = await prisma.user.findMany({
      where: {
        sportProfile: {
          isNot: null,
        },
      },
      include: {
        sportProfile: {
          include: {
            skills: true,
          },
        },
      },
    });

    if (usersWithProfiles.length === 0) {
      console.log("ℹ️ [Cron Match IA] Aucun profil de sportif à analyser.");
      return NextResponse.json({ success: true, message: "Aucun profil sportif trouvé." });
    }

    console.log(`📊 [Cron Match IA] Analyse de ${activeProducts.length} produits pour ${usersWithProfiles.length} sportifs...`);

    const results = [];
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);

    // 4. Parcourir chaque profil de sportif
    for (const user of usersWithProfiles) {
      const sportProfile = user.sportProfile;
      if (!sportProfile) continue;

      // Limitation anti-spam : Un seul message AI Match toutes les 20 heures
      const sentRecently = await prisma.notification.findFirst({
        where: {
          user_id: user.id,
          type: "AI_MATCH",
          created_at: {
            gte: twentyHoursAgo,
          },
        },
      });

      if (sentRecently) {
        console.log(`⏭️ [Cron Match IA] Notification déjà envoyée récemment pour l'utilisateur #${user.id} (${user.username}).`);
        continue;
      }

      const matchedGear = [];

      // Calculer le match pour chaque produit (en excluant ses propres produits)
      for (const product of activeProducts) {
        if (product.user_id === user.id) continue;

        try {
          const matchResult = await calculateMatch(sportProfile, product);
          
          // Seuil demandé de plus de 90% (score >= 90)
          if (matchResult.score >= 90) {
            matchedGear.push({
              productId: product.id,
              title: product.title,
              score: matchResult.score,
              productImageUrl: product.media?.[0]?.url || null,
            });
          }
        } catch (matchErr) {
          console.error(`❌ [Cron Match IA] Erreur de calcul pour le sportif #${user.id} et produit #${product.id}:`, matchErr);
        }
      }

      // 5. Si des correspondances de haute qualité (>=90%) existent, notifier l'utilisateur
      if (matchedGear.length > 0) {
        const count = matchedGear.length;
        const firstMatch = matchedGear[0];
        const productImageUrl = firstMatch.productImageUrl;

        let message = "";
        if (count === 1) {
          message = `⚡ Match IA : L'équipement "${firstMatch.title}" correspond à ${firstMatch.score}% à votre niveau de sport !`;
        } else {
          message = `⚡ Match IA : ${count} équipements sportifs correspondent à plus de 90% à votre profil de sportif !`;
        }

        try {
          await createNotification({
            userId: user.id,
            type: "AI_MATCH",
            message,
            metadata: {
              redirectUrl: "/shop?playmatch=90",
              productId: firstMatch.productId,
              productImageUrl,
              matchedCount: count,
            },
          });

          results.push({
            userId: user.id,
            username: user.username,
            matchesFound: count,
            notified: true,
          });

          console.log(`✉️ [Cron Match IA] Notification envoyée à #${user.id} (${user.username}) pour ${count} produit(s).`);
        } catch (notifErr) {
          console.error(`❌ [Cron Match IA] Échec de l'envoi de notification pour #${user.id}:`, notifErr);
        }
      } else {
        results.push({
          userId: user.id,
          username: user.username,
          matchesFound: 0,
          notified: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      scannedUsersCount: usersWithProfiles.length,
      scannedProductsCount: activeProducts.length,
      notificationsSentCount: results.filter(r => r.notified).length,
      details: results,
    });

  } catch (error: any) {
    console.error("❌ [Cron Match IA] Erreur générale :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// Support du GET pour les planificateurs simplifiés ou les tests directs sur navigateur
export async function GET(req: Request) {
  return POST(req);
}
