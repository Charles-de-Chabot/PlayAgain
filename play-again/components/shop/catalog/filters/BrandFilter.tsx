"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand } from "../../hooks/useShopFilters";

export interface BrandFilterProps {
  brands: Brand[];
  selectedBrand: number | null;
  setSelectedBrand: (val: number | null) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

/**
 * BrandFilter renders select dropdown for brand filters.
 */
export default function BrandFilter({
  brands,
  selectedBrand,
  setSelectedBrand,
  isMobile = false,
  isOpen = false,
  setIsOpen,
}: BrandFilterProps) {
  if (isMobile) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0 text-left">
        <button
          type="button"
          onClick={() => setIsOpen?.(!isOpen)}
          className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">
              Marque
            </span>
            {selectedBrand !== null && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
              isOpen ? "rotate-180 text-brand-primary" : ""
            )}
          />
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative mt-2">
              <select
                value={selectedBrand || ""}
                onChange={(e) => setSelectedBrand(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white/80 focus:outline-none appearance-none rounded-none cursor-pointer"
              >
                <option value="" className="bg-zinc-950 text-white">
                  Toutes les marques
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-zinc-950 text-white">
                    {b.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown className="h-3 w-3 text-white/40" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
        Marques
        {selectedBrand !== null && (
          <button
            type="button"
            onClick={() => setSelectedBrand(null)}
            className="text-[10px] text-brand-primary lowercase hover:underline cursor-pointer"
          >
            Toutes
          </button>
        )}
      </h3>
      <div className="relative">
        <select
          value={selectedBrand || ""}
          onChange={(e) => setSelectedBrand(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-primary/50 cursor-pointer rounded-none appearance-none"
        >
          <option value="" className="bg-zinc-950 text-white">
            Toutes les marques
          </option>
          {brands.map((b) => (
            <option key={b.id} value={b.id} className="bg-zinc-950 text-white">
              {b.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown className="h-3 w-3 text-white/40" />
        </div>
      </div>
    </div>
  );
}
