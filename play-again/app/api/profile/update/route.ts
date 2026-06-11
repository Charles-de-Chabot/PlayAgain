import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour effectuer cette action." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Identifiant utilisateur invalide." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { email, phone, username, firstname, lastname } = body;

    const dataToUpdate: any = {};

    if (email !== undefined) {
      if (!email || !email.trim()) {
        return NextResponse.json(
          { error: "L'adresse e-mail est obligatoire." },
          { status: 400 }
        );
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "L'adresse e-mail saisie est invalide." },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà utilisée par un autre compte." },
          { status: 400 }
        );
      }

      dataToUpdate.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      dataToUpdate.phone = phone ? phone.trim() : null;
    }

    if (username !== undefined) {
      dataToUpdate.username = username ? username.trim() : null;
    }

    if (firstname !== undefined) {
      dataToUpdate.firstname = firstname ? firstname.trim() : null;
    }

    if (lastname !== undefined) {
      dataToUpdate.lastname = lastname ? lastname.trim() : null;
    }

    // Update user info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        firstname: true,
        lastname: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour des informations." },
      { status: 500 }
    );
  }
}
