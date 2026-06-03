"use client";

import React from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SellGeneralDetailsProps {
  title: string;
  targetGender: string;
  description: string;
  onChangeField: (name: string, value: string) => void;
}

export default function SellGeneralDetails({
  title,
  targetGender,
  description,
  onChangeField,
}: SellGeneralDetailsProps) {
  const genders = [
    { value: "MAN", label: "Homme" },
    { value: "WOMAN", label: "Femme" },
    { value: "UNISEX", label: "Unisexe" },
    { value: "KIDS", label: "Enfant" },
  ];

  return (
    <section className="relative z-30 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
          <Package className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tight">Détails de l'article</h2>
      </div>

      <div className="space-y-8">
        {/* Titre */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">
            Titre de l'annonce
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => onChangeField("title", e.target.value)}
            placeholder="Ex: Paire de Skis Rossignol Hero 2023..."
            className="w-full bg-zinc-950/50 border border-white/10 p-5 rounded-none text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-bold placeholder:text-zinc-700 placeholder:italic text-lg"
          />
        </div>

        {/* Public / Genre ciblé */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 italic">
            Genre / Public ciblé
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {genders.map((g) => {
              const isSelected = targetGender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => onChangeField("targetGender", g.value)}
                  className={cn(
                    "p-4 border text-[10px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 group cursor-pointer relative overflow-hidden",
                    isSelected
                      ? "bg-brand-primary border-brand-primary text-white shadow-[0_10px_30px_rgba(125,56,255,0.2)]"
                      : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20"
                  )}
                >
                  {g.label}
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

        {/* Description */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">
            Description détaillée
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => onChangeField("description", e.target.value)}
            placeholder="Décrivez les caractéristiques techniques, l'état d'usure, ou toute information utile pour l'acheteur..."
            className="w-full bg-zinc-950/50 border border-white/10 p-5 rounded-none text-white focus:outline-none focus:border-brand-primary transition-all font-medium placeholder:text-zinc-700 placeholder:italic resize-none min-h-[120px]"
          />
        </div>
      </div>
    </section>
  );
}
