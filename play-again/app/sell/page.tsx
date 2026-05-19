import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { SellForm } from "@/components/sell/SellForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

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
      <div className="fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-brand-primary blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-brand-accent blur-[150px] opacity-40" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-16 pb-12 relative z-10">
          {/* Header Navigation */}
          <div className="mb-12 mt-8  flex items-center justify-between">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">Retour au profil</span>
            </Link>
            
            <div className="text-right">
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                Vendre un <span className="text-brand-accent">article</span>
              </h1>
              <p className="mt-3 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                Donnez une seconde vie à votre équipement sportif
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-8">
            <SellForm 
              categories={categories} 
              brands={brands} 
              types={types} 
              userCity={userCity}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
