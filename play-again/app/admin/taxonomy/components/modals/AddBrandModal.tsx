"use client";

import React, { useRef } from "react";
import { Bookmark, ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import { Brand } from "@/hooks/useTaxonomy";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  newBrandLabel: string;
  setNewBrandLabel: (label: string) => void;
  newBrandPosition: string;
  setNewBrandPosition: (pos: string) => void;
  brandExists: boolean;
  suggestedExistingBrands: Brand[];
  onSubmit: (e?: React.FormEvent) => void;
  actionLoading: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (d: string | null) => void;
}

/**
 * AddBrandModal allows administrators to define a new official brand with its market positioning.
 */
export function AddBrandModal({
  isOpen,
  onClose,
  newBrandLabel,
  setNewBrandLabel,
  newBrandPosition,
  setNewBrandPosition,
  brandExists,
  suggestedExistingBrands,
  onSubmit,
  actionLoading,
  activeDropdown,
  setActiveDropdown,
}: AddBrandModalProps) {
  const dropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "newBrandPosition") {
      setActiveDropdown(null);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0E1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative">
        <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-white/[0.06] pb-3 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-400" />
          <span>Créer une Marque Officielle</span>
        </h3>

        <form onSubmit={onSubmit} className="space-y-4 mt-4 text-xs">
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Libellé officiel de la marque</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: NIKE, ADIDAS"
                value={newBrandLabel}
                onChange={(e) => setNewBrandLabel(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
              />
              {brandExists && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase">
                  Existe déjà
                </span>
              )}
            </div>

            {/* Suggestions d'autocomplétion */}
            {suggestedExistingBrands.length > 0 && (
              <div className="bg-black/20 border border-white/5 rounded-xl p-3 space-y-1.5 max-h-32 overflow-y-auto">
                <div className="text-[9px] text-slate-500 uppercase font-black">Marques existantes similaires :</div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedExistingBrands.map((b) => {
                    const isExact = b.label.toLowerCase() === newBrandLabel.trim().toLowerCase();
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setNewBrandLabel(b.label)}
                        className={`px-2 py-1 rounded border text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                          isExact
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {brandExists && (
            <div className="text-[10px] text-red-400 font-extrabold flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Cette marque existe déjà. Impossible de la recréer.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Positionnement sur le marché</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "newBrandPosition" ? null : "newBrandPosition")}
                className={`w-full flex items-center justify-between bg-black/40 border ${
                  activeDropdown === "newBrandPosition"
                    ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                    : "border-white/10 text-slate-300 hover:border-white/20"
                } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
              >
                <span>
                  {newBrandPosition === "GENERALIST" && "🌍 GENERALIST (Grand public / Standard)"}
                  {newBrandPosition === "TECHNICAL" && "⚙️ TECHNICAL (Technique / Spécialisé)"}
                  {newBrandPosition === "PREMIUM" && "👑 PREMIUM (Haut de Gamme / Luxe)"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                    activeDropdown === "newBrandPosition" ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {activeDropdown === "newBrandPosition" && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                  <div className="p-1 space-y-0.5">
                    {[
                      { value: "GENERALIST", label: "🌍 GENERALIST (Grand public / Standard)" },
                      { value: "TECHNICAL", label: "⚙️ TECHNICAL (Technique / Spécialisé)" },
                      { value: "PREMIUM", label: "👑 PREMIUM (Haut de Gamme / Luxe)" },
                    ].map((option) => {
                      const isSelected = newBrandPosition === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setNewBrandPosition(option.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                            isSelected
                              ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading || brandExists || !newBrandLabel.trim()}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Créer la marque</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
