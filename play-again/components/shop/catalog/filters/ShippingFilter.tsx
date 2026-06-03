"use client";

import React from "react";
import { Truck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShippingFilterProps {
  isShipping: boolean;
  setIsShipping: (val: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  minPrice?: number | "";
  setMinPrice?: (val: number | "") => void;
  maxPrice?: number | "";
  setMaxPrice?: (val: number | "") => void;
}

/**
 * ShippingFilter provides parcel shipping availability checkbox filter.
 */
export default function ShippingFilter({
  isShipping,
  setIsShipping,
  isMobile = false,
  isOpen = false,
  setIsOpen,
  minPrice = "",
  setMinPrice,
  maxPrice = "",
  setMaxPrice,
}: ShippingFilterProps) {
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
              Prix & Options
            </span>
            {(minPrice !== "" || maxPrice !== "" || isShipping) && (
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
          <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Tranche de prix */}
            {setMinPrice && setMaxPrice && (
              <div className="flex flex-col gap-1.5 mt-2">
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
            )}

            {/* Option de livraison */}
            <div className="bg-white/5 border border-white/10 rounded-[15px] p-3">
              <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={isShipping}
                  onChange={() => setIsShipping(!isShipping)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-all",
                    isShipping ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                  )}
                >
                  {isShipping && <span className="text-[10px] font-black">✓</span>}
                </div>
                <Truck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-widest">Livraison possible</span>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/80 hover:text-white">
        <input
          type="checkbox"
          checked={isShipping}
          onChange={() => setIsShipping(!isShipping)}
          className="sr-only"
        />
        <div
          className={cn(
            "w-4 h-4 border flex items-center justify-center transition-all",
            isShipping ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
          )}
        >
          {isShipping && <span className="text-[10px] font-black">✓</span>}
        </div>
        <Truck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest">Livraison possible</span>
      </label>
    </div>
  );
}
