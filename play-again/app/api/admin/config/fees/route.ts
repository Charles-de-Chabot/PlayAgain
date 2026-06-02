import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSystemConfig, setSystemConfig, DEFAULT_FINANCE_FEE_RULES, FinanceFeeRules } from "@/lib/systemConfig";

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

// 🟢 GET : Récupère la configuration des commissions actuelle et l'historique
export async function GET() {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const config = await getSystemConfig<FinanceFeeRules>("FINANCE_FEE_RULES", DEFAULT_FINANCE_FEE_RULES);
    
    // Récupérer l'historique des modifications depuis AdminLog
    const history = await prisma.adminLog.findMany({
      where: { action: "FINANCE_FEE_RULES_UPDATE" },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ 
      success: true, 
      config,
      history
    });
  } catch (error: any) {
    console.error("Erreur GET dynamic fees:", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔵 POST : Met à jour la configuration des commissions
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await req.json();
    const { commissionRate, flatFee } = body;

    if (commissionRate === undefined || flatFee === undefined) {
      return NextResponse.json({ error: "Les champs 'commissionRate' et 'flatFee' sont requis." }, { status: 400 });
    }

    const rate = parseFloat(commissionRate);
    const fee = parseFloat(flatFee);

    if (isNaN(rate) || isNaN(fee) || rate < 0 || fee < 0) {
      return NextResponse.json({ error: "Les valeurs saisies doivent être des nombres positifs." }, { status: 400 });
    }

    const updated = await setSystemConfig<FinanceFeeRules>("FINANCE_FEE_RULES", {
      commissionRate: rate,
      flatFee: fee
    });

    if (!updated) {
      return NextResponse.json({ error: "Échec de l'enregistrement de la configuration." }, { status: 500 });
    }

    // Logger l'action dans le journal d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "FINANCE_FEE_RULES_UPDATE",
        metadata: {
          commissionRate: rate,
          flatFee: fee
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Configuration financière mise à jour avec succès.",
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Erreur POST config fees:", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
