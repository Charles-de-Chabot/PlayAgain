"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateMatch, learnProductExpertise } from "@/lib/ai/matcher";
import { serializeProduct, calculateProductScore } from "@/lib/utils";

/**
 * Récupère le prix moyen pour chaque couple (category_id, type_id)
 * sous forme de Map (clé: "category_id-type_id")
 */
export async function getAveragePricesMap(categoryIds: number[], typeIds: number[]) {
  if (categoryIds.length === 0 || typeIds.length === 0) {
    return new Map<string, number>();
  }

  // 1. Récupération des moyennes par catégorie, type ET niveau technique
  const averages = await prisma.product.groupBy({
    by: ["category_id", "type_id", "levelCategory"],
    where: {
      category_id: { in: categoryIds },
      type_id: { in: typeIds },
      is_sold: false,
    },
    _avg: {
      price: true,
    },
  });

  // 2. Récupération des moyennes globales de catégorie/type pour le repli de sécurité (fallback)
  const globalAverages = await prisma.product.groupBy({
    by: ["category_id", "type_id"],
    where: {
      category_id: { in: categoryIds },
      type_id: { in: typeIds },
      is_sold: false,
    },
    _avg: {
      price: true,
    },
  });

  const averageMap = new Map<string, number>();

  // Remplissage des replis par défaut (category-type)
  globalAverages.forEach((item) => {
    const avg = item._avg.price ? Number(item._avg.price) : 0;
    averageMap.set(`${item.category_id}-${item.type_id}`, avg);
  });

  // Remplissage des prix spécifiques par niveau (category-type-level)
  averages.forEach((item) => {
    const avg = item._avg.price ? Number(item._avg.price) : 0;
    averageMap.set(`${item.category_id}-${item.type_id}-${item.levelCategory}`, avg);
  });

  return averageMap;
}

export async function getLatestProducts() {
  const session = await auth();

  // 1. Récupération du profil sportif
  let sportProfile = null;
  if (session?.user?.id) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { skills: true },
    });
  }

  if (!sportProfile && session?.user?.email) {
    const userWithProfile = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sportProfile: {
          include: { skills: true },
        },
      },
    });
    sportProfile = userWithProfile?.sportProfile;
  }

  // 2. Récupération de tous les derniers produits
  const products = await prisma.product.findMany({
    where: {
      is_sold: false,
      is_active: true,
      user: {
        stripeConnectId: {
          not: null,
        },
      },
    },
    take: 8,
    orderBy: { created_at: "desc" },
    include: {
      category: true,
      media: true,
      brand: true,
      type: true,
      user: true,
    },
  });

  // 3. Récupération des intérêts de l'utilisateur
  let interests: string[] = [];
  if (sportProfile?.interests && Array.isArray(sportProfile.interests)) {
    interests = sportProfile.interests as string[];
  }

  // 3b. Récupération des prix moyens
  const categoryIds = Array.from(new Set(products.map((p) => p.category_id)));
  const typeIds = Array.from(new Set(products.map((p) => p.type_id)));
  const averageMap = await getAveragePricesMap(categoryIds, typeIds);

  // 4. Sérialisation et injection dynamique du matchScore et dealScore
  return Promise.all(
    products.map(async (p) => {
      let matchScore: number | undefined = undefined;

      if (sportProfile && p.category?.label && interests.includes(p.category.label)) {
        try {
          const match = await calculateMatch(sportProfile, p);
          matchScore = match.score;
        } catch (error) {
          console.error("❌ [Latest Products Match] Erreur IA:", error);
          matchScore = 0;
        }
      }

      const detectedLevel = await learnProductExpertise(p);
      const serialized = serializeProduct(p);
      const avgPrice =
        averageMap.get(`${p.category_id}-${p.type_id}-${detectedLevel}`) ??
        averageMap.get(`${p.category_id}-${p.type_id}`) ??
        0;
      const dealScore = calculateProductScore({
        state: p.state,
        price: Number(p.price),
        averagePrice: avgPrice,
        marketPosition: p.brand?.marketPosition || "GENERALIST",
        accessoryIncluded: p.accessory_included,
      });

      return {
        ...serialized,
        matchScore,
        dealScore,
        levelCategory: detectedLevel,
      };
    })
  );
}

