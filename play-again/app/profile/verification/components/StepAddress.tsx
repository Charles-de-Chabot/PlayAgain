"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StepAddressProps {
  streetNumberInput: string;
  setStreetNumberInput: (val: string) => void;
  streetNameInput: string;
  setStreetNameInput: (val: string) => void;
  cityInput: string;
  setCityInput: (val: string) => void;
  zipInput: string;
  setZipInput: (val: string) => void;
  countryInput: string;
  setCountryInput: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * StepAddress gathers user residency addresses.
 */
export default function StepAddress({
  streetNumberInput,
  setStreetNumberInput,
  streetNameInput,
  setStreetNameInput,
  cityInput,
  setCityInput,
  zipInput,
  setZipInput,
  countryInput,
  setCountryInput,
  onNext,
  onPrev,
}: StepAddressProps) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
          2. Adresse principale de résidence
        </h3>
        <p className="text-xs text-zinc-400 font-bold">
          Entrer votre adresse. Elle doit correspondre exactement a votre adresse principal sur Play Again.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
              Numéro
            </label>
            <input
              type="text"
              value={streetNumberInput}
              onChange={(e) => setStreetNumberInput(e.target.value)}
              placeholder="12bis"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <div className="col-span-3 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
              Nom de la rue
            </label>
            <input
              type="text"
              value={streetNameInput}
              onChange={(e) => setStreetNameInput(e.target.value)}
              placeholder="Avenue des Champs Elysées"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
              Code Postal
            </label>
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              placeholder="75008"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
              Ville
            </label>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Paris"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Pays
          </label>
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            placeholder="France"
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>
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
