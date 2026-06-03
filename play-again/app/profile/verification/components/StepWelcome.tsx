"use client";

import React from "react";
import { Sparkles, FileText, Info, Lock, ChevronLeft, ChevronRight } from "lucide-react";

export interface StepWelcomeProps {
  onNext: () => void;
  onCancel: () => void;
}

/**
 * StepWelcome renders the introduction instructions and documents checklist.
 */
export default function StepWelcome({ onNext, onCancel }: StepWelcomeProps) {
  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Section 1: Pourquoi certifier ? */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          Pourquoi certifier votre profil ?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-brand-primary/20 hover:bg-zinc-900/60 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm">
              🛡️
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Badge de confiance</h4>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Obtenez un badge vert visible sur votre profil et vos annonces pour prouver votre authenticité aux acheteurs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-brand-accent/20 hover:bg-zinc-900/60 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm">
              🚀
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Visibilité accrue</h4>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Vos annonces bénéficient d'un boost de visibilité et sont mises en avant dans les résultats de recherche.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-sm">
              🔒
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Sécurité totale</h4>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Participez à la création d'un espace d'échange sain et protégé contre les usurpations et les fraudes.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Le processus */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-primary" />
          Le processus de certification
        </h3>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-5">
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Le parcours se compose de <strong>4 étapes rapides</strong> et prend moins de <strong>3 minutes</strong> à remplir. Une fois soumis, notre équipe vérifie vos documents sous <strong>24 à 48 heures</strong>.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {/* Etape 1 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                1
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block font-black">Contact</span>
                <span className="text-[8px] text-zinc-500 font-bold">E-mail &amp; portable</span>
              </div>
            </div>

            {/* Etape 2 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                2
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block font-black">Adresse</span>
                <span className="text-[8px] text-zinc-500 font-bold">Résidence principale</span>
              </div>
            </div>

            {/* Etape 3 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                3
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block font-black">Identité</span>
                <span className="text-[8px] text-zinc-500 font-bold">Pièce d'identité</span>
              </div>
            </div>

            {/* Etape 4 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                4
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white block font-black">Selfie</span>
                <span className="text-[8px] text-zinc-500 font-bold">Mention manuscrite</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Documents à prévoir */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-accent" />
          Documents et éléments à prévoir
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-4 items-start hover:border-white/10 transition-colors duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 text-lg">
              🪪
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Pièce d'identité valide</h4>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                Une photo très nette et lisible de votre <strong>Carte Nationale d'Identité</strong> (recto + verso), votre <strong>Passeport</strong> ou votre <strong>Permis de conduire</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-4 items-start hover:border-white/10 transition-colors duration-300">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0 mt-0.5 text-lg">
              📝
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Feuille &amp; stylo pour le selfie</h4>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                Vous devrez vous prendre en photo (selfie) tout en tenant une feuille blanche sur laquelle vous aurez écrit de façon bien lisible la mention manuscrite exacte : <strong>"Play Again"</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RGPD Disclaimer */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 flex gap-3 items-center hover:border-white/10 transition-colors duration-300">
        <Lock className="w-4 h-4 text-zinc-650 shrink-0" />
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
          Vos documents sont cryptés et stockés en toute sécurité. Ils sont uniquement utilisés par notre service de modération pour valider votre compte et ne seront jamais partagés ni visibles publiquement.
        </p>
      </div>

      {/* Boutons explicites d'étape welcome */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au profil
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] text-[10px] font-black uppercase tracking-widest text-black transition-all duration-300 cursor-pointer"
        >
          Commencer la certification
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
