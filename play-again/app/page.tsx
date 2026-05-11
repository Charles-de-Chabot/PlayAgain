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
  const { loading } = useAuth();

  // On évite le flash de contenu pendant le chargement des hooks
  if (isFirstVisit === null || loading) {
    return <div className="min-h-screen bg-black" />;
  }

  // Écran 1 : Première visite (Image 1)
  if (isFirstVisit) {
    return <WelcomeScreen onContinue={completeFirstVisit} />;
  }

  // Écrans 2 & 3 : Home (Connecté ou non) (Image 2)
  return (
    <main className="min-h-screen bg-white pb-24">
      <Header />
      
      <HomeHero />
      
      <ProductGrid />

      {/* Barre de navigation mobile fixe en bas */}
      <MobileNavbar />
    </main>
  );
}
