"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GenderFilterProps {
  selectedGenders: string[];
  setSelectedGenders: (val: string[]) => void;
  toggleSelection: (val: string, list: string[], setList: (l: string[]) => void) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

const genderLabels: Record<string, string> = {
  MAN: "Homme",
  WOMAN: "Femme",
  UNISEX: "Unisexe",
  KIDS: "Enfant",
};

/**
 * GenderFilter displays target gender selections.
 */
export default function GenderFilter({
  selectedGenders,
  setSelectedGenders,
  toggleSelection,
  isMobile = false,
  isOpen = false,
  setIsOpen,
}: GenderFilterProps) {
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
              Genre
            </span>
            {selectedGenders.length > 0 && (
              <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-brand-primary text-white animate-pulse">
                {selectedGenders.length}
              </span>
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
              {Object.entries(genderLabels).map(([key, label]) => {
                const isChecked = selectedGenders.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSelection(key, selectedGenders, setSelectedGenders)}
                    className={cn(
                      "px-3 py-2.5 border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      isChecked
                        ? "bg-brand-primary/20 border-brand-primary text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl text-left">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Genre</h3>
      <div className="flex flex-col gap-2.5">
        {Object.entries(genderLabels).map(([key, label]) => {
          const isChecked = selectedGenders.includes(key);
          return (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSelection(key, selectedGenders, setSelectedGenders)}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-4 h-4 border flex items-center justify-center transition-all",
                  isChecked ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                )}
              >
                {isChecked && <span className="text-[10px] font-black">✓</span>}
              </div>
              <span className="text-[10px] font-semibold tracking-wider">{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
