import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Sécurité : Vérification de la clé secrète du Cron Job
    const { searchParams } = new URL(req.url);
    const urlSecret = searchParams.get("secret");
    
    const authHeader = req.headers.get("Authorization");
    const headerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    const expectedSecret = process.env.CRON_SECRET || "PLAYAGAIN_CRON_SECRET";

    if (urlSecret !== expectedSecret && headerSecret !== expectedSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Requête logique pour récupérer les factures arrivées à échéance (DELIVERED depuis plus de 48 heures sans litige)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const matureInvoices = await prisma.invoice.findMany({
      where: {
        status: "DELIVERED",
        is_disputed: false,
        delivered_at: {
          lt: fortyEightHoursAgo,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (matureInvoices.length === 0) {
      return NextResponse.json({ success: true, message: "Aucune facture arrivée à échéance de 48h." });
    }

    const results = [];

    // 3. Traitement par lot (Batch processing)
    for (const invoice of matureInvoices) {
      const item = invoice.items[0];
      if (!item) continue;

      try {
        await prisma.$transaction(async (tx) => {
          // A. Passer le statut à COMPLETED
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: "COMPLETED" },
          });

          // B. Trouver la conversation correspondante
          let conversation = await tx.conversation.findFirst({
            where: {
              user_id: invoice.user_id, // Acheteur
              product_id: item.product_id,
            },
          });

          if (!conversation) {
            conversation = await tx.conversation.create({
              data: {
                user_id: invoice.user_id,
                product_id: item.product_id,
              },
            });
          }

          // C. Publier un message automatique de déblocage des fonds
          await tx.message.create({
            data: {
              content: `🛡️ Protection Acheteur expirée (Délai de sécurité de 48 heures écoulé). Les fonds d'un montant de **${item.unit_price} €** pour l'équipement sportif **${item.product.title}** ont été automatiquement libérés et versés au vendeur. La discussion est désormais fermée en lecture seule.`,
              user_id: item.product.user_id, // Vendeur
              conversation_id: conversation.id,
              metadata: {
                type: "SYSTEM",
              },
            },
          });
        });

        results.push({ id: invoice.id, success: true });
      } catch (err: any) {
        console.error(`Erreur lors de la libération automatique pour la facture #${invoice.id}:`, err);
        results.push({ id: invoice.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("Erreur générale lors de l'exécution du Cron Job de séquestre :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// On supporte également le GET pour faciliter le déclenchement par certains planificateurs simplifiés
export async function GET(req: Request) {
  return POST(req);
}
