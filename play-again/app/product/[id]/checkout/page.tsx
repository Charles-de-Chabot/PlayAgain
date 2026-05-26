import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { Header } from "@/components/layout/Header";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Rediriger vers la page de login si l'utilisateur n'est pas connecté
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/product/${id}/checkout`);
  }

  const userId = parseInt(session.user.id);
  if (isNaN(userId)) {
    redirect("/auth/login");
  }

  // Récupération du produit avec ses relations
  const rawProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: true,
      media: true,
      category: true,
      brand: true,
    },
  });

  if (!rawProduct || rawProduct.is_sold || !rawProduct.is_active) {
    notFound();
  }

  // Interdire l'achat de son propre produit
  if (rawProduct.user_id === userId) {
    redirect(`/product/${id}`);
  }

  // Récupération des adresses de livraison enregistrées par l'acheteur
  const userAddresses = await prisma.address.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });

  // Récupération des informations de profil de l'acheteur (email, nom, prénom, téléphone)
  const rawBuyer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstname: true,
      lastname: true,
      phone: true,
    },
  });

  // Sérialisation des données pour éviter les problèmes d'objets complexes (Decimal, Date)
  const product = JSON.parse(JSON.stringify(rawProduct));
  const addresses = JSON.parse(JSON.stringify(userAddresses));
  const buyer = rawBuyer ? JSON.parse(JSON.stringify(rawBuyer)) : null;

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor avec Halos Lumineux Figma */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grille rétro/arcade */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[40px_40px] opacity-25" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
        
        {/* Halo Supérieur Gauche - Violet Figma */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary opacity-30 blur-[140px]" />
        
        {/* Halo Inférieur Droit - Vert Citron Figma */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-accent opacity-20 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 pt-24 md:pt-32">
          <CheckoutClient
            product={product}
            initialAddresses={addresses}
            buyer={buyer}
            stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
          />
        </div>
      </div>
    </main>
  );
}
