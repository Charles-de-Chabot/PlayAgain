"use client";

import React from "react";
import { Search, Layers, TrendingUp, GitMerge } from "lucide-react";
import { Brand } from "@/hooks/useTaxonomy";

export interface BrandsGridProps {
  brandSearch: string;
  setBrandSearch: (s: string) => void;
  filteredBrands: Brand[];
  onSelectSource: (brand: Brand) => void;
  onSelectTarget: (brand: Brand) => void;
}

/**
 * BrandsGrid renders a grid view of all registered brands, providing filters and quick merge actions.
 */
export default function BrandsGrid({
  brandSearch,
  setBrandSearch,
  filteredBrands,
  onSelectSource,
  onSelectTarget,
}: BrandsGridProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Recherche et stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Registre des marques en base</span>
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher marque..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold w-48 placeholder-slate-600"
          />
        </div>
      </div>

      {filteredBrands.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-bold text-xs">
          Aucune marque trouvée.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredBrands.map((brand) => {
            let posBadge = "bg-white/5 text-slate-400 border-white/5";
            if (brand.marketPosition === "PREMIUM") {
              posBadge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            }
            if (brand.marketPosition === "TECHNICAL") {
              posBadge = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
            }

            return (
              <div
                key={brand.id}
                className="bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08] p-3 rounded-2xl transition-all flex flex-col gap-2 relative group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs uppercase truncate tracking-wider max-w-[70%]">
                    {brand.label}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold font-mono shrink-0">
                    ID: #{brand.id}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 select-none">
                  <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wide ${posBadge}`}>
                    {brand.marketPosition}
                  </span>

                  <span className="text-[10px] text-slate-400 font-extrabold font-mono bg-black/40 border border-white/[0.03] px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>{brand.productCount}</span>
                  </span>
                </div>

                {/* Actions rapides au survol */}
                <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1.5 bg-[#0e1322] border border-white/10 p-1 rounded-lg shadow-xl z-20">
                  <button
                    type="button"
                    onClick={() => onSelectSource(brand)}
                    className="p-1 hover:bg-white/5 text-red-400 hover:text-red-300 rounded transition-all cursor-pointer"
                    title="Fusionner (supprimer)"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTarget(brand)}
                    className="p-1 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 rounded transition-all cursor-pointer"
                    title="Fusionner vers cette marque (conserver)"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
