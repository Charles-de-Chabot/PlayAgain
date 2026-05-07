"use client";

import { Button } from "@/components/ui/Button";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black px-8 text-center text-white">
      <h2 className="mb-12 text-xl font-bold uppercase tracking-[0.2em]">Bienvenue sur</h2>
      
      <div className="mb-20">
        {/* Remplacer par le logo SVG large de Figma */}
        <img src="images/logoPlayAgain.png" alt="logoPlayAgain" />
      </div>

      <div className="flex w-full flex-col gap-12">
        <Button variant="primary" size="full">Connexion</Button>
        <Button variant="primary" size="full">Inscription</Button>
      </div>

      <button 
        onClick={onContinue}
        className="mt-12 text-sm font-medium italic underline underline-offset-4 opacity-80"
      >
        Continuer sans compte
      </button>
    </div>
  );
}
