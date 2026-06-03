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
