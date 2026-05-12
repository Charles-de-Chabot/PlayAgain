"use auth";
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour publier une annonce");
  }

  const userId = parseInt(session.user.id!);

  // Extraction des données textuelles
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = parseInt(formData.get("category_id") as string);
  const type_id = parseInt(formData.get("type_id") as string);
  const brand_id = parseInt(formData.get("brand_id") as string);
  const state = formData.get("state") as any;
  const size_id = formData.get("size_id") ? parseInt(formData.get("size_id") as string) : null;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const age = formData.get("age") ? parseInt(formData.get("age") as string) : null;
  const accessory_included = formData.get("accessory_included") === "true";
  const is_shipping = formData.get("is_shipping") === "true";

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
    },
  });

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
      const filename = `${product.id}_${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
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
  
  // Redirection vers la page d'accueil (ou la page du produit si elle existait)
  redirect("/");
}
