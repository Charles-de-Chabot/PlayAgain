"use client";

import React from "react";
import { Cpu, Search, Lock, Unlock, Trash2 } from "lucide-react";
import { BrandExpertise } from "@/hooks/useTaxonomy";

export interface RulesTableProps {
  ruleSearch: string;
  setRuleSearch: (search: string) => void;
  filteredRules: BrandExpertise[];
  actionLoading: boolean;
  handleToggleLockRule: (rule: BrandExpertise) => void;
  handleDeleteRule: (id: number) => void;
}

/**
 * RulesTable displays and handles deletions/confidence toggling for active AI heuristics.
 */
export default function RulesTable({
  ruleSearch,
  setRuleSearch,
  filteredRules,
  actionLoading,
  handleToggleLockRule,
  handleDeleteRule,
}: RulesTableProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Recherche et stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Règles d'apprentissage en base</span>
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Chercher marque, gamme..."
            value={ruleSearch}
            onChange={(e) => setRuleSearch(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold w-48 placeholder-slate-600"
          />
        </div>
      </div>

      {filteredRules.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-bold text-xs">
          Aucune règle d'expertise trouvée pour cette recherche.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] text-slate-500 uppercase tracking-widest font-black">
                <th className="py-3 px-2">Marque</th>
                <th className="py-3 px-2">Gamme / Modèle</th>
                <th className="py-3 px-2">Niveau</th>
                <th className="py-3 px-2 text-center">Confiance</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => {
                // Couleur du badge de niveau
                let lvlColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (rule.level === "INTERMEDIATE") lvlColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                if (rule.level === "ADVANCED") lvlColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (rule.level === "PRO") {
                  lvlColor = "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]";
                }

                // Couleur de la confiance
                let confColor = "bg-red-500";
                if (rule.confidence >= 0.5 && rule.confidence < 0.8) confColor = "bg-amber-500";
                if (rule.confidence >= 0.8) confColor = "bg-emerald-500";
                if (rule.confidence === 1.0) confColor = "bg-yellow-500";

                return (
                  <tr
                    key={rule.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="py-3 px-2 font-extrabold text-white uppercase tracking-wider">
                      {rule.brandName}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-300 uppercase tracking-wider">
                      {rule.rangeName}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${lvlColor}`}>
                        {rule.level}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        {rule.confidence === 1.0 ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-yellow-400 drop-shadow-[0_0_4px_rgba(234,179,8,0.25)] uppercase bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>LOCK</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 w-16">
                            <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${confColor}`} style={{ width: `${rule.confidence * 100}%` }}></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">
                              {Math.round(rule.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Bascule verrou administrative */}
                        <button
                          onClick={() => handleToggleLockRule(rule)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                            rule.confidence === 1.0
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                              : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                          }`}
                          title={rule.confidence === 1.0 ? "Déverrouiller la confiance" : "Verrouiller administrativement à 1.0"}
                        >
                          {rule.confidence === 1.0 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 active:scale-90 transition-all cursor-pointer"
                          title="Supprimer la règle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
