import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeConnectId: true },
    });

    if (!user || !user.stripeConnectId) {
      return NextResponse.json(
        { error: "Vous n'avez pas encore configuré de compte vendeur Stripe Connect." },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Clé API Stripe non configurée sur le serveur." }, { status: 500 });
    }

    // Générer le lien de connexion sécurisé Stripe Express (dashboard express)
    const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectId);

    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    console.error("Erreur lors de la génération du lien de connexion Stripe Express :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion au tableau de bord Stripe.", details: error.message },
      { status: 500 }
    );
  }
}
