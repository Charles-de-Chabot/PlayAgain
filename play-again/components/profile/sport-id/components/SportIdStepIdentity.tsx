"use client";

import React from "react";
import { User, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPORTS_ICONS } from "../sportConstants";

export interface SportIdStepIdentityProps {
  gender: string;
  setGender: (gender: string) => void;
  interests: string[];
  onToggleInterest: (sportLabel: string) => void;
  categories: any[];
}

export default function SportIdStepIdentity({
  gender,
  setGender,
  interests,
  onToggleInterest,
  categories,
}: SportIdStepIdentityProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
          Ton Identité <span className="text-brand-accent">Sportive</span>
        </h2>
        <p className="text-zinc-500 text-sm font-medium">
          Commençons par les bases pour personnaliser ton expérience.
        </p>
      </div>

      {/* Genre Section */}
      <div className="space-y-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
          Genre
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: "MAN", label: "Homme" },
            { id: "WOMAN", label: "Femme" },
            { id: "KIDS", label: "Enfant" },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGender(g.id)}
              className={cn(
                "group p-6 border-2 transition-all flex flex-col items-center gap-3 cursor-pointer rounded-none relative overflow-hidden",
                gender === g.id
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20"
              )}
            >
              {gender === g.id && (
                <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 -mr-3 -mt-3 rotate-45" />
              )}
              <User
                className={cn(
                  "w-8 h-8",
                  gender === g.id ? "text-white" : "text-zinc-700 group-hover:text-zinc-400"
                )}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sports Section */}
      <div className="space-y-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
          Tes Sports Favoris
        </label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = interests.includes(cat.label);
            const labelKey = cat.label.trim().toUpperCase();
            const IconComponent = SPORTS_ICONS[labelKey] || Award;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleInterest(cat.label)}
                className={cn(
                  "p-4 border-2 transition-all flex flex-col items-center gap-2 cursor-pointer rounded-none relative group h-28 justify-center",
                  isSelected
                    ? "bg-brand-accent border-brand-accent text-black"
                    : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/10"
                )}
              >
                <IconComponent
                  className={cn("w-5 h-5", isSelected ? "text-black" : "text-zinc-700 group-hover:text-zinc-500")}
                />
                <span className="text-[11px] font-black uppercase tracking-tighter w-full text-center leading-tight whitespace-normal">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