export async function getRecommendedProducts() {
  console.log("-----------------------------------------");
  console.log("🚀 [MATCHING ENGINE] START");
  const session = await auth();

  // 1. Récupération du profil sportif
  let sportProfile = null;

  if (session?.user?.id) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { skills: true },
    });
  }

  if (!sportProfile && session?.user?.email) {
    const userWithProfile = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sportProfile: {
          include: { skills: true },
        },
      },
    });
    sportProfile = userWithProfile?.sportProfile;
  }

  // 2. Si pas de profil sportif ou pas de session, on renvoie les derniers produits avec score 0 (en excluant les nôtres)
  if (!sportProfile) {
    console.log("⚠️ [Match] Pas de profil sportif, retour produits par défaut");
    const products = await prisma.product.findMany({
      where: {
        is_sold: false,
        is_active: true,
        user: {
          stripeConnectId: {
            not: null,
          },
          id: session?.user?.id
            ? {
                not: parseInt(session.user.id),
              }
            : undefined,
        },
      },
      take: 8,
      orderBy: { created_at: "desc" },
      include: {
        category: true,
        media: true,
        brand: true,
        type: true,
        user: true,
      },
    });

    const categoryIds = Array.from(new Set(products.map((p) => p.category_id)));
    const typeIds = Array.from(new Set(products.map((p) => p.type_id)));
    const averageMap = await getAveragePricesMap(categoryIds, typeIds);

    return Promise.all(
      products.map(async (p) => {
        const detectedLevel = await learnProductExpertise(p);
        const serialized = serializeProduct(p);
        const avgPrice =
          averageMap.get(`${p.category_id}-${p.type_id}-${detectedLevel}`) ??
          averageMap.get(`${p.category_id}-${p.type_id}`) ??
          0;
        const dealScore = calculateProductScore({
          state: p.state,
          price: Number(p.price),
          averagePrice: avgPrice,
          marketPosition: p.brand?.marketPosition || "GENERALIST",
          accessoryIncluded: p.accessory_included,
        });
        return {
          ...serialized,
          matchScore: 0,
          dealScore,
          levelCategory: detectedLevel,
        };
      })
    );
  }

  // 3. Récupération des intérêts de l'utilisateur
  let interests: string[] = [];
  if (sportProfile.interests && Array.isArray(sportProfile.interests)) {
    interests = sportProfile.interests as string[];
  }

  console.log("🎯 [Match] Catégories d'intérêts :", interests);

  // 4. Récupération des produits correspondant aux catégories d'intérêts (en excluant les nôtres)
  const products = await prisma.product.findMany({
    where: {
      is_sold: false,
      is_active: true,
      category:
        interests.length > 0
          ? {
              label: {
                in: interests,
              },
            }
          : undefined,
      user: {
        stripeConnectId: {
          not: null,
        },
        id: session?.user?.id
          ? {
              not: parseInt(session.user.id),
            }
          : undefined,
      },
    },
    take: 8,
    orderBy: { created_at: "desc" },
    include: {
      category: true,
      media: true,
      brand: true,
      type: true,
      user: true,
    },
  });

  const categoryIds = Array.from(new Set(products.map((p) => p.category_id)));
  const typeIds = Array.from(new Set(products.map((p) => p.type_id)));
  const averageMap = await getAveragePricesMap(categoryIds, typeIds);

  // 5. Calcul des scores réels via l'IA
  console.log(`🧠 [Match] Analyse IA pour ${products.length} produits filtrés...`);
  const productsWithScores = [];

  for (const p of products) {
    try {
      const match = await calculateMatch(sportProfile, p);
      console.log(`✅ [Match] #${p.id}: ${match.score}%`);
      const serialized = serializeProduct(p);
      const avgPrice =
        averageMap.get(`${p.category_id}-${p.type_id}-${match.detectedLevel}`) ??
        averageMap.get(`${p.category_id}-${p.type_id}`) ??
        0;
      const dealScore = calculateProductScore({
        state: p.state,
        price: Number(p.price),
        averagePrice: avgPrice,
        marketPosition: p.brand?.marketPosition || "GENERALIST",
        accessoryIncluded: p.accessory_included,
      });
      productsWithScores.push({
        ...serialized,
        matchScore: match.score,
        dealScore,
        levelCategory: match.detectedLevel,
      });
    } catch (error) {
      console.error("❌ [Match] Erreur IA:", error);
      const detectedLevel = await learnProductExpertise(p);
      const serialized = serializeProduct(p);
      const avgPrice =
        averageMap.get(`${p.category_id}-${p.type_id}-${detectedLevel}`) ??
        averageMap.get(`${p.category_id}-${p.type_id}`) ??
        0;
      const dealScore = calculateProductScore({
        state: p.state,
        price: Number(p.price),
        averagePrice: avgPrice,
        marketPosition: p.brand?.marketPosition || "GENERALIST",
        accessoryIncluded: p.accessory_included,
      });
      productsWithScores.push({
        ...serialized,
        matchScore: 0,
        dealScore,
        levelCategory: detectedLevel,
      });
    }
  }

  // Trier par matchScore décroissant (les meilleurs % de matching en premier)
  productsWithScores.sort((a, b) => b.matchScore - a.matchScore);

  return productsWithScores;
}

