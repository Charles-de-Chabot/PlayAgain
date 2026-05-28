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
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let stripeAccountId = user.stripeConnectId;

    // 1. Si le vendeur n'a pas encore de compte connecté, on lui en crée un temporaire
    if (!stripeAccountId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Clé API Stripe non configurée sur le serveur." }, { status: 500 });
      }

      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          userId: user.id.toString(),
          email: user.email,
        },
      });

      stripeAccountId = account.id;
      // NOTE : On ne met pas à jour le stripeConnectId en base de données pour l'instant !
      // Ce sera fait uniquement lors du retour réussi via l'API de validation /api/stripe/success
    }

    // 2. Générer le lien d'onboarding Stripe Express
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/profile?stripe=failed`,
      return_url: `${appUrl}/api/stripe/success?acct=${stripeAccountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Erreur lors de la génération du lien d'onboarding Stripe Connect :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'onboarding Stripe.", details: error.message },
      { status: 500 }
    );
  }
}
