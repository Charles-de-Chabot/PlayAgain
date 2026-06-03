"use client";

import React from "react";
import { Mail, Phone, Info, ChevronLeft, ChevronRight } from "lucide-react";

export interface StepContactProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * StepContact gathers user email and phone fields.
 */
export default function StepContact({
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  onNext,
  onPrev,
}: StepContactProps) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
          1. Coordonnées de contact
        </h3>
        <p className="text-xs text-zinc-400 font-bold">
          Ces coordonnées doivent correspondre exactement à votre compte PlayAgain pour que l'identité puisse être certifiée.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Adresse e-mail du profil
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-650" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="nom@exemple.com"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <span className="text-[9px] text-zinc-550 block font-medium">
            Saisissez le même e-mail que celui de vos coordonnées de profil.
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-zinc-650" />
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <span className="text-[9px] text-zinc-550 block font-medium">
            Saisissez le même numéro que celui de vos coordonnées de profil.
          </span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-3">
        <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
          Pour modifier définitivement les coordonnées de votre profil, veuillez d'abord le faire dans vos paramètres de compte globaux avant de valider.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 text-[9px] font-black uppercase tracking-widest text-brand-accent transition-all duration-300 shadow-[0_0_15px_rgba(198,255,52,0.03)] cursor-pointer"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
