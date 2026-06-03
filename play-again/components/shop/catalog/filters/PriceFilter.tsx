"use client";

import React from "react";

export interface PriceFilterProps {
  minPrice: number | "";
  setMinPrice: (val: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (val: number | "") => void;
  isMobile?: boolean;
}

/**
 * PriceFilter handles minimum and maximum input fields.
 */
export default function PriceFilter({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isMobile = false,
}: PriceFilterProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-1.5 mt-2 text-left">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Prix (€)</span>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 rounded-none text-center"
          />
          <span className="text-white/40 text-xs">à</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 rounded-none text-center"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Prix (€)</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/20 rounded-none text-center"
        />
        <span className="text-white/40 text-xs">à</span>
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/20 rounded-none text-center"
        />
      </div>
    </div>
  );
}
