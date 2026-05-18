import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SellForm } from "@/components/sell/SellForm";

export default async function SellPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
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

  // Récupération de l'utilisateur avec ses adresses pour la localisation
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id!) },
    include: { addresses: true }
  });

  const userCity = user?.addresses[0]?.city || null;

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16 pb-12">
          <div className="mb-12 mt-8">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
              Vendre un <span className="text-brand-accent">article</span>
            </h1>
            <p className="mt-4 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
              Donnez une seconde vie à votre équipement sportif
            </p>
          </div>

          <SellForm 
            categories={categories} 
            brands={brands} 
            types={types} 
            userCity={userCity}
          />
        </div>
      </div>
    </main>
  );
}
