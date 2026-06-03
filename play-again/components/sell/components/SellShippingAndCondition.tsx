"use client";

import React from "react";
import { Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SellShippingAndConditionProps {
  userCity: string | null;
  state: string;
  onSelectState: (val: string) => void;
  age: string;
  onChangeAge: (val: string) => void;
  accessoryIncluded: boolean;
  onToggleAccessory: () => void;
  isShippingAvailable: boolean;
  onToggleShipping: () => void;
}

export default function SellShippingAndCondition({
  userCity,
  state,
  onSelectState,
  age,
  onChangeAge,
  accessoryIncluded,
  onToggleAccessory,
  isShippingAvailable,
  onToggleShipping,
}: SellShippingAndConditionProps) {
  const states = [
    { value: "NEUF", label: "Neuf avec étiquette" },
    { value: "EXCELLENT", label: "Très bon état" },
    { value: "BON", label: "Bon état" },
    { value: "SATISFAISANT", label: "Satisfaisant" },
  ];

  return (
    <section className="relative z-20 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">État & Logistique</h2>
        </div>

        {userCity && (
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/80 border border-white/5 backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
              Expédition depuis : <span className="text-white italic">{userCity}</span>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* État de l'article */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic font-sans">
            État général de l'article
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {states.map((s) => {
              const isSelected = state === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSelectState(s.value)}
                  className={cn(
                    "p-5 border text-[10px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center gap-2 group cursor-pointer relative overflow-hidden",
                    isSelected
                      ? "bg-brand-primary border-brand-primary text-white shadow-[0_10px_30px_rgba(125,56,255,0.2)]"
                      : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20"
                  )}
                >
                  {s.label}
                  <div
                    className={cn(
                      "h-1 w-full absolute bottom-0 left-0 transition-transform duration-300",
                      isSelected ? "bg-brand-accent scale-x-100" : "bg-white/5 scale-x-0"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille technique 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Année */}
          <div className="bg-zinc-950/50 border border-white/5 p-6 hover:border-white/10 transition-colors">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic font-sans">
              Année de fabrication
            </label>
            <div className="relative">
              <input
                type="number"
                name="age"
                value={age}
                onChange={(e) => onChangeAge(e.target.value)}
                placeholder="Ex: 2023"
                className="w-full bg-transparent border-b border-white/10 pb-2 text-xl font-black text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-zinc-800"
              />
            </div>
          </div>

          {/* Accessoires */}
          <div className="bg-zinc-950/50 border border-white/5 p-6 hover:border-white/10 transition-colors">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic font-sans">
              Accessoires fournis
            </label>
            <button
              type="button"
              onClick={onToggleAccessory}
              className={cn(
                "w-full py-2 border-b transition-all text-left text-xl font-black tracking-tight cursor-pointer bg-transparent",
                accessoryIncluded ? "border-brand-accent text-brand-accent" : "border-white/10 text-zinc-700"
              )}
            >
              {accessoryIncluded ? "OUI" : "NON, SEUL"}
            </button>
          </div>

          {/* Livraison */}
          <div
            className={cn(
              "p-6 border transition-all flex flex-col justify-between group",
              isShippingAvailable ? "bg-brand-accent/5 border-brand-accent/20" : "bg-zinc-950/50 border-white/5"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic font-sans">
                Envoi par colis
              </label>
              <button
                type="button"
                onClick={onToggleShipping}
                className={cn(
                  "w-12 h-6 flex items-center p-1 transition-colors duration-300 cursor-pointer",
                  isShippingAvailable ? "bg-brand-accent" : "bg-zinc-800"
                )}
              >
                <div
                  className={cn(
                    "bg-black w-4 h-4 shadow-lg transform transition-transform duration-300",
                    isShippingAvailable ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ChevronRight
                className={cn(
                  "w-5 h-5 transition-transform",
                  isShippingAvailable ? "text-brand-accent rotate-90" : "text-zinc-800"
                )}
              />
              <span className={cn("text-xs font-black uppercase italic", isShippingAvailable ? "text-white" : "text-zinc-800")}>
                {isShippingAvailable ? "DISPONIBLE" : "NON DISPONIBLE"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
