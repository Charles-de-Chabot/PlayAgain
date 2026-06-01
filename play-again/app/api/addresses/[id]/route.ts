import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const addressId = parseInt(id);

    if (isNaN(userId) || isNaN(addressId)) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
    }

    // Check if the address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Adresse non trouvée." }, { status: 404 });
    }

    if (existingAddress.user_id !== userId) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const body = await req.json();
    const { street_number, street_name, city, zip_code, country, is_default } = body;

    // Build fields to update
    const updatedData: any = {};
    if (street_number !== undefined) updatedData.street_number = street_number || null;
    if (street_name !== undefined) updatedData.street_name = street_name;
    if (city !== undefined) updatedData.city = city;
    if (zip_code !== undefined) updatedData.zip_code = zip_code;
    if (country !== undefined) updatedData.country = country;
    if (is_default !== undefined) updatedData.is_default = is_default;

    let updatedAddress;

    if (is_default === true) {
      // If we are setting this address as default, we must set all other addresses of this user to is_default = false
      updatedAddress = await prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { user_id: userId, NOT: { id: addressId } },
          data: { is_default: false },
        });

        return tx.address.update({
          where: { id: addressId },
          data: { ...updatedData, is_default: true },
        });
      });
    } else {
      // If setting is_default to false, check if there are other addresses, but do normal update
      updatedAddress = await prisma.address.update({
        where: { id: addressId },
        data: updatedData,
      });
    }

    return NextResponse.json(updatedAddress);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'adresse:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour de l'adresse." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const addressId = parseInt(id);

    if (isNaN(userId) || isNaN(addressId)) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
    }

    // Check if the address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Adresse non trouvée." }, { status: 404 });
    }

    if (existingAddress.user_id !== userId) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const wasDefault = existingAddress.is_default;

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If the deleted address was the default one, we should automatically elect a new default if other addresses exist
    if (wasDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });

      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { is_default: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'adresse:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression de l'adresse." }, { status: 500 });
  }
}
