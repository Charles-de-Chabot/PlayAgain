"use client";

import React, { useRef } from "react";
import { Sparkles, Cpu, ChevronDown, Check, Loader2, Plus, AlertCircle } from "lucide-react";
import { Brand } from "@/hooks/useTaxonomy";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface RuleInjectorFormProps {
  newRuleBrand: string;
  setNewRuleBrand: (b: string) => void;
  newRuleRange: string;
  setNewRuleRange: (r: string) => void;
  newRuleLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
  setNewRuleLevel: (l: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO") => void;
  newRuleConfidence: string;
  setNewRuleConfidence: (c: string) => void;
  ruleBrandSuggestions: Brand[];
  ruleRangeSuggestions: string[];
  ruleExists: boolean;
  actionLoading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  activeDropdown: string | null;
  setActiveDropdown: (d: string | null) => void;
}

/**
 * RuleInjectorForm component processes and saves customized AI heuristic evaluation guidelines.
 */
export default function RuleInjectorForm({
  newRuleBrand,
  setNewRuleBrand,
  newRuleRange,
  setNewRuleRange,
  newRuleLevel,
  setNewRuleLevel,
  newRuleConfidence,
  setNewRuleConfidence,
  ruleBrandSuggestions,
  ruleRangeSuggestions,
  ruleExists,
  actionLoading,
  onSubmit,
  activeDropdown,
  setActiveDropdown,
}: RuleInjectorFormProps) {
  const levelDropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "newRuleLevel") {
      setActiveDropdown(null);
    }
  });

  const confidenceDropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (activeDropdown === "newRuleConfidence") {
      setActiveDropdown(null);
    }
  });

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Cpu className="w-32 h-32 text-emerald-400" />
      </div>

      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
        <Sparkles className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xs font-black text-white uppercase tracking-wider">
          Injecteur de Règle IA Manuel
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        {/* Marque */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Marque de l'article (ex: Babolat, Salomon)
          </label>
          <input
            type="text"
            placeholder="Ex: BABOLAT"
            value={newRuleBrand}
            onChange={(e) => setNewRuleBrand(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
          />

          {/* Suggestions d'autocomplétion pour la marque */}
          {ruleBrandSuggestions.length > 0 && (
            <div className="absolute z-30 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5 max-h-40 overflow-y-auto">
              {ruleBrandSuggestions.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setNewRuleBrand(b.label)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                >
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gamme / Modèle */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Mot-clé de Gamme / Modèle exact
          </label>
          <input
            type="text"
            placeholder="Ex: PURE AERO"
            value={newRuleRange}
            onChange={(e) => setNewRuleRange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
          />

          {/* Suggestions d'autocomplétion pour la gamme */}
          {ruleRangeSuggestions.length > 0 && (
            <div className="absolute z-30 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5 max-h-40 overflow-y-auto">
              {ruleRangeSuggestions.map((range, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setNewRuleRange(range)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                >
                  <span>{range}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {ruleExists && (
          <div className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Cette règle existe déjà et sera mise à jour / écrasée.</span>
          </div>
        )}

        {/* Classification forcée */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Classification de niveau forcée
          </label>
          <div className="relative" ref={levelDropdownRef}>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "newRuleLevel" ? null : "newRuleLevel")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "newRuleLevel"
                  ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                  : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <span>
                {newRuleLevel === "BEGINNER" && "🟢 BEGINNER (Débutant / Loisir)"}
                {newRuleLevel === "INTERMEDIATE" && "🔵 INTERMEDIATE (Perfectionnement)"}
                {newRuleLevel === "ADVANCED" && "🟣 ADVANCED (Performant / Confirmé)"}
                {newRuleLevel === "PRO" && "🔴 PRO (Compétition / Expert)"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                  activeDropdown === "newRuleLevel" ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {activeDropdown === "newRuleLevel" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "BEGINNER", label: "🟢 BEGINNER (Débutant / Loisir)" },
                    { value: "INTERMEDIATE", label: "🔵 INTERMEDIATE (Perfectionnement)" },
                    { value: "ADVANCED", label: "🟣 ADVANCED (Performant / Confirmé)" },
                    { value: "PRO", label: "🔴 PRO (Compétition / Expert)" },
                  ].map((option) => {
                    const isSelected = newRuleLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setNewRuleLevel(option.value as any);
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

        {/* Confiance verrouillée */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Indice de confiance (Verrou Admin)
          </label>
          <div className="relative" ref={confidenceDropdownRef}>
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(activeDropdown === "newRuleConfidence" ? null : "newRuleConfidence")
              }
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "newRuleConfidence"
                  ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                  : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <span>
                {newRuleConfidence === "1.0" && "🔒 1.0 — Verrou Administrative Prioritaire"}
                {newRuleConfidence === "0.9" && "⚡ 0.9 — Haute Confiance IA"}
                {newRuleConfidence === "0.75" && "⚙️ 0.75 — Confiance Standard"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                  activeDropdown === "newRuleConfidence" ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {activeDropdown === "newRuleConfidence" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "1.0", label: "🔒 1.0 — Verrou Administrative Prioritaire" },
                    { value: "0.9", label: "⚡ 0.9 — Haute Confiance IA" },
                    { value: "0.75", label: "⚙️ 0.75 — Confiance Standard" },
                  ].map((option) => {
                    const isSelected = newRuleConfidence === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setNewRuleConfidence(option.value);
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

        <button
          type="submit"
          disabled={actionLoading || !newRuleBrand.trim() || !newRuleRange.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Injecter et verrouiller la règle</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
