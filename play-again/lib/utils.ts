import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeProduct(p: any) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category_id: p.category_id,
    type_id: p.type_id,
    brand_id: p.brand_id,
    state: p.state,
    size_id: p.size_id,
    price: p.price ? Number(p.price) : 0,
    stock_quantity: p.stock_quantity,
    user_id: p.user_id,
    created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
    updated_at: p.updated_at instanceof Date ? p.updated_at.toISOString() : p.updated_at,
    is_sold: p.is_sold,
    age: p.age,
    accessory_included: p.accessory_included,
    is_shipping: p.is_shipping,
    targetGender: p.targetGender,
    levelCategory: p.levelCategory,
    user: p.user ? {
      id: p.user.id,
      username: p.user.username,
      email: p.user.email,
      profile_picture: p.user.profile_picture,
      is_certified: p.user.is_certified,
      addresses: p.user.addresses ? p.user.addresses.map((a: any) => ({
        id: a.id,
        city: a.city,
      })) : [],
    } : undefined,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      label: p.category.label,
    } : undefined,
    brand: p.brand ? {
      id: p.brand.id,
      label: p.brand.label,
      marketPosition: p.brand.marketPosition || "GENERALIST",
    } : undefined,
    type: p.type ? {
      id: p.type.id,
      label: p.type.label,
    } : undefined,
    size: p.size ? {
      id: p.size.id,
      label: p.size.label,
    } : undefined,
    media: p.media ? p.media.map((m: any) => ({
      id: m.id,
      url: m.url,
    })) : [],
  };
}

export type ProductState = 'NEUF' | 'EXCELLENT' | 'BON' | 'SATISFAISANT';
export type MarketPosition = 'GENERALIST' | 'TECHNICAL' | 'PREMIUM';

interface ScoreResult {
  score: number;
  stateScore: number;
  priceScore: number;
  accessoryBonus: number;
  adjustedAveragePrice: number;
  label: "Super Deal 🔥" | "Bon Plan ✨" | "Prix Cohérent" | "Prix Standard";
  colorClass: string;
  textClass: string;
  glowClass: string;
}

/**
 * Calcule le Deal Score complet d'un produit avec les métadonnées de style UI/UX
 */
export function calculateProductScore({
  state,
  price,
  averagePrice,
  marketPosition,
  accessoryIncluded
}: {
  state: ProductState | string;
  price: number;
  averagePrice: number;
  marketPosition: MarketPosition | string;
  accessoryIncluded: boolean;
}): ScoreResult {
  // 1. Calcul du score d'état (60% de la note de base)
  const stateScores: Record<string, number> = {
    NEUF: 100,
    EXCELLENT: 85,
    BON: 70,
    SATISFAISANT: 50,
  };
  const stateScore = stateScores[state] ?? 70;

  // 2. Facteur d'ajustement selon la gamme de la marque
  const brandFactors: Record<string, number> = {
    GENERALIST: 1.0,
    TECHNICAL: 1.6,
    PREMIUM: 2.8,
  };
  const brandFactor = brandFactors[marketPosition] ?? 1.0;

  // 3. Calcul du score de prix relatif ajusté (40% de la note de base)
  const adjustedAveragePrice = averagePrice * brandFactor;
  let priceScore = 70;

  if (averagePrice > 0) {
    const ratio = price / adjustedAveragePrice;
    if (ratio <= 1) {
      // Prix inférieur ou égal à l'attendu -> Bonus quadratique progressif (max 100)
      priceScore = Math.min(100, Math.round(70 + 30 * Math.pow(1 - ratio, 2)));
    } else {
      // Prix supérieur à l'attendu -> Pénalité exponentielle sévère (min 0)
      priceScore = Math.max(0, Math.round(70 * Math.exp(-2.5 * (ratio - 1))));
    }
  }

  // 4. Calcul du bonus accessoires (+10 pts)
  const accessoryBonus = accessoryIncluded ? 10 : 0;

  // 5. Score final pondéré (50% État / 50% Prix)
  const finalScore = (0.5 * stateScore) + (0.5 * priceScore) + accessoryBonus;
  const score = Math.max(0, Math.min(100, Math.round(finalScore)));

  // 6. Choix des classes de style UI/UX haut de gamme
  let label: "Super Deal 🔥" | "Bon Plan ✨" | "Prix Cohérent" | "Prix Standard" = "Prix Standard";
  let colorClass = "bg-zinc-900 border border-white/5 text-zinc-400";
  let textClass = "text-zinc-400";
  let glowClass = "";

  if (score >= 90) {
    label = "Super Deal 🔥";
    colorClass = "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 text-white border-none";
    textClass = "text-emerald-400";
    glowClass = "drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] font-black";
  } else if (score >= 75) {
    label = "Bon Plan ✨";
    colorClass = "bg-gradient-to-r from-green-400 to-emerald-400 text-white border-none shadow-md shadow-green-500/10";
    textClass = "text-green-400";
    glowClass = "drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]";
  } else if (score >= 60) {
    label = "Prix Cohérent";
    colorClass = "bg-zinc-800 border border-white/10 text-zinc-300";
    textClass = "text-zinc-300";
  }

  return {
    score,
    stateScore,
    priceScore,
    accessoryBonus,
    adjustedAveragePrice,
    label,
    colorClass,
    textClass,
    glowClass
  };
}

