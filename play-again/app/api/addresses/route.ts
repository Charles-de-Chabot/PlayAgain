import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Identifiant utilisateur invalide." }, { status: 400 });
    }

    const body = await req.json();
    const { street_number, street_name, city, zip_code, country, is_default } = body;

    if (!street_name || !city || !zip_code || !country) {
      return NextResponse.json(
        { error: "Tous les champs d'adresse (rue, ville, code postal, pays) sont obligatoires." },
        { status: 400 }
      );
    }

    // Check if this is the user's first address
    const existingAddressesCount = await prisma.address.count({
      where: { user_id: userId },
    });

    const isFirstAddress = existingAddressesCount === 0;
    const shouldBeDefault = isFirstAddress || is_default === true;

    let newAddress;

    if (shouldBeDefault) {
      // Use transaction to set all other user addresses to is_default = false
      newAddress = await prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { user_id: userId },
          data: { is_default: false },
        });

        return tx.address.create({
          data: {
            user_id: userId,
            street_number: street_number || null,
            street_name,
            city,
            zip_code,
            country,
            is_default: true,
          },
        });
      });
    } else {
      newAddress = await prisma.address.create({
        data: {
          user_id: userId,
          street_number: street_number || null,
          street_name,
          city,
          zip_code,
          country,
          is_default: false,
        },
      });
    }

    return NextResponse.json(newAddress);
  } catch (error: any) {
    console.error("Erreur lors de la création de l'adresse:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la sauvegarde de l'adresse." }, { status: 500 });
  }
}
