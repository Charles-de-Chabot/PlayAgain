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

// Nous pouvons simuler ou stocker les métadonnées SEO. Pour stocker de manière dynamique et 100% robuste,
// nous pouvons utiliser un modèle existant ou stocker cela de manière structurée.
// Comme nous avons un modèle de données MySQL flexible, nous pouvons stocker les SEO configurations 
// dans une table dédiée ou sous forme de config système. Pour assurer la compatibilité immédiate avec le schéma existant 
// sans nécessiter une autre migration complexe, nous pouvons soit :
// 1. Sauvegarder dans un fichier JSON partagé `play-again/config/seo.json` de manière persistante.
// C'est extrêmement rapide, 100% stable, n'impacte pas le schéma SQL et s'intègre à merveille dans un workflow Next.js !
// Faisons cela ! C'est une excellente pratique d'ingénierie web.

import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config", "seo.json");

function getSeoConfig() {
  try {
    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    if (!fs.existsSync(configPath)) {
      const defaultConfigs = {
        home: {
          title: "PlayAgain - Matériel de Sport de Seconde Main Certifié",
          description: "Achetez et vendez vos raquettes de tennis, clubs de golf, vélos et matériel de sport d'occasion. Certifié par nos experts et IA.",
          keywords: "sport, occasion, seconde main, tennis, golf, padel, pas cher, reconditionne"
        },
        shop: {
          title: "Catalogue d'Équipement de Sport d'Occasion - PlayAgain",
          description: "Parcourez notre large sélection d'articles de sport d'occasion : tennis, golf, vélos, et bien plus encore.",
          keywords: "sport, occasion, catalogue, matériel, seconde main"
        },
        profile: {
          title: "Mon Espace Sportif - PlayAgain",
          description: "Gérez votre profil sportif, vos annonces, vos achats et vos ventes d'équipements de sport.",
          keywords: "profil, compte, ventes, achats, sport, d'occasion"
        },
        login: {
          title: "Connexion à votre Compte - PlayAgain",
          description: "Connectez-vous à votre espace personnel PlayAgain pour acheter ou vendre du matériel de sport d'occasion.",
          keywords: "connexion, login, espace personnel, compte"
        },
        help: {
          title: "Centre d'Aide & Support - PlayAgain",
          description: "Trouvez des réponses à toutes vos questions sur l'achat, la vente et la sécurité sur PlayAgain.",
          keywords: "aide, FAQ, support, service client, questions"
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfigs, null, 2), "utf8");
      return defaultConfigs;
    }
    const content = fs.readFileSync(configPath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error(e);
    return {};
  }
}

function saveSeoConfig(configs: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(configs, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// 🟢 GET : Récupère les configs SEO enregistrées
export async function GET() {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const configs = getSeoConfig();
    return NextResponse.json({ success: true, configs });
  } catch (e) {
    return NextResponse.json({ error: "Impossible de lire la configuration SEO." }, { status: 500 });
  }
}

// 🔵 POST : Met à jour la config SEO d'une page
export async function POST(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { pageKey, title, description, keywords } = await req.json();

    if (!pageKey || !title || !description || !keywords) {
      return NextResponse.json({ error: "Tous les champs ('pageKey', 'title', 'description', 'keywords') sont requis." }, { status: 400 });
    }

    const configs = getSeoConfig();
    configs[pageKey] = {
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.trim()
    };

    const saved = saveSeoConfig(configs);
    if (!saved) {
      return NextResponse.json({ error: "Échec d'écriture de la configuration sur le serveur." }, { status: 500 });
    }

    // Logger l'action
    await prisma.adminLog.create({
      data: {
        adminId: adminCheck.id!,
        adminEmail: adminCheck.admin!.email,
        action: "SEO_METADATA_UPDATE",
        metadata: {
          pageKey,
          titleLength: title.length,
          descriptionLength: description.length
        }
      }
    });

    return NextResponse.json({ success: true, message: "Configuration SEO mise à jour avec succès.", configs });

  } catch (error: any) {
    console.error("Erreur de sauvegarde SEO :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
