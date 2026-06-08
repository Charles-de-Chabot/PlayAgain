"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { learnProductExpertise } from "@/lib/ai/matcher";

export async function createProduct(formData: FormData) {
  console.log("🚀 Tentative de création de produit reçue...");

  const session = await auth();
  if (!session?.user) {
    console.error("❌ Erreur: Non authentifié");
    throw new Error("Vous devez être connecté pour publier une annonce");
  }

  const userId = parseInt(session.user.id!);
  console.log("👤 Utilisateur ID:", userId);

  // Extraction et validation des données
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const rawCategoryId = formData.get("category_id") as string;
  const rawTypeId = formData.get("type_id") as string;
  const rawBrandId = formData.get("brand_id") as string;
  const rawPrice = formData.get("price") as string;

  console.log("📝 Données reçues:", { title, rawCategoryId, rawTypeId, rawBrandId, rawPrice });

  if (!title || !rawCategoryId || !rawTypeId || !rawBrandId || !rawPrice) {
    console.error("❌ Erreur: Champs manquants");
    throw new Error("Veuillez remplir tous les champs obligatoires");
  }

  const category_id = parseInt(rawCategoryId);
  const type_id = parseInt(rawTypeId);
  const price = parseFloat(rawPrice);

  // Gestion de la marque (existante ou nouvelle)
  let brand_id: number;
  if (rawBrandId.startsWith("NEW:")) {
    const newBrandName = rawBrandId.replace("NEW:", "");
    const existingBrand = await prisma.brand.findFirst({
      where: { label: newBrandName },
    });

    if (existingBrand) {
      brand_id = existingBrand.id;
    } else {
      const newBrand = await prisma.brand.create({
        data: { label: newBrandName },
      });
      brand_id = newBrand.id;
      // TODO: Envoyer une notification à l'admin pour validation de la nouvelle marque
    }
  } else {
    brand_id = parseInt(rawBrandId);
  }

  const state = formData.get("state") as any;
  const size_id = formData.get("size_id") ? parseInt(formData.get("size_id") as string) : null;
  const quantity = parseInt((formData.get("quantity") as string) || "1");
  const age = formData.get("age") ? parseInt(formData.get("age") as string) : null;
  const accessory_included = formData.get("accessory_included") === "true";
  const is_shipping = formData.get("is_shipping") === "true";
  const targetGender = (formData.get("targetGender") as any) || "UNISEX";

  // Récupération des images
  const images = formData.getAll("images") as File[];

  // 1. Création du produit dans la base de données
  const product = await prisma.product.create({
    data: {
      title,
      description,
      category_id,
      type_id,
      brand_id,
      state,
      size_id,
      price,
      stock_quantity: quantity,
      user_id: userId,
      age,
      accessory_included,
      is_shipping,
      targetGender,
    },
  });

  // Log product creation activity
  const { logUserActivity } = await import("@/lib/activity");
  await logUserActivity(userId, "PRODUCT_CREATE");

  // 2. Gestion des images locales
  if (images.length > 0) {
    const uploadDir = join(process.cwd(), "public", "uploads", "products");

    // S'assurer que le dossier existe
    await mkdir(uploadDir, { recursive: true });

    for (const image of images) {
      if (image.size === 0) continue;

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Nom de fichier unique : [id_produit]_[timestamp]_[nom_original]
      const filename = `${product.id}_${Date.now()}_${image.name.replace(/\s+/g, "_")}`;
      const path = join(uploadDir, filename);

      await writeFile(path, buffer);

      // Enregistrement du média dans la base de données
      await prisma.media.create({
        data: {
          url: `/uploads/products/${filename}`,
          product_id: product.id,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/sell");

  // 3. Lancement de l'apprentissage IA en arrière-plan (sans bloquer l'utilisateur)
  // On récupère le nom de la marque pour l'IA
  const brand = await prisma.brand.findUnique({ where: { id: brand_id } });
  if (brand) {
    // On lance l'apprentissage sans 'await' pour ne pas faire attendre le vendeur
    learnProductExpertise({ ...product, brand }).catch((err) =>
      console.error("❌ [AI Learning Error]", err)
    );
  }

  return { success: true };
}

export async function updateProduct(productId: number, formData: FormData) {
  console.log(`🚀 Tentative de modification du produit ${productId} reçue...`);

  const session = await auth();
  if (!session?.user) {
    console.error("❌ Erreur: Non authentifié");
    throw new Error("Vous devez être connecté pour modifier une annonce");
  }

  const userId = parseInt(session.user.id!);
  console.log("👤 Utilisateur ID:", userId);

  // Vérifier l'existence et la propriété du produit
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { media: true }
  });

  if (!existingProduct) {
    console.error("❌ Erreur: Produit non trouvé");
    throw new Error("Produit non trouvé");
  }

  if (existingProduct.user_id !== userId) {
    console.error("❌ Erreur: Non autorisé");
    throw new Error("Vous n'êtes pas autorisé à modifier ce produit");
  }

  if (existingProduct.is_sold) {
    console.error("❌ Erreur: Produit déjà vendu");
    throw new Error("Vous ne pouvez pas modifier une annonce pour un article déjà vendu");
  }

  // Extraction et validation des données
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const rawCategoryId = formData.get("category_id") as string;
  const rawTypeId = formData.get("type_id") as string;
  const rawBrandId = formData.get("brand_id") as string;
  const rawPrice = formData.get("price") as string;

  console.log("📝 Données reçues:", { title, rawCategoryId, rawTypeId, rawBrandId, rawPrice });

  if (!title || !rawCategoryId || !rawTypeId || !rawBrandId || !rawPrice) {
    console.error("❌ Erreur: Champs manquants");
    throw new Error("Veuillez remplir tous les champs obligatoires");
  }

  const category_id = parseInt(rawCategoryId);
  const type_id = parseInt(rawTypeId);
  const price = parseFloat(rawPrice);

  // Gestion de la marque (existante ou nouvelle)
  let brand_id: number;
  if (rawBrandId.startsWith("NEW:")) {
    const newBrandName = rawBrandId.replace("NEW:", "");
    const existingBrand = await prisma.brand.findFirst({
      where: { label: newBrandName },
    });

    if (existingBrand) {
      brand_id = existingBrand.id;
    } else {
      const newBrand = await prisma.brand.create({
        data: { label: newBrandName },
      });
      brand_id = newBrand.id;
    }
  } else {
    brand_id = parseInt(rawBrandId);
  }

  const state = formData.get("state") as any;
  const size_id = formData.get("size_id") ? parseInt(formData.get("size_id") as string) : null;
  const quantity = parseInt((formData.get("quantity") as string) || "1");
  const age = formData.get("age") ? parseInt(formData.get("age") as string) : null;
  const accessory_included = formData.get("accessory_included") === "true";
  const is_shipping = formData.get("is_shipping") === "true";
  const targetGender = (formData.get("targetGender") as any) || "UNISEX";

  // Récupération des images à conserver et à ajouter
  const keepImages = formData.getAll("keep_images") as string[];
  const images = formData.getAll("images") as File[];

  // Supprimer les médias qui ne sont plus conservés
  const mediaToDelete = existingProduct.media.filter(
    (media) => !keepImages.includes(media.url)
  );

  if (mediaToDelete.length > 0) {
    await prisma.media.deleteMany({
      where: {
        id: {
          in: mediaToDelete.map((m) => m.id),
        },
      },
    });
  }

  // Mettre à jour le produit
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      title,
      description,
      category_id,
      type_id,
      brand_id,
      state,
      size_id,
      price,
      stock_quantity: quantity,
      age,
      accessory_included,
      is_shipping,
      targetGender,
    },
  });

  // Enregistrer l'activité utilisateur
  const { logUserActivity } = await import("@/lib/activity");
  await logUserActivity(userId, "PRODUCT_UPDATE");

  // Télécharger les nouvelles images
  if (images.length > 0) {
    const uploadDir = join(process.cwd(), "public", "uploads", "products");

    // S'assurer que le dossier existe
    await mkdir(uploadDir, { recursive: true });

    for (const image of images) {
      if (image.size === 0) continue;

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${updatedProduct.id}_${Date.now()}_${image.name.replace(/\s+/g, "_")}`;
      const path = join(uploadDir, filename);

      await writeFile(path, buffer);

      // Enregistrement du média dans la base de données
      await prisma.media.create({
        data: {
          url: `/uploads/products/${filename}`,
          product_id: updatedProduct.id,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/sell");

  const brand = await prisma.brand.findUnique({ where: { id: brand_id } });
  if (brand) {
    learnProductExpertise({ ...updatedProduct, brand }).catch((err) =>
      console.error("❌ [AI Learning Error]", err)
    );
  }

  return { success: true };
}

export async function deleteProduct(productId: number) {
  console.log(`🚀 Tentative de suppression du produit ${productId}...`);

  const session = await auth();
  if (!session?.user) {
    console.error("❌ Erreur: Non authentifié");
    throw new Error("Vous devez être connecté pour supprimer une annonce");
  }

  const userId = parseInt(session.user.id!);

  // Vérifier l'existence, la propriété et le statut du produit
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    console.error("❌ Erreur: Produit non trouvé");
    throw new Error("Produit non trouvé");
  }

  if (existingProduct.user_id !== userId) {
    console.error("❌ Erreur: Non autorisé");
    throw new Error("Vous n'êtes pas autorisé à supprimer ce produit");
  }

  if (existingProduct.is_sold) {
    console.error("❌ Erreur: Produit déjà vendu");
    throw new Error("Vous ne pouvez pas supprimer un article déjà vendu");
  }

  // Nettoyage des relations manuellement pour éviter les erreurs d'intégrité référentielle
  await prisma.$transaction([
    // 1. Supprimer les favoris
    prisma.favItem.deleteMany({ where: { product_id: productId } }),
    // 2. Supprimer les éléments du panier
    prisma.basketItem.deleteMany({ where: { product_id: productId } }),
    // 3. Supprimer les messages des conversations liées au produit
    prisma.message.deleteMany({
      where: {
        conversation: {
          product_id: productId,
        },
      },
    }),
    // 4. Supprimer les conversations liées au produit
    prisma.conversation.deleteMany({ where: { product_id: productId } }),
    // 5. Supprimer les médias
    prisma.media.deleteMany({ where: { product_id: productId } }),
    // 6. Supprimer le produit
    prisma.product.delete({ where: { id: productId } }),
  ]);

  // Log user activity
  const { logUserActivity } = await import("@/lib/activity");
  await logUserActivity(userId, "PRODUCT_DELETE");

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true };
}


