import { getTheoreticalLevel } from "./brandRegistry";
import { aiService } from "./aiService";
import prisma from "@/lib/prisma";

export interface MatchResult {
  score: number;       // 0 to 100
  isRecommended: boolean;
  explanation: string;
  detectedLevel: string;
  levelAdvice?: string;
  priceAdvice?: string;
}

/**
 * Descriptions types pour calibrer l'IA sur les niveaux
 */
const LEVEL_TEMPLATES: Record<string, string> = {
  "BEGINNER": "Matériel facile, tolérant, idéal pour débuter et apprendre, souple, maniable, léger, loisir, débutant, initiation, premier achat, pas cher, accessible, confort, sécurité, tolérance aux erreurs, évolutif, découverte, première main, enfant, junior, d'apprentissage.",
  "INTERMEDIATE": "Matériel polyvalent, progression, confort et contrôle, régulier, milieu de gamme, équilibré, loisir actif, sportif occasionnel, perfectionnement, polyvalence tout terrain, dynamique, confort de glisse, évolutif.",
  "ADVANCED": "Matériel performant, technique, exigeant, rigide, pratique intensive, confirmé, expert, carbone, haut de gamme, réactivité, précision, stabilité à haute vitesse, transmission d'énergie, engagé, rigueur, robuste.",
  "PRO": "Matériel de compétition, expert, ultra-rigide, performance maximale, racing, professionnel, coupe du monde, élite, fis, s-works, ultra-léger, carbone haut module, athlète, circuit mondial, performance sans concession, vitesse pure, course, pro."
};

const GENERIC_WORDS = new Set([
  "CHAUSSURES", "CHAUSSURE", "SKIS", "SKI", "MASQUE", "LUNETTES", "LUNETTE", "CASQUE", 
  "GANTS", "GANT", "PANTALON", "VESTE", "RAQUETTE", "RAQUETTES", "BALLES", "BALLE", 
  "SAC", "SACS", "VELO", "VÉLO", "COMBINAISON", "DE", "DU", "DES", "LE", "LA", "LES", "POUR", "EN"
]);

/**
 * Extrait le nom exact de la gamme du produit en filtrant la marque et les mots génériques.
 */
