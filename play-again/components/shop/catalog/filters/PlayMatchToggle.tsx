"use client";

import React from "react";
import { Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlayMatchToggleProps {
  onlyRecommended: boolean;
  setOnlyRecommended: (val: boolean) => void;
  isMobile?: boolean;
}

/**
 * PlayMatchToggle provides the toggle switch for user favorite compatibility filtering.
 */
export default function PlayMatchToggle({
  onlyRecommended,
  setOnlyRecommended,
  isMobile = false,
}: PlayMatchToggleProps) {
  if (isMobile) {
    return (
      <div className="bg-linear-to-br from-brand-primary/15 to-brand-accent/5 border border-brand-primary/20 rounded-[20px] p-4 shrink-0 text-left">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent">PlayMatch IA</span>
            </div>
            <span className="text-[10px] font-semibold text-white/80">Pour mon profil sportif</span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyRecommended(!onlyRecommended)}
            className={cn(
              "w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer",
              onlyRecommended ? "bg-brand-accent" : "bg-white/10"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-black transition-transform duration-300",
                onlyRecommended ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
        </div>
        <p className="text-[8.5px] text-white/40 mt-2.5 leading-relaxed flex items-start gap-1">
          <Info className="w-3 h-3 shrink-0 text-brand-accent mt-0.5" />
          Masque tous les articles inadaptés à vos sports favoris ou votre niveau de sport.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-brand-primary/10 to-brand-accent/5 border border-brand-primary/20 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">PlayMatch</span>
          </div>
          <span className="text-[11px] font-medium text-white/80">Pour mon profil</span>
        </div>
        <button
          type="button"
          onClick={() => setOnlyRecommended(!onlyRecommended)}
          className={cn(
            "w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer",
            onlyRecommended ? "bg-brand-accent" : "bg-white/10"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-black transition-transform duration-300",
              onlyRecommended ? "translate-x-6" : "translate-x-0"
            )}
          />
        </button>
      </div>
      <p className="text-[9px] text-white/50 mt-3 leading-relaxed flex items-start gap-1">
        <Info className="w-3 h-3 shrink-0 text-brand-accent mt-0.5" />
        Affiche seulement les articles de vos sports favoris correspondant à votre niveau.
      </p>
    </div>
  );
}
