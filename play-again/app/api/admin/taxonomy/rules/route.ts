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

// 🔵 POST : Créer ou mettre à jour (upsert) une règle d'expertise IA
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { brandName, rangeName, level, confidence } = await req.json();

    if (!brandName || !brandName.trim() || !rangeName || !rangeName.trim() || !level) {
      return NextResponse.json({ error: "Marque, gamme et niveau technique requis." }, { status: 400 });
    }

    const cleanBrandName = brandName.toUpperCase().trim();
    const cleanRangeName = rangeName.toUpperCase().trim();

    // Vérifier que le niveau est bien une valeur de SportLevel
    const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Niveau de sport invalide. Doit être BEGINNER, INTERMEDIATE, ADVANCED ou PRO." }, { status: 400 });
    }

    const ruleConfidence = confidence !== undefined ? parseFloat(confidence) : 1.0;

    // Upsert de la règle d'expertise IA
    const updatedRule = await prisma.brandExpertise.upsert({
      where: {
        brandName_rangeName: {
          brandName: cleanBrandName,
          rangeName: cleanRangeName
        }
      },
      update: {
        level: level,
        confidence: ruleConfidence
      },
      create: {
        brandName: cleanBrandName,
        rangeName: cleanRangeName,
        level: level,
        confidence: ruleConfidence
      }
    });

    // Enregistrer dans le journal d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "AI_RULE_UPSERT",
        targetId: updatedRule.id,
        metadata: {
          brandName: cleanBrandName,
          rangeName: cleanRangeName,
          level: level,
          confidence: ruleConfidence
        }
      }
    });

    return NextResponse.json({
      success: true,
      rule: updatedRule,
      message: "La règle d'expertise IA a été injectée et verrouillée avec succès."
    });
  } catch (error: any) {
    console.error("Erreur de sauvegarde de la règle d'expertise IA :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

// 🔴 DELETE : Supprimer une règle d'expertise IA
export async function DELETE(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const brandNameParam = searchParams.get("brandName");
    const rangeNameParam = searchParams.get("rangeName");

    if (!idParam && (!brandNameParam || !rangeNameParam)) {
      return NextResponse.json({ error: "Veuillez fournir l'identifiant de la règle ou le couple marque/gamme." }, { status: 400 });
    }

    let deletedRule;

    if (idParam) {
      const id = parseInt(idParam);
      // Récupérer d'abord pour le log d'audit
      const rule = await prisma.brandExpertise.findUnique({ where: { id } });
      if (!rule) {
        return NextResponse.json({ error: "Règle introuvable." }, { status: 404 });
      }

      deletedRule = await prisma.brandExpertise.delete({ where: { id } });
    } else {
      const brandName = brandNameParam!.toUpperCase().trim();
      const rangeName = rangeNameParam!.toUpperCase().trim();

      const rule = await prisma.brandExpertise.findUnique({
        where: { brandName_rangeName: { brandName, rangeName } }
      });

      if (!rule) {
        return NextResponse.json({ error: "Règle introuvable." }, { status: 404 });
      }

      deletedRule = await prisma.brandExpertise.delete({
        where: { brandName_rangeName: { brandName, rangeName } }
      });
    }

    // Enregistrer dans le journal d'audit
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "AI_RULE_DELETED",
        targetId: deletedRule.id,
        metadata: {
          brandName: deletedRule.brandName,
          rangeName: deletedRule.rangeName,
          level: deletedRule.level
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Règle d'expertise IA supprimée avec succès."
    });
  } catch (error: any) {
    console.error("Erreur de suppression de la règle d'expertise IA :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