export interface GetFilteredProductsParams {
  searchQuery?: string;
  categoryId?: number;
  brandId?: number;
  conditions?: string[];
  targetGenders?: string[];
  sportLevels?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  isShipping?: boolean;
  onlyRecommended?: boolean;
  minMatchScore?: number;
}

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { label: "asc" },
    });
    return brands.map((b) => ({
      id: b.id,
      label: b.label,
    }));
  } catch (error) {
    console.error("❌ Error fetching brands:", error);
    return [];
  }
}

export async function getFilteredProducts(filters: GetFilteredProductsParams) {
  const session = await auth();

  // 1. Récupération du profil sportif de l'utilisateur s'il est connecté
  let sportProfile = null;
  if (session?.user?.id) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { skills: true },
    });
  }

  // 2. Construction de la clause 'where' Prisma
  const where: any = {
    is_sold: false, // On n'affiche que les articles non vendus
    is_active: true, // On n'affiche que les articles actifs
    user: {
      stripeConnectId: {
        not: null,
      },
    },
  };

  // Exclure les propres articles de l'utilisateur connecté
  if (session?.user?.id) {
    where.user_id = {
      not: parseInt(session.user.id),
    };
  }

  if (filters.searchQuery) {
    where.OR = [
      { title: { contains: filters.searchQuery } },
      { description: { contains: filters.searchQuery } },
      { brand: { label: { contains: filters.searchQuery } } },
    ];
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.brandId) {
    where.brand_id = filters.brandId;
  }

  if (filters.conditions && filters.conditions.length > 0) {
    where.state = { in: filters.conditions };
  }

  if (filters.targetGenders && filters.targetGenders.length > 0) {
    where.targetGender = { in: filters.targetGenders };
  }

  if (filters.sportLevels && filters.sportLevels.length > 0) {
    where.levelCategory = { in: filters.sportLevels };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.isShipping) {
    where.is_shipping = true;
  }

  // 3. Tri côté base de données (si ce n'est pas par pertinence d'IA)
  let orderBy: any = { created_at: "desc" };
  if (filters.sortBy === "price_asc") {
    orderBy = { price: "asc" };
  } else if (filters.sortBy === "price_desc") {
    orderBy = { price: "desc" };
  } else if (filters.sortBy === "recent") {
    orderBy = { created_at: "desc" };
  }

  try {
    // 4. Exécution de la requête Prisma
    const products = await prisma.product.findMany({
      where,
      orderBy: filters.sortBy === "match" ? undefined : orderBy,
      include: {
        category: true,
        media: true,
        brand: true,
        type: true,
        user: true,
      },
    });

    const categoryIds = Array.from(new Set(products.map((p) => p.category_id)));
    const typeIds = Array.from(new Set(products.map((p) => p.type_id)));
    const averageMap = await getAveragePricesMap(categoryIds, typeIds);

    // 5. Calcul des scores de compatibilité IA
    let productsWithScores = await Promise.all(
      products.map(async (p) => {
        let matchScore = 0;

        if (sportProfile) {
          try {
            const match = await calculateMatch(sportProfile, p);
            matchScore = match.score;
          } catch (error) {
            console.error(`❌ [Filtered Products Match] Erreur IA pour #${p.id}:`, error);
          }
        }

        const detectedLevel = await learnProductExpertise(p);
        const serialized = serializeProduct(p);
        const avgPrice =
          averageMap.get(`${p.category_id}-${p.type_id}-${detectedLevel}`) ??
          averageMap.get(`${p.category_id}-${p.type_id}`) ??
          0;
        const dealScore = calculateProductScore({
          state: p.state,
          price: Number(p.price),
          averagePrice: avgPrice,
          marketPosition: p.brand?.marketPosition || "GENERALIST",
          accessoryIncluded: p.accessory_included,
        });
        return {
          ...serialized,
          matchScore,
          dealScore,
          levelCategory: detectedLevel,
        };
      })
    );

    // 6. Application du filtre IA "Recommandé pour mon profil" (matchScore >= threshold + Sports Favoris)
    if (filters.onlyRecommended && sportProfile) {
      const userInterests = Array.isArray(sportProfile.interests)
        ? (sportProfile.interests as string[]).map((i) => i.toLowerCase().trim())
        : [];

      const threshold = filters.minMatchScore !== undefined ? filters.minMatchScore : 60;

      productsWithScores = productsWithScores.filter((p) => {
        // Doit correspondre au niveau (score >= threshold)
        const matchesLevel = p.matchScore >= threshold;

        // Doit correspondre à un sport/catégorie favori de l'utilisateur
        const productCategory = p.category?.label?.toLowerCase().trim();
        const matchesInterest =
          userInterests.length === 0 || (productCategory && userInterests.includes(productCategory));

        return matchesLevel && matchesInterest;
      });
    }

    // 7. Tri par pertinence d'IA si sélectionné
    if (filters.sortBy === "match" && sportProfile) {
      productsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    }

    return productsWithScores;
  } catch (error) {
    console.error("❌ Erreur getFilteredProducts:", error);
    return [];
  }
}
