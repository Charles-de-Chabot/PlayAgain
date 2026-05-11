"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    return { error: "Tous les champs sont obligatoires." };
  }

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    // 2. Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Créer l'utilisateur dans la base
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}
