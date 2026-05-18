"use server";

import prisma from "@/lib/prisma";

export async function getCategories() {
  try {
    // Récupère toutes les catégories avec le nombre de produits associés
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Trie d'abord par popularité (nombre de produits) décroissant,
    // puis par ordre alphabétique en cas d'égalité (0 produits)
    const sortedCategories = categories.sort((a, b) => {
      const diffCount = b._count.products - a._count.products;
      if (diffCount !== 0) return diffCount;
      
      // Tri alphabétique robuste avec support des accents français
      return a.label.localeCompare(b.label, "fr", { sensitivity: "base" });
    });

    // Map les objets triés pour les adapter au format du composant client
    return sortedCategories.map(c => ({
      id: c.id,
      name: c.label,
    }));
  } catch (error) {
    console.error("❌ Error fetching and sorting categories from database:", error);
    return [];
  }
}
