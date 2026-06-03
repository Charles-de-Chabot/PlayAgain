"use client";

import React from "react";
import { Search } from "lucide-react";

export interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isMobile?: boolean;
}

/**
 * SearchFilter handles textual keyword input queries.
 */
export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  isMobile = false,
}: SearchFilterProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Recherche</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Ski, vélo, raquettes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-primary/50 placeholder:text-white/25 rounded-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl relative">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
        Recherche
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-[10px] text-brand-primary lowercase hover:underline cursor-pointer"
          >
            Effacer
          </button>
        )}
      </h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Ski, vélo, chaussures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 placeholder:text-white/25 rounded-none"
        />
      </div>
    </div>
  );
}
