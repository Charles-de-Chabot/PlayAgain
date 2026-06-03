"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConditionFilterProps {
  selectedConditions: string[];
  setSelectedConditions: (val: string[]) => void;
  toggleSelection: (val: string, list: string[], setList: (l: string[]) => void) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  NEUF: { label: "Neuf", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  EXCELLENT: { label: "Excellent", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
  BON: { label: "Bon", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
  SATISFAISANT: { label: "Satisfaisant", color: "text-orange-400 border-orange-500/20 bg-orange-500/5" },
};

/**
 * ConditionFilter presents wear conditions options.
 */
export default function ConditionFilter({
  selectedConditions,
  setSelectedConditions,
  toggleSelection,
  isMobile = false,
  isOpen = false,
  setIsOpen,
}: ConditionFilterProps) {
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
              État du matériel
            </span>
            {selectedConditions.length > 0 && (
              <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-brand-primary text-white animate-pulse">
                {selectedConditions.length}
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
              {Object.entries(conditionLabels).map(([key, value]) => {
                const isChecked = selectedConditions.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSelection(key, selectedConditions, setSelectedConditions)}
                    className={cn(
                      "px-3 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all italic cursor-pointer",
                      isChecked
                        ? "bg-brand-primary/20 border-brand-primary text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    )}
                  >
                    {value.label}
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
      <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">État</h3>
      <div className="flex flex-col gap-2.5">
        {Object.entries(conditionLabels).map(([key, value]) => {
          const isChecked = selectedConditions.includes(key);
          return (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSelection(key, selectedConditions, setSelectedConditions)}
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
              <span className={cn("font-bold tracking-widest uppercase text-[10px]", value.color.split(" ")[0])}>
                {value.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
