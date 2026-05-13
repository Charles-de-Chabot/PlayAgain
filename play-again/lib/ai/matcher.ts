import { getTheoreticalLevel } from "./brandRegistry";
import { aiService } from "./aiService";
import prisma from "@/lib/prisma";

export interface MatchResult {
  score: number;       // 0 to 100
  isRecommended: boolean;
  explanation: string;
  detectedLevel: string;
}

/**
 * Descriptions types pour calibrer l'IA sur les niveaux
 */
const LEVEL_TEMPLATES: Record<string, string> = {
  "BEGINNER": "Matériel facile, tolérant, idéal pour apprendre, souple, loisir, débutant, initiation, premier achat, pas cher, accessible, confort, sécurité.",
  "INTERMEDIATE": "Matériel polyvalent, progression, confort et contrôle, régulier, milieu de gamme, équilibré, loisir actif, sportif occasionnel.",
  "ADVANCED": "Matériel performant, technique, exigeant, rigide, pratique intensive, confirmé, expert, carbone, haut de gamme, réactivité, précision.",
  "PRO": "Matériel de compétition, expert, ultra-rigide, performance maximale, racing, professionnel, coupe du monde, élite, fis, s-works, ultra-léger, carbone haut module."
};

/**
 * Analyse un produit pour apprendre sa gamme et son niveau si inconnu
 * Cette fonction peut être appelée à la création du produit pour "pré-calculer" la connaissance.
 */
export async function learnProductExpertise(product: any) {
  const brandName = product.brand?.name || product.brand?.label || "";
  const productText = `${product.title} ${product.description}`;

  // 1. On vérifie si on connaît déjà via le registre statique
  const registryLevel = getTheoreticalLevel(brandName, productText);
  if (registryLevel) return registryLevel;

  // 2. On vérifie en base de données
  try {
    const learnedExpertise = await prisma.brandExpertise.findFirst({
      where: {
        brandName: brandName.toUpperCase(),
        rangeName: {
          in: product.title.toUpperCase().split(' ')
        }
      }
    });
    if (learnedExpertise) return learnedExpertise.level;
  } catch (error) {
    console.error("⚠️ [Matcher] Erreur accès DB (BrandExpertise):", error);
  }

  // 3. Sinon, on lance l'IA pour apprendre
  try {
    const productEmbed = await aiService.getEmbedding(productText);
    let maxSim = -1;
    let detectedLevel = "INTERMEDIATE";

    for (const [level, template] of Object.entries(LEVEL_TEMPLATES)) {
      const templateEmbed = await aiService.getEmbedding(template);
      const sim = aiService.cosineSimilarity(productEmbed, templateEmbed);
      if (sim > maxSim) {
        maxSim = sim;
        detectedLevel = level;
      }
    }

    // Si l'IA est assez sûre, on mémorise
    if (maxSim > 0.50 && brandName) {
      const words = product.title.split(' ');
      const potentialRange = words.length > 1 ? words[1].toUpperCase() : "GENERAL";

      await prisma.brandExpertise.upsert({
        where: { brandName_rangeName: { brandName: brandName.toUpperCase(), rangeName: potentialRange } },
        update: {},
        create: {
          brandName: brandName.toUpperCase(),
          rangeName: potentialRange,
          level: detectedLevel as any,
          confidence: maxSim
        }
      }).catch((e: any) => console.error("❌ [AI Learning] Échec sauvegarde DB:", e));
      
      console.log(`✨ [Apprentissage] Nouvelle gamme apprise : ${brandName} ${potentialRange} -> ${detectedLevel}`);
    }

    return detectedLevel;
  } catch (error) {
    console.error("⚠️ [Matcher] Échec de l'apprentissage IA:", error);
    return "INTERMEDIATE";
  }
}

/**
 * Calcule le matching entre un profil utilisateur et un produit
 */
export async function calculateMatch(userProfile: any, product: any): Promise<MatchResult> {
  // On utilise notre nouvelle fonction d'apprentissage/récupération
  const finalLevel = await learnProductExpertise(product);
  
  // 4. Comparaison avec le profil utilisateur
  const userLevel = userProfile.level;
  
  const levelValues: Record<string, number> = { "BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3, "PRO": 4 };
  const userVal = levelValues[userLevel] || 2;
  const prodVal = levelValues[finalLevel] || 2;

  const diff = prodVal - userVal;
  const absDiff = Math.abs(diff);
  
  // Calcul linéaire : 100% - (20% * écart)
  let score = Math.max(100 - (absDiff * 20), 0);
  let explanation = "Match parfait ! Ce matériel correspond exactement à ton profil.";

  if (diff === 1) {
    explanation = "Excellent choix pour progresser. Ce matériel te poussera à franchir un nouveau palier.";
  } else if (diff === 2) {
    explanation = "Attention, ce matériel est très technique et risque d'être difficile à maîtriser.";
  } else if (diff >= 3) {
    explanation = "Matériel réservé aux experts. Trop exigeant et potentiellement dangereux pour ton niveau actuel.";
  } else if (diff === -1) {
    explanation = "Matériel très accessible pour toi. Idéal pour une pratique loisir sans contrainte technique.";
  } else if (diff === -2) {
    explanation = "Ce matériel est techniquement limité par rapport à tes capacités. Tu risques de t'ennuyer.";
  } else if (diff <= -3) {
    explanation = "Ce matériel est totalement inadapté à ton niveau. Trop basique pour tes besoins de performance.";
  }

  // 5. Ajustement selon l'état du produit pour les experts
  if (userVal >= 3) {
    if (product.state === "SATISFAISANT") {
      score -= 15;
      explanation += " Note : L'état 'Satisfaisant' pourrait limiter tes performances.";
    } else if (product.state === "BON") {
      score -= 5;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    isRecommended: score >= 70,
    explanation,
    detectedLevel: finalLevel
  };
}
