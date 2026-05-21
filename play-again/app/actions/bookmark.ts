"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère toutes les listes de favoris de l'utilisateur.
 * Si l'utilisateur n'en possède aucune, crée automatiquement une liste par défaut "Favoris".
 */
export async function getUserBookmarks() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = parseInt(session.user.id);

  try {
    let lists = await prisma.bookmark.findMany({
      where: { user_id: userId },
      include: {
        items: {
          orderBy: {
            created_at: "desc",
          },
          include: {
            product: {
              include: {
                media: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Création automatique de la liste par défaut si aucune n'existe
    if (lists.length === 0) {
      const defaultList = await prisma.bookmark.create({
        data: {
          user_id: userId,
          name: "Favoris",
        },
        include: {
          items: {
            orderBy: {
              created_at: "desc",
            },
            include: {
              product: {
                include: {
                  media: true,
                  category: true,
                  brand: true,
                },
              },
            },
          },
        },
      });
      lists = [defaultList];
    }

    // Sérialisation explicite pour éviter l'erreur Decimal/Date lors de l'appel depuis des Client Components
    const serializeList = (list: any) => ({
      id: list.id,
      name: list.name,
      user_id: list.user_id,
      items: list.items.map((item: any) => ({
        id: item.id,
        bookmark_id: item.bookmark_id,
        product_id: item.product_id,
        created_at: item.created_at.toISOString(),
        product: {
          id: item.product.id,
          title: item.product.title,
          description: item.product.description,
          price: Number(item.product.price),
          stock_quantity: item.product.stock_quantity,
          user_id: item.product.user_id,
          created_at: item.product.created_at.toISOString(),
          updated_at: item.product.updated_at.toISOString(),
          category_id: item.product.category_id,
          type_id: item.product.type_id,
          brand_id: item.product.brand_id,
          state: item.product.state,
          size_id: item.product.size_id,
          is_sold: item.product.is_sold,
          age: item.product.age,
          accessory_included: item.product.accessory_included,
          is_shipping: item.product.is_shipping,
          targetGender: item.product.targetGender,
          levelCategory: item.product.levelCategory,
          dealScore: item.product.dealScore,
          media: item.product.media.map((m: any) => ({
            id: m.id,
            url: m.url,
            product_id: m.product_id,
          })),
          category: item.product.category ? {
            id: item.product.category.id,
            label: item.product.category.label,
          } : null,
          brand: item.product.brand ? {
            id: item.product.brand.id,
            label: item.product.brand.label,
          } : null,
        },
      })),
    });

    return lists.map(serializeList);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des favoris :", error);
    return [];
  }
}

/**
 * Crée une nouvelle liste de favoris personnalisée pour l'utilisateur.
 */
export async function createBookmarkList(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  const userId = parseInt(session.user.id);

  const cleanName = name.trim();
  if (!cleanName) {
    return { success: false, error: "Le nom de la liste ne peut pas être vide" };
  }

  try {
    const newList = await prisma.bookmark.create({
      data: {
        user_id: userId,
        name: cleanName,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/favorites");
    revalidatePath("/favorites");
    return { success: true, list: newList };
  } catch (error: any) {
    // Code d'erreur de contrainte unique sur MySQL (P2002 dans Prisma)
    if (error.code === "P2002") {
      return { success: false, error: "Une liste de favoris avec ce nom existe déjà." };
    }
    console.error("❌ Erreur lors de la création de la liste de favoris :", error);
    return { success: false, error: "Impossible de créer la liste de favoris." };
  }
}

/**
 * Ajoute ou retire un produit d'une liste de favoris spécifique.
 */
export async function toggleProductInList(productId: number, bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  const userId = parseInt(session.user.id);

  try {
    // Vérification de la propriété de la liste
    const bookmarkList = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user_id: userId },
    });

    if (!bookmarkList) {
      return { success: false, error: "Liste introuvable ou non autorisée." };
    }

    // Recherche de l'élément dans la liste
    const existingItem = await prisma.favItem.findUnique({
      where: {
        bookmark_id_product_id: {
          bookmark_id: bookmarkId,
          product_id: productId,
        },
      },
    });

    if (existingItem) {
      // Retrait de la liste personnalisée ciblée
      await prisma.favItem.delete({
        where: { id: existingItem.id },
      });

      // Vérifier s'il reste d'autres listes personnalisées contenant ce produit
      const remainingCustomItems = await prisma.favItem.findMany({
        where: {
          product_id: productId,
          bookmark: {
            user_id: userId,
            name: { not: "Favoris" }
          }
        }
      });

      // S'il n'y a plus aucune liste personnalisée pour ce produit, on le retire aussi de la liste maître "Favoris" (unfavorite complet)
      if (remainingCustomItems.length === 0) {
        const defaultList = await prisma.bookmark.findFirst({
          where: { user_id: userId, name: "Favoris" }
        });
        if (defaultList) {
          await prisma.favItem.deleteMany({
            where: {
              bookmark_id: defaultList.id,
              product_id: productId
            }
          });
        }
      }

      // Récupérer les identifiants mis à jour
      const updatedFavorites = await prisma.favItem.findMany({
        where: {
          product_id: productId,
          bookmark: { user_id: userId }
        },
        select: { bookmark_id: true }
      });
      const listIds = updatedFavorites.map(item => item.bookmark_id);

      revalidatePath("/profile");
      revalidatePath("/profile/favorites");
      revalidatePath("/favorites");
      revalidatePath(`/product/${productId}`);
      return { success: true, action: "removed", listName: bookmarkList.name, listIds };
    } else {
      // Ajout à la liste ciblée
      await prisma.favItem.create({
        data: {
          bookmark_id: bookmarkId,
          product_id: productId,
        },
      });

      // RÈGLE PRODUIT : Si c'est une liste personnalisée, on l'ajoute AUSSI automatiquement à "Favoris"
      if (bookmarkList.name !== "Favoris") {
        let defaultList = await prisma.bookmark.findFirst({
          where: { user_id: userId, name: "Favoris" }
        });
        
        if (!defaultList) {
          defaultList = await prisma.bookmark.create({
            data: { user_id: userId, name: "Favoris" }
          });
        }

        // Vérifier si le produit est déjà dans "Favoris"
        const alreadyInDefault = await prisma.favItem.findUnique({
          where: {
            bookmark_id_product_id: {
              bookmark_id: defaultList.id,
              product_id: productId
            }
          }
        });

        if (!alreadyInDefault) {
          await prisma.favItem.create({
            data: {
              bookmark_id: defaultList.id,
              product_id: productId
            }
          });
        }
      }

      // Récupérer les identifiants mis à jour
      const updatedFavorites = await prisma.favItem.findMany({
        where: {
          product_id: productId,
          bookmark: { user_id: userId }
        },
        select: { bookmark_id: true }
      });
      const listIds = updatedFavorites.map(item => item.bookmark_id);

      revalidatePath("/profile");
      revalidatePath("/profile/favorites");
      revalidatePath("/favorites");
      revalidatePath(`/product/${productId}`);
      return { success: true, action: "added", listName: bookmarkList.name, listIds };
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout/retrait du favori :", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

/**
 * Vérifie si un produit est présent dans des listes de favoris
 * et retourne le statut général + les identifiants des listes.
 */
export async function getProductFavoritedStatus(productId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { isFavorited: false, listIds: [] };
  }
  const userId = parseInt(session.user.id);

  try {
    const favoritedItems = await prisma.favItem.findMany({
      where: {
        product_id: productId,
        bookmark: {
          user_id: userId,
        },
      },
      select: {
        bookmark_id: true,
      },
    });

    const listIds = favoritedItems.map((item) => item.bookmark_id);

    return {
      isFavorited: listIds.length > 0,
      listIds,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la vérification du statut favori :", error);
    return { isFavorited: false, listIds: [] };
  }
}

/**
 * Supprime une liste de favoris et tous ses liens de produits associés.
 */
export async function deleteBookmarkList(bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  const userId = parseInt(session.user.id);

  try {
    // Vérification de la propriété de la liste
    const list = await prisma.bookmark.findFirst({
      where: { id: bookmarkId, user_id: userId },
    });

    if (!list) {
      return { success: false, error: "Liste introuvable." };
    }

    if (list.name === "Favoris") {
      return { success: false, error: "La liste par défaut 'Favoris' ne peut pas être supprimée." };
    }

    // Suppression préalable de tous les éléments de la liste (intégrité référentielle)
    await prisma.favItem.deleteMany({
      where: { bookmark_id: bookmarkId },
    });

    // Suppression de la liste elle-même
    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/favorites");
    revalidatePath("/favorites");
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la liste :", error);
    return { success: false, error: "Impossible de supprimer la liste de favoris." };
  }
}
