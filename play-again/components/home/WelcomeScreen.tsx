"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black px-8 text-center text-white overflow-hidden">
      {/* Background Decor - Premium Dark Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-size-[32px_32px] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-black via-zinc-950/80 to-black" />
        
        {/* Subtle Accent Glows (Sharp, not soft halos) */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg">
        

        <h2 className="mb-10 text-xs md:text-sm font-black uppercase tracking-[0.4em] text-zinc-500">
          Bienvenue sur
        </h2>
        
        <div className="mb-6 transform hover:scale-105 transition-transform duration-700 ease-out">
          <img 
            src="/images/logoPlayAgain.png" 
            alt="logoPlayAgain" 
            className="w-[300px] md:w-[400px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </div>

        <p className="mb-16 text-brand-accent font-bold italic uppercase tracking-[0.2em] text-[10px] md:text-xs">
          Redonnez vie à vos équipements
        </p>

        {/* Buttons Section with glass effect */}
        <div className="w-full bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl">
          <div className="flex w-full flex-col gap-5">
            <Link href="/auth/login" className="w-full group">
              <Button variant="primary" size="full" className="rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] group-hover:bg-brand-accent group-hover:text-black transition-all duration-500 flex items-center justify-center gap-2">
                Se connecter
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full">
              <Button variant="outline" size="full" className="rounded-2xl border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-500">
                Créer un compte
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Ou</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <button 
            onClick={onContinue}
            className="mt-8 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-brand-accent transition-all duration-300"
          >
            Explorer sans s'inscrire
          </button>
        </div>
        
        {/* Footer info */}
        <p className="mt-12 text-[10px] text-zinc-600 font-medium">
          En continuant, vous acceptez nos <span className="underline cursor-pointer">Conditions d'Utilisation</span>
        </p>
      </div>
    </div>
  );
}
