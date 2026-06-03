"use client";

import { useFirstVisit } from "@/hooks/useFirstVisit";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeScreen } from "@/components/home/WelcomeScreen";
import { Header } from "@/components/layout/Header";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductGrid } from "@/components/home/ProductGrid";
import { RecommendedGrid } from "@/components/home/RecommendedGrid";

export default function HomeClient() {
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
      <div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <HomeHero />
        
        <div className="pb-10">
          <RecommendedGrid />
          <ProductGrid />
        </div>
      </div>
    </main>
  );
}
