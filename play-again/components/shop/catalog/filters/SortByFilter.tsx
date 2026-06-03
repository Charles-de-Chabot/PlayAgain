"use client";

import React from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortByFilterProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  isAuthenticated: boolean;
  isMobile?: boolean;
}

/**
 * SortByFilter provides sorting control options.
 */
export default function SortByFilter({
  sortBy,
  setSortBy,
  isAuthenticated,
  isMobile = false,
}: SortByFilterProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Trier par</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-primary/50 cursor-pointer rounded-none appearance-none"
          >
            {isAuthenticated && (
              <option value="match" className="bg-zinc-950 text-white">
                🎯 Compatibilité Sportive
              </option>
            )}
            <option value="recent" className="bg-zinc-950 text-white">
              ✨ Plus récents
            </option>
            <option value="price_asc" className="bg-zinc-950 text-white">
              📈 Prix : Croissant
            </option>
            <option value="price_desc" className="bg-zinc-950 text-white">
              📉 Prix : Décroissant
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown className="h-3 w-3 text-white/40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
      <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Trier par
      </h3>
      <div className="flex flex-col gap-2">
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setSortBy("match")}
            className={cn(
              "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border cursor-pointer",
              sortBy === "match"
                ? "bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_15px_rgba(125,56,255,0.15)]"
                : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
            )}
          >
            Compatibilité Sportive
          </button>
        )}
        <button
          type="button"
          onClick={() => setSortBy("recent")}
          className={cn(
            "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border cursor-pointer",
            sortBy === "recent"
              ? "bg-brand-primary/20 border-brand-primary text-white"
              : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
          )}
        >
          Plus récents
        </button>
        <button
          type="button"
          onClick={() => setSortBy("price_asc")}
          className={cn(
            "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border cursor-pointer",
            sortBy === "price_asc"
              ? "bg-brand-primary/20 border-brand-primary text-white"
              : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
          )}
        >
          Prix : Croissant
        </button>
        <button
          type="button"
          onClick={() => setSortBy("price_desc")}
          className={cn(
            "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border cursor-pointer",
            sortBy === "price_desc"
              ? "bg-brand-primary/20 border-brand-primary text-white"
              : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
          )}
        >
          Prix : Décroissant
        </button>
      </div>
    </div>
  );
}
