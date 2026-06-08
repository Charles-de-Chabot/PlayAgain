import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SellForm } from "@/components/sell/SellForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import Stripe from "stripe";
import { StripeRedirector } from "./StripeRedirector";

export default async function SellPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const resolvedParams = await searchParams;
  const stripeStatus = resolvedParams.stripe;

  const userId = parseInt(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Redirection automatique Stripe Connect si pas d'IBAN
  if (!user.stripeConnectId) {
    let stripeAccountId;

    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY non configurée.");
      }

      // 1. Création temporaire du compte Stripe Express (non stocké en BDD pour l'instant)
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    } catch (err) {
      console.error("Erreur lors de la création du compte connecté Stripe Connect:", err);
      redirect("/profile?stripe=error");
    }

    // 2. Génération du lien d'onboarding
    // Le return_url redirige vers notre API de validation qui enregistrera l'id seulement si le compte est complété.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/profile?stripe=failed`,
      return_url: `${appUrl}/api/stripe/success?acct=${stripeAccountId}`,
      type: "account_onboarding",
    });

    // 3. Redirection immédiate via composant client pour contourner les blocages de navigation Next.js
    return <StripeRedirector url={accountLink.url} />;
  }

  // Récupération des données pour les listes déroulantes
  // Récupération des catégories
  const categories = await prisma.category.findMany({
    orderBy: { label: 'asc' }
  });

  const brands = await prisma.brand.findMany({
    orderBy: { label: 'asc' }
  });

  const types = await prisma.type.findMany({
    include: { sizes: true },
    orderBy: { label: 'asc' }
  });

  const userCity = user.addresses[0]?.city || null;

  // Récupération du produit en mode édition
  let editProduct = null;
  const editId = resolvedParams.edit ? parseInt(resolvedParams.edit as string) : null;
  if (editId) {
    const prod = (await prisma.product.findUnique({
      where: { id: editId },
      include: { media: true }
    })) as any;
    if (prod && prod.user_id === userId && !prod.is_sold) {
      editProduct = {
        ...prod,
        price: prod.price ? Number(prod.price) : 0,
      };
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-brand-primary blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-brand-accent blur-[150px] opacity-40" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16 pb-12 relative z-10">
          {stripeStatus === "success" && (
            <div className="mb-8 w-full p-4 rounded-3xl bg-zinc-950/80 border border-brand-accent/30 backdrop-blur-2xl relative overflow-hidden flex items-center gap-4 shadow-[0_0_20px_rgba(198,255,52,0.1)]">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent shrink-0">
                ✓
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white italic">
                  Compte vendeur activé avec succès !
                </h3>
                <p className="text-xs text-zinc-400 font-bold">
                  Votre IBAN est configuré. Vous pouvez désormais publier des annonces et recevoir vos gains.
                </p>
              </div>
            </div>
          )}
          {/* Header Navigation */}
          <div className="mb-12 mt-8  flex items-center justify-between">
            <Link 
              href={editProduct ? `/product/${editProduct.id}` : "/profile"} 
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                {editProduct ? "Retour au produit" : "Retour au profil"}
              </span>
            </Link>
            
            <div className="text-right">
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                {editProduct ? (
                  <>Modifier mon <span className="text-brand-accent">annonce</span></>
                ) : (
                  <>Vendre un <span className="text-brand-accent">article</span></>
                )}
              </h1>
              <p className="mt-3 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                {editProduct ? "Mettez à jour les détails de votre équipement sportif" : "Donnez une seconde vie à votre équipement sportif"}
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-8">
            <SellForm 
              categories={categories} 
              brands={brands} 
              types={types} 
              userCity={userCity}
              initialProduct={editProduct}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