export function extractProductRange(title: string, brandName: string): string {
  const cleanBrand = brandName.toUpperCase();
  let cleanTitle = title.toUpperCase();
  
  if (cleanBrand) {
    cleanTitle = cleanTitle.replace(new RegExp(cleanBrand, "g"), "");
  }
  
  const words = cleanTitle.split(/[\s,./_#-]+/).filter(w => {
    const word = w.trim();
    return word.length > 0 && !GENERIC_WORDS.has(word);
  });
  
  return words.length > 0 ? words[0] : "GENERAL";
}

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

  // --- NOUVEAU: Détecteur heuristique intelligent de niveau (Exécuté avant la DB pour corriger les anciennes erreurs) ---
  const lowerTitle = product.title.toLowerCase();
  const lowerDesc = (product.description || "").toLowerCase();
  const lowerText = `${lowerTitle} ${lowerDesc}`;

  let heuristicLevel: string | null = null;

  // Détection prioritaire Junior / Débutant / Expression "graine de champion"
  const isJuniorOrBeginner = 
    lowerText.includes("graine de champion") ||
    lowerText.includes("comp j") ||
    /\bj[1-4]\b/.test(lowerText) || // j1, j2, j3, j4
    lowerText.includes("junior") ||
    lowerText.includes("enfant") ||
    lowerText.includes("kid") ||
    lowerText.includes("initiation") ||
    lowerText.includes("débutant") ||
    lowerText.includes("debutant") ||
    lowerText.includes("loisir");

  if (isJuniorOrBeginner) {
    if (lowerText.includes("comp j4") || lowerText.includes("progression")) {
      heuristicLevel = "INTERMEDIATE";
    } else {
      heuristicLevel = "BEGINNER";
    }
  } else if (lowerText.includes("intermédiaire") || lowerText.includes("intermediaire") || lowerText.includes("progression")) {
    heuristicLevel = "INTERMEDIATE";
  }

  if (heuristicLevel) {
    // Si on a détecté un niveau de sécurité via nos heuristiques prioritaires, on le mémorise directement en base pour écraser/corriger toute mauvaise détection
    if (brandName) {
      const productRange = extractProductRange(product.title, brandName);
      
      await prisma.brandExpertise.upsert({
        where: { brandName_rangeName: { brandName: brandName.toUpperCase(), rangeName: productRange } },
        update: { level: heuristicLevel as any },
        create: {
          brandName: brandName.toUpperCase(),
          rangeName: productRange,
          level: heuristicLevel as any,
          confidence: 1.0
        }
      }).catch((e: any) => console.error("❌ [AI Learning - Heuristic] Échec sauvegarde DB:", e));
    }
    return heuristicLevel;
  }

  // 2. On vérifie en base de données si pas de détection heuristique
  try {
    const productRange = extractProductRange(product.title, brandName);
    if (productRange !== "GENERAL") {
      const learnedExpertise = await prisma.brandExpertise.findUnique({
        where: {
          brandName_rangeName: {
            brandName: brandName.toUpperCase(),
            rangeName: productRange
          }
        }
      });
      if (learnedExpertise) return learnedExpertise.level;
    }
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
    // Note : Le seuil de 0.50 a été ramené à 0.20 car les embeddings all-MiniLM-L6-v2 ont des similarités cosinus absolues plus basses
    // (généralement entre 0.15 et 0.35) lors de la comparaison de descriptions complexes avec des mots-clés de templates.
    if (maxSim > 0.20 && brandName) {
      const productRange = extractProductRange(product.title, brandName);

      await prisma.brandExpertise.upsert({
        where: { brandName_rangeName: { brandName: brandName.toUpperCase(), rangeName: productRange } },
        update: {},
        create: {
          brandName: brandName.toUpperCase(),
          rangeName: productRange,
          level: detectedLevel as any,
          confidence: maxSim
        }
      }).catch((e: any) => console.error("❌ [AI Learning] Échec sauvegarde DB:", e));
      
      console.log(`✨ [Apprentissage] Nouvelle gamme apprise : ${brandName} ${productRange} -> ${detectedLevel} (confiance: ${maxSim})`);
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
  
  // 4. Comparaison avec le profil utilisateur (en ciblant le niveau propre au sport s'il est spécifié)
  const productSport = product.category?.label?.trim().toUpperCase();
  let userLevel = userProfile.level;

  if (userProfile.skills && Array.isArray(userProfile.skills)) {
    const matchingSkill = userProfile.skills.find(
      (s: any) => s.sportName.trim().toUpperCase() === productSport
    );
    if (matchingSkill) {
      userLevel = matchingSkill.level;
    }
  }
  
  const levelValues: Record<string, number> = { "BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3, "PRO": 4 };
  const userVal = levelValues[userLevel] || 2;
  const prodVal = levelValues[finalLevel] || 2;

  const diff = prodVal - userVal;
  const absDiff = Math.abs(diff);
  
  // Calcul linéaire : 100% - (20% * écart)
  let score = Math.max(100 - (absDiff * 20), 0);
  let levelAdvice = "Match parfait ! Ce matériel correspond exactement à ton profil.";

  if (diff === 1) {
    levelAdvice = "Excellent choix pour progresser. Ce matériel te poussera à franchir un nouveau palier.";
  } else if (diff === 2) {
    levelAdvice = "Attention, ce matériel est très technique et risque d'être difficile à maîtriser.";
  } else if (diff >= 3) {
    levelAdvice = "Matériel réservé aux experts. Trop exigeant et potentiellement dangereux pour ton niveau actuel.";
  } else if (diff === -1) {
    levelAdvice = "Matériel très accessible pour toi. Idéal pour une pratique loisir sans contrainte technique.";
  } else if (diff === -2) {
    levelAdvice = "Ce matériel est techniquement limité par rapport à tes capacités. Tu risques de t'ennuyer.";
  } else if (diff <= -3) {
    levelAdvice = "Ce matériel est totalement inadapté à ton niveau. Trop basique pour tes besoins de performance.";
  }

  // 5. Ajustement selon l'état du produit pour les experts
  if (userVal >= 3) {
    if (product.state === "SATISFAISANT") {
      score -= 15;
      levelAdvice += " Note : L'état 'Satisfaisant' pourrait limiter tes performances.";
    } else if (product.state === "BON") {
      score -= 5;
    }
  }

  // 6. Prise en compte de l'Indice d'Opportunité (basée sur le Score du Prix)
  let priceAdvice = "";
  const priceScoreVal = product.dealScore?.priceScore;
  if (priceScoreVal !== undefined) {
    if (priceScoreVal >= 80) {
      // Bonus financier basé sur l'excellence du prix
      score += 8;
      
      // Personnalisation des explications textuelles
      if (diff === 0) {
        priceAdvice = "C'est une opportunité en or ! Ce matériel est proposé à un tarif exceptionnel par rapport au prix moyen constaté.";
      } else if (diff === 1) {
        priceAdvice = "Un investissement d'avenir intelligent. L'opportunité financière est telle qu'il vaut largement le coup d'anticiper ta progression avec un prix si attractif !";
      } else {
        priceAdvice = "Le prix est particulièrement avantageux, ce qui en fait une superbe occasion.";
      }
    } else if (priceScoreVal < 40) {
      // Malus financier
      score -= 12;
      
      if (diff === 0) {
        priceAdvice = "Prudence sur le budget. Le prix demandé est supérieur à la moyenne du marché de l'occasion pour cette gamme.";
      } else if (diff < 0) {
        priceAdvice = "Le prix n'est pas particulièrement avantageux pour cette gamme.";
      } else {
        priceAdvice = "Attention toutefois : le prix demandé semble surévalué par rapport aux moyennes du marché de l'occasion.";
      }
    } else {
      // Prix juste / cohérent (entre 40 et 79)
      if (diff === 0) {
        priceAdvice = "Le tarif proposé est tout à fait cohérent avec le marché de l'occasion.";
      } else {
        priceAdvice = "Côté budget, le prix reste juste et équitable.";
      }
    }
  }

  // Concaténation pour rétro-compatibilité
  const explanation = priceAdvice ? `${levelAdvice} ${priceAdvice}` : levelAdvice;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    isRecommended: score >= 70,
    explanation,
    detectedLevel: finalLevel,
    levelAdvice,
    priceAdvice
  };
}
