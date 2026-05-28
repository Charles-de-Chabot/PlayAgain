import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const stripeAccountId = searchParams.get("acct");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!stripeAccountId) {
      return NextResponse.redirect(new URL("/profile?stripe=error", request.url));
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY non configurée.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // 1. Sécurité : Vérifier que l'utilisateur de la session correspond à l'utilisateur défini dans les métadonnées Stripe
    const userId = parseInt(session.user.id);
    if (!account.metadata || account.metadata.userId !== session.user.id) {
      console.error(`🔒 Alerte sécurité : Tentative d'usurpation de compte connecté Stripe par l'utilisateur ${userId}`);
      return NextResponse.redirect(new URL("/profile?stripe=security_error", request.url));
    }

    // 2. Vérifier si Stripe a validé le compte (details_submitted est true)
    if (account.details_submitted) {
      // Le compte est valide ! On remplit le stripeConnectId en base de données à ce moment précis
      await prisma.user.update({
        where: { id: userId },
        data: { stripeConnectId: stripeAccountId },
      });

      console.log(`✅ Compte connecté Stripe ${stripeAccountId} validé et enregistré pour l'utilisateur ${userId}`);
      return NextResponse.redirect(new URL("/sell?stripe=success", request.url));
    } else {
      console.log(`⚠️ L'utilisateur ${userId} a interrompu son onboarding ou n'a pas finalisé ses coordonnées bancaires.`);
      return NextResponse.redirect(new URL("/profile?stripe=failed", request.url));
    }
  } catch (err) {
    console.error("Erreur lors de la validation du compte Stripe:", err);
    return NextResponse.redirect(new URL("/profile?stripe=error", request.url));
  }
}
