"use client";

import React from "react";
import { Search } from "lucide-react";

export interface TransactionsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  filterType: "ALL" | "DISPUTED" | "COMPLETED" | "CANCELLED";
  setFilterType: (type: "ALL" | "DISPUTED" | "COMPLETED" | "CANCELLED") => void;
}

/**
 * TransactionsFilters coordinates search query state and status categorization tabs.
 */
export default function TransactionsFilters({
  search,
  setSearch,
  filterType,
  setFilterType,
}: TransactionsFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/[0.01] backdrop-blur-md p-4 rounded-2xl border border-white/[0.06]">
      {/* Barre de Recherche */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Rechercher par ID, acheteur, vendeur, produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-black/40 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-accent/50 text-white rounded-xl py-3 pl-10 pr-4 outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* Filtres de Status (Tabs) */}
      <div className="flex items-center gap-1.5 bg-black/30 border border-white/[0.06] p-1.5 rounded-xl select-none self-start lg:self-auto overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setFilterType("ALL")}
          className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
            filterType === "ALL"
              ? "bg-white/10 text-white border border-white/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tous
        </button>
        <button
          type="button"
          onClick={() => setFilterType("DISPUTED")}
          className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
            filterType === "DISPUTED"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "text-slate-400 hover:text-red-400"
          }`}
        >
          Litiges Ouverts
        </button>
        <button
          type="button"
          onClick={() => setFilterType("COMPLETED")}
          className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
            filterType === "COMPLETED"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-slate-400 hover:text-emerald-400"
          }`}
        >
          Finalisés
        </button>
        <button
          type="button"
          onClick={() => setFilterType("CANCELLED")}
          className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
            filterType === "CANCELLED"
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : "text-slate-400 hover:text-blue-400"
          }`}
        >
          Remboursés
        </button>
      </div>
    </div>
  );
}
