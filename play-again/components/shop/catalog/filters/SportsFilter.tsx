"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "../../hooks/useShopFilters";

export interface SportsFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (val: number | null) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

/**
 * SportsFilter displays the sport category buttons/links.
 */
export default function SportsFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  isMobile = false,
  isOpen = false,
  setIsOpen,
}: SportsFilterProps) {
  const activeCategories = categories.filter((cat) => cat.productCount && cat.productCount > 0);

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
              Sports
            </span>
            {selectedCategory !== null && (
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
            <div className="grid grid-cols-2 gap-2 mt-2">
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    "px-3 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all italic cursor-pointer",
                    selectedCategory === cat.id
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
        Sports
        {selectedCategory !== null && (
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-[10px] text-brand-primary lowercase hover:underline cursor-pointer"
          >
            Tous
          </button>
        )}
      </h3>
      <div className="flex flex-wrap gap-2">
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={cn(
              "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer italic",
              selectedCategory === cat.id
                ? "bg-brand-primary border-brand-primary text-white"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/25"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
