import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        types: {
          orderBy: {
            label: "asc"
          }
        }
      },
      orderBy: {
        label: "asc"
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories and types for marketing:", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
