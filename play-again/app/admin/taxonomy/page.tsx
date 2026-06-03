"use client";

import { useState } from "react";
import { Tags, Cpu, Plus, Loader2, Layers } from "lucide-react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useToast } from "@/components/providers/ToastProvider";
import RulesTab from "./components/RulesTab";
import BrandsTab from "./components/BrandsTab";
import { AddBrandModal } from "./components/modals/AddBrandModal";

export default function TaxonomyAdminPage() {
  const { showToast } = useToast();
  const {
    brands,
    rules,
    loading,
    actionLoading,
    activeTab,
    setActiveTab,

    ruleSearch,
    setRuleSearch,
    brandSearch,
    setBrandSearch,

    newRuleBrand,
    setNewRuleBrand,
    newRuleRange,
    setNewRuleRange,
    newRuleLevel,
    setNewRuleLevel,
    newRuleConfidence,
    setNewRuleConfidence,

    mergeSourceId,
    setMergeSourceId,
    mergeTargetId,
    setMergeTargetId,
    mergeSearchSource,
    setMergeSearchSource,
    mergeSearchTarget,
    setMergeSearchTarget,

    newBrandLabel,
    setNewBrandLabel,
    newBrandPosition,
    setNewBrandPosition,
    showAddBrandModal,
    setShowAddBrandModal,

    userAddedBrands,
    filteredRules,
    filteredBrands,
    mergeSourceSuggestions,
    mergeTargetSuggestions,
    suggestedExistingBrands,
    brandExists,
    ruleBrandSuggestions,
    ruleRangeSuggestions,
    ruleExists,

    handleSaveRule,
    handleDeleteRule,
    handleToggleLockRule,
    handleMergeBrands,
    handleCreateBrand,
    handleValidateUserBrand,
  } = useTaxonomy();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSelectSource = (brand: any) => {
    setMergeSourceId(brand.id.toString());
    setMergeSearchSource(brand.label);
    showToast("success", `Marque source sélectionnée : ${brand.label}`);
  };

  const handleSelectTarget = (brand: any) => {
    setMergeTargetId(brand.id.toString());
    setMergeSearchTarget(brand.label);
    showToast("success", `Marque cible sélectionnée : ${brand.label}`);
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      {/* 🚀 En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Tags className="w-8 h-8 text-emerald-400" />
            <span>Gestion de la Taxonomie & Expertises IA</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Supervisez les marques, fusionnez les saisies incorrectes des utilisateurs et calibrez les règles heuristiques/IA de classification de niveau.
          </p>
        </div>

        {/* Bouton Créer Marque */}
        <button
          onClick={() => setShowAddBrandModal(true)}
          className="bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs py-3 px-5 border border-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md self-start md:self-center"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Créer une Marque Officielle</span>
        </button>
      </div>

      {/* 🧭 Onglets de navigation */}
      <div className="flex border-b border-white/[0.06] gap-6">
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-4 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "rules"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Console d'Expertise IA ({rules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`pb-4 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "brands"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestion des Marques ({brands.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Initialisation de la console d'apprentissage...</span>
        </div>
      ) : (
        <>
          {activeTab === "rules" && (
            <RulesTab
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
              handleSaveRule={handleSaveRule}
              ruleSearch={ruleSearch}
              setRuleSearch={setRuleSearch}
              filteredRules={filteredRules}
              handleToggleLockRule={handleToggleLockRule}
              handleDeleteRule={handleDeleteRule}
            />
          )}

          {activeTab === "brands" && (
            <BrandsTab
              userAddedBrands={userAddedBrands}
              setMergeSourceId={setMergeSourceId}
              setMergeSearchSource={setMergeSearchSource}
              setMergeTargetId={setMergeTargetId}
              setMergeSearchTarget={setMergeSearchTarget}
              handleValidateUserBrand={handleValidateUserBrand}
              actionLoading={actionLoading}
              mergeSourceId={mergeSourceId}
              mergeTargetId={mergeTargetId}
              mergeSearchSource={mergeSearchSource}
              mergeSearchTarget={mergeSearchTarget}
              mergeSourceSuggestions={mergeSourceSuggestions}
              mergeTargetSuggestions={mergeTargetSuggestions}
              handleMergeBrands={handleMergeBrands}
              brandSearch={brandSearch}
              setBrandSearch={setBrandSearch}
              filteredBrands={filteredBrands}
              onSelectSource={handleSelectSource}
              onSelectTarget={handleSelectTarget}
            />
          )}
        </>
      )}

      {/* --- ADD BRAND MODAL --- */}
      <AddBrandModal
        isOpen={showAddBrandModal}
        onClose={() => setShowAddBrandModal(false)}
        newBrandLabel={newBrandLabel}
        setNewBrandLabel={setNewBrandLabel}
        newBrandPosition={newBrandPosition}
        setNewBrandPosition={setNewBrandPosition}
        brandExists={brandExists}
        suggestedExistingBrands={suggestedExistingBrands}
        onSubmit={handleCreateBrand}
        actionLoading={actionLoading}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />
    </div>
  );
}
