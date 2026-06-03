"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import RuleInjectorForm from "./RuleInjectorForm";
import RulesTable from "./RulesTable";
import { Brand, BrandExpertise } from "@/hooks/useTaxonomy";

export interface RulesTabProps {
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
  handleSaveRule: (e?: React.FormEvent) => void;
  ruleSearch: string;
  setRuleSearch: (search: string) => void;
  filteredRules: BrandExpertise[];
  handleToggleLockRule: (rule: BrandExpertise) => void;
  handleDeleteRule: (id: number) => void;
}

/**
 * RulesTab coordinates sub-components that manage AI heuristic classification rules.
 */
export default function RulesTab({
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
  handleSaveRule,
  ruleSearch,
  setRuleSearch,
  filteredRules,
  handleToggleLockRule,
  handleDeleteRule,
}: RulesTabProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Formulaire injecteur manuel (2/5) */}
      <div className="lg:col-span-2 space-y-6">
        <RuleInjectorForm
          newRuleBrand={newRuleBrand}
          setNewRuleBrand={setNewRuleBrand}
          newRuleRange={newRuleRange}
          setNewRuleRange={setNewRuleRange}
          newRuleLevel={newRuleLevel}
          setNewRuleLevel={setNewRuleLevel}
          newRuleConfidence={newRuleConfidence}
          setNewRuleConfidence={setNewRuleConfidence}
          ruleBrandSuggestions={ruleBrandSuggestions}
          ruleRangeSuggestions={ruleRangeSuggestions}
          ruleExists={ruleExists}
          actionLoading={actionLoading}
          onSubmit={handleSaveRule}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />

        {/* Info Guide */}
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 text-xs text-slate-400 space-y-3">
          <h4 className="font-extrabold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Fonctionnement de l'Expertise IA</span>
          </h4>
          <p className="leading-relaxed">
            Lorsqu'un utilisateur publie un article, l'algorithme d'IA extrait les mots clés du modèle pour identifier sa gamme.
          </p>
          <p className="leading-relaxed">
            Si une règle existe avec une confiance de <span className="text-yellow-400 font-bold">1.0 (verrou administratif)</span>, l'IA l'adoptera en priorité absolue sans jamais réviser sa prédiction.
          </p>
        </div>
      </div>

      {/* Liste des règles calibrées (3/5) */}
      <div className="lg:col-span-3 space-y-6">
        <RulesTable
          ruleSearch={ruleSearch}
          setRuleSearch={setRuleSearch}
          filteredRules={filteredRules}
          actionLoading={actionLoading}
          handleToggleLockRule={handleToggleLockRule}
          handleDeleteRule={handleDeleteRule}
        />
      </div>
    </div>
  );
}
