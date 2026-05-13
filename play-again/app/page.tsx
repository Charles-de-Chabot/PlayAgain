"use client";

import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeScreen } from "@/components/home/WelcomeScreen";
import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductGrid } from "@/components/home/ProductGrid";
import { MobileNavbar } from "@/components/layout/MobileNavbar";

export default function Home() {
  const { isFirstVisit, completeFirstVisit } = useFirstVisit();
  const { loading, isAuthenticated } = useAuth();

  // On évite le flash de contenu pendant le chargement des hooks
  if (isFirstVisit === null || loading) {
    return <div className="min-h-screen bg-black" />;
  }

  // Si l'utilisateur est connecté, on considère que sa "première visite" est terminée
  // Cela évite de revenir sur le WelcomeScreen après une inscription ou connexion
  if (isAuthenticated && isFirstVisit) {
    completeFirstVisit();
    return <div className="min-h-screen bg-black" />; // Petit temps de transition pour le rafraîchissement d'état
  }

  // Écran 1 : Première visite (Image 1) - Uniquement pour les non-connectés
  if (isFirstVisit && !isAuthenticated) {
    return <WelcomeScreen onContinue={completeFirstVisit} />;
  }

  // Écrans 2 & 3 : Home (Connecté ou non) (Image 2)
  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      {/* Background Decor - Profile Style */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />
        
        <HomeHero />
        
        <div className="pb-24">
          <ProductGrid />
        </div>

        {/* Barre de navigation mobile fixe en bas */}
        <MobileNavbar />
      </div>
    </main>
  );
}
