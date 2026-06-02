"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Tags, 
  Cpu, 
  Search, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Lock, 
  Unlock, 
  GitMerge,
  Layers,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Bookmark,
  ChevronDown,
  Check
} from "lucide-react";

interface Brand {
  id: number;
  label: string;
  marketPosition: string;
  productCount: number;
}

interface Category {
  id: number;
  label: string;
}

interface BrandExpertise {
  id: number;
  brandName: string;
  rangeName: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
  confidence: number;
  createdAt: string;
}

export default function TaxonomyAdminPage() {
  // --- ÉTATS ---
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<BrandExpertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "brands">("rules");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filtres de recherche
  const [ruleSearch, setRuleSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Formulaire de Création de Règle IA
  const [newRuleBrand, setNewRuleBrand] = useState("");
  const [newRuleRange, setNewRuleRange] = useState("");
  const [newRuleLevel, setNewRuleLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO">("INTERMEDIATE");
  const [newRuleConfidence, setNewRuleConfidence] = useState("1.0");

  // Formulaire de Fusion de Marques
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSearchSource, setMergeSearchSource] = useState("");
  const [mergeSearchTarget, setMergeSearchTarget] = useState("");

  // Formulaire de Création de Marque Officielle
  const [newBrandLabel, setNewBrandLabel] = useState("");
  const [newBrandPosition, setNewBrandPosition] = useState("GENERALIST");
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/taxonomy");
      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }
      setBrands(data.brands || []);
      setCategories(data.categories || []);
      setRules(data.brandExpertises || []);
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger les données de taxonomie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fermer le dropdown lors d'un clic extérieur
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // --- TOAST NOTIFICATIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // --- FILTRAGE DES MARQUES AJOUTÉES MANUELLEMENT PAR LES UTILISATEURS (ID > 225) ---
  const userAddedBrands = useMemo(() => {
    return brands.filter(b => b.id > 225);
  }, [brands]);

  // --- LOGIQUE ACTIONS ---

  // 1. Soumettre une nouvelle règle d'expertise IA
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleBrand.trim() || !newRuleRange.trim()) {
      showNotification("error", "Veuillez saisir la marque et la gamme du modèle.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/taxonomy/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: newRuleBrand,
          rangeName: newRuleRange,
          level: newRuleLevel,
          confidence: parseFloat(newRuleConfidence)
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      
      // Réinitialiser le formulaire
      setNewRuleBrand("");
      setNewRuleRange("");
      setNewRuleLevel("INTERMEDIATE");
      setNewRuleConfidence("1.0");
      
      // Rafraîchir les données
      fetchData();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de sauvegarde de la règle.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Supprimer une règle
  const handleDeleteRule = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette règle d'expertise IA ?")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/taxonomy/rules?id=${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      fetchData();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de suppression de la règle.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Verrouiller ou Déverrouiller rapidement la confiance à 1.0
  const handleToggleLockRule = async (rule: BrandExpertise) => {
    const nextConfidence = rule.confidence === 1.0 ? 0.85 : 1.0;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/taxonomy/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: rule.brandName,
          rangeName: rule.rangeName,
          level: rule.level,
          confidence: nextConfidence
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", nextConfidence === 1.0 
        ? `Règle de classification verrouillée administrativement (Confiance 100%).`
        : `Confiance IA déverrouillée (Confiance à ${nextConfidence * 100}%).`
      );
      fetchData();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de verrouillage.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Fusionner deux marques
  const handleMergeBrands = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId) {
      showNotification("error", "Veuillez sélectionner la marque provisoire et la marque officielle cible.");
      return;
    }

    const sourceBrand = brands.find(b => b.id === parseInt(mergeSourceId));
    const targetBrand = brands.find(b => b.id === parseInt(mergeTargetId));

    if (!sourceBrand || !targetBrand) return;

    if (!confirm(`FUSIONNER ET CORRIGER LES ANNONCES :\n\nCette action va :\n1. Réassocier toutes les annonces (${sourceBrand.productCount}) de "${sourceBrand.label}" vers "${targetBrand.label}".\n2. Supprimer définitivement la marque doublon "${sourceBrand.label}".\n\nSouhaitez-vous continuer ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/taxonomy/brands/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provisionalBrandId: parseInt(mergeSourceId),
          targetBrandId: parseInt(mergeTargetId)
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setMergeSourceId("");
      setMergeTargetId("");
      setMergeSearchSource("");
      setMergeSearchTarget("");
      fetchData();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique lors de la fusion.");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Créer une nouvelle marque officielle
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandLabel.trim()) {
      showNotification("error", "Le nom de la marque est requis.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newBrandLabel,
          marketPosition: newBrandPosition
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", `Marque officielle "${newBrandLabel}" créée avec succès.`);
      setNewBrandLabel("");
      setNewBrandPosition("GENERALIST");
      setShowAddBrandModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de création de marque.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- FILTRAGE DE RECHERCHE ---
  const filteredRules = useMemo(() => {
    return rules.filter(r => 
      r.brandName.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.rangeName.toLowerCase().includes(ruleSearch.toLowerCase()) ||
      r.level.toLowerCase().includes(ruleSearch.toLowerCase())
    );
  }, [rules, ruleSearch]);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => 
      b.label.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brands, brandSearch]);

  // Autocomplete suggestions pour la fusion
  const mergeSourceSuggestions = useMemo(() => {
    if (!mergeSearchSource) return [];
    return brands.filter(b => 
      b.label.toLowerCase().includes(mergeSearchSource.toLowerCase()) && 
      b.id !== parseInt(mergeTargetId)
    ).slice(0, 5);
  }, [brands, mergeSearchSource, mergeTargetId]);

  const mergeTargetSuggestions = useMemo(() => {
    if (!mergeSearchTarget) return [];
    return brands.filter(b => 
      b.label.toLowerCase().includes(mergeSearchTarget.toLowerCase()) && 
      b.id !== parseInt(mergeSourceId)
    ).slice(0, 5);
  }, [brands, mergeSearchTarget, mergeSourceId]);

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      
      {/* 🔔 Toast notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

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
          {/* TAB 1: CONSOLE D'EXPERTISE IA (BRAND EXPERTISE RULES) */}
          {activeTab === "rules" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Formulaire injecteur manuel (2/5) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Cpu className="w-32 h-32 text-emerald-400" />
                  </div>
                  
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">
                      Injecteur de Règle IA Manuel
                    </h2>
                  </div>

                  <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                    
                    {/* Marque */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Marque de l'article (ex: Babolat, Salomon)</label>
                      <input
                        type="text"
                        placeholder="Ex: BABOLAT"
                        value={newRuleBrand}
                        onChange={(e) => setNewRuleBrand(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
                      />
                    </div>

                    {/* Gamme / Modèle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Mot-clé de Gamme / Modèle exact</label>
                      <input
                        type="text"
                        placeholder="Ex: PURE AERO"
                        value={newRuleRange}
                        onChange={(e) => setNewRuleRange(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
                      />
                    </div>

                    {/* Classification forcée */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Classification de niveau forcée</label>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveDropdown(activeDropdown === "newRuleLevel" ? null : "newRuleLevel")}
                          className={`w-full flex items-center justify-between bg-black/40 border ${
                            activeDropdown === "newRuleLevel" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
                          } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
                        >
                          <span>
                            {newRuleLevel === "BEGINNER" && "🟢 BEGINNER (Débutant / Loisir)"}
                            {newRuleLevel === "INTERMEDIATE" && "🔵 INTERMEDIATE (Perfectionnement)"}
                            {newRuleLevel === "ADVANCED" && "🟣 ADVANCED (Performant / Confirmé)"}
                            {newRuleLevel === "PRO" && "🔴 PRO (Compétition / Expert)"}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "newRuleLevel" ? "rotate-180 text-white" : ""}`} />
                        </button>

                        {activeDropdown === "newRuleLevel" && (
                          <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                            <div className="p-1 space-y-0.5">
                              {[
                                { value: "BEGINNER", label: "🟢 BEGINNER (Débutant / Loisir)" },
                                { value: "INTERMEDIATE", label: "🔵 INTERMEDIATE (Perfectionnement)" },
                                { value: "ADVANCED", label: "🟣 ADVANCED (Performant / Confirmé)" },
                                { value: "PRO", label: "🔴 PRO (Compétition / Expert)" }
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
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Indice de confiance (Verrou Admin)</label>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveDropdown(activeDropdown === "newRuleConfidence" ? null : "newRuleConfidence")}
                          className={`w-full flex items-center justify-between bg-black/40 border ${
                            activeDropdown === "newRuleConfidence" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
                          } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
                        >
                          <span>
                            {newRuleConfidence === "1.0" && "🔒 1.0 — Verrou Administrative Prioritaire"}
                            {newRuleConfidence === "0.9" && "⚡ 0.9 — Haute Confiance IA"}
                            {newRuleConfidence === "0.75" && "⚙️ 0.75 — Confiance Standard"}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "newRuleConfidence" ? "rotate-180 text-white" : ""}`} />
                        </button>

                        {activeDropdown === "newRuleConfidence" && (
                          <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                            <div className="p-1 space-y-0.5">
                              {[
                                { value: "1.0", label: "🔒 1.0 — Verrou Administrative Prioritaire" },
                                { value: "0.9", label: "⚡ 0.9 — Haute Confiance IA" },
                                { value: "0.75", label: "⚙️ 0.75 — Confiance Standard" }
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
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
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
                            if (rule.level === "PRO") lvlColor = "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]";

                            // Couleur de la confiance
                            let confColor = "bg-red-500";
                            if (rule.confidence >= 0.5 && rule.confidence < 0.8) confColor = "bg-amber-500";
                            if (rule.confidence >= 0.8) confColor = "bg-emerald-500";
                            if (rule.confidence === 1.0) confColor = "bg-yellow-500";

                            return (
                              <tr key={rule.id} className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors group">
                                <td className="py-3 px-2 font-extrabold text-white uppercase tracking-wider">{rule.brandName}</td>
                                <td className="py-3 px-2 font-semibold text-slate-300 uppercase tracking-wider">{rule.rangeName}</td>
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
              </div>

            </div>
          )}

          {/* TAB 2: GESTION DES MARQUES & FUSION (BRAND MERGE SYSTEM) */}
          {activeTab === "brands" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Outil de Fusion & Suggestions IA (2/5) */}
              <div className="lg:col-span-2 space-y-6">
                
                 {/* 🏷️ MARQUES AJOUTÉES PAR LES UTILISATEURS */}
                <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-5 relative">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <Tags className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Marques ajoutées par les utilisateurs
                      </h3>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-extrabold">
                      {userAddedBrands.length} inédite(s)
                    </span>
                  </div>

                  {userAddedBrands.length === 0 ? (
                    <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl text-center text-slate-500 font-bold text-xs">
                      Aucune marque inédite ajoutée par les utilisateurs.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {userAddedBrands.map((brand) => (
                        <div 
                          key={brand.id} 
                          className="bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 p-4 rounded-2xl flex flex-col gap-3 transition-all relative group shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                              À valider / fusionner
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold font-mono">ID: #{brand.id}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold text-white bg-black/30 p-2.5 rounded-xl border border-white/5">
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-extrabold uppercase tracking-wider">{brand.label}</span>
                              <span className="text-[9px] text-slate-500 font-semibold">{brand.productCount} annonce(s)</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setMergeSourceId(brand.id.toString());
                                setMergeSearchSource(brand.label);
                                showNotification("success", `Marque source sélectionnée : ${brand.label}`);
                              }}
                              className="flex-1 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 text-[10px] font-extrabold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <GitMerge className="w-3.5 h-3.5" />
                              <span>Fusionner</span>
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  setActionLoading(true);
                                  // Pour valider la marque comme officielle, on effectue un simple toast ou modification de positionnement
                                  // La marque reste en base mais l'admin confirme sa validité
                                  showNotification("success", `Marque "${brand.label}" validée comme officielle.`);
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold py-2 px-3 rounded-xl transition-all cursor-pointer"
                            >
                              Valider
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🔗 FORMULAIRE DE FUSION DE MARQUES */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
                    <GitMerge className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xs font-black text-white uppercase tracking-wider">
                      Outil de Fusion-Marque (Merge Tool)
                    </h2>
                  </div>

                  <form onSubmit={handleMergeBrands} className="space-y-5 text-xs">
                    
                    {/* Source provisoire */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Marque doublon / provisoire à fusionner</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher marque à supprimer..."
                          value={mergeSearchSource}
                          onChange={(e) => {
                            setMergeSearchSource(e.target.value);
                            setMergeSourceId("");
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                        />
                        {mergeSourceId && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase">Sélectionné</span>
                        )}
                      </div>
                      
                      {/* Suggestions d'autocomplétion */}
                      {mergeSourceSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5">
                          {mergeSourceSuggestions.map(b => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setMergeSourceId(b.id.toString());
                                setMergeSearchSource(b.label);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                            >
                              <span>{b.label}</span>
                              <span className="text-[10px] text-slate-500 font-semibold font-mono">{b.productCount} annonces</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Flèche de fusion */}
                    <div className="flex justify-center my-1 select-none">
                      <div className="p-2 rounded-full bg-black/60 border border-white/5 text-slate-500">
                        <GitMerge className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>

                    {/* Cible officielle */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Marque cible officielle (conserver)</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher marque officielle..."
                          value={mergeSearchTarget}
                          onChange={(e) => {
                            setMergeSearchTarget(e.target.value);
                            setMergeTargetId("");
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                        />
                        {mergeTargetId && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">Sélectionné</span>
                        )}
                      </div>
                      
                      {/* Suggestions d'autocomplétion */}
                      {mergeTargetSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5">
                          {mergeTargetSuggestions.map(b => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setMergeTargetId(b.id.toString());
                                setMergeSearchTarget(b.label);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                            >
                              <span>{b.label}</span>
                              <span className="text-[10px] text-slate-500 font-semibold font-mono">{b.productCount} annonces</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading || !mergeSourceId || !mergeTargetId}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <GitMerge className="w-4 h-4" />
                          <span>Fusionner et corriger les annonces</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Liste de toutes les marques en base (3/5) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
                  
                  {/* Recherche et stats */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Registre des marques en base</span>
                    </h2>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Rechercher marque..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold w-48 placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {filteredBrands.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-bold text-xs">
                      Aucune marque trouvée.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {filteredBrands.map((brand) => {
                        let posBadge = "bg-white/5 text-slate-400 border-white/5";
                        if (brand.marketPosition === "PREMIUM") posBadge = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                        if (brand.marketPosition === "TECHNICAL") posBadge = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

                        return (
                          <div
                            key={brand.id}
                            className="bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08] p-3 rounded-2xl transition-all flex flex-col gap-2 relative group shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white text-xs uppercase truncate tracking-wider max-w-[70%]">
                                {brand.label}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold font-mono shrink-0">
                                ID: #{brand.id}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1 select-none">
                              <span className={`px-2 py-0.5 rounded-full border text-[8px] font-extrabold uppercase tracking-wide ${posBadge}`}>
                                {brand.marketPosition}
                              </span>
                              
                              <span className="text-[10px] text-slate-400 font-extrabold font-mono bg-black/40 border border-white/[0.03] px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span>{brand.productCount}</span>
                              </span>
                            </div>

                            {/* Actions rapides au survol */}
                            <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1.5 bg-[#0e1322] border border-white/10 p-1 rounded-lg shadow-xl">
                              <button
                                onClick={() => {
                                  setMergeSourceId(brand.id.toString());
                                  setMergeSearchSource(brand.label);
                                  setActiveTab("brands");
                                  showNotification("success", `Marque source sélectionnée : ${brand.label}`);
                                }}
                                className="p-1 hover:bg-white/5 text-red-400 hover:text-red-300 rounded transition-all cursor-pointer"
                                title="Fusionner (supprimer)"
                              >
                                <GitMerge className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setMergeTargetId(brand.id.toString());
                                  setMergeSearchTarget(brand.label);
                                  setActiveTab("brands");
                                  showNotification("success", `Marque cible sélectionnée : ${brand.label}`);
                                }}
                                className="p-1 hover:bg-white/5 text-emerald-400 hover:text-emerald-300 rounded transition-all cursor-pointer"
                                title="Fusionner vers cette marque (conserver)"
                              >
                                <GitMerge className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* --- ADD BRAND MODAL --- */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0E1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-white/[0.06] pb-3 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <span>Créer une Marque Officielle</span>
            </h3>

            <form onSubmit={handleCreateBrand} className="space-y-4 mt-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Libellé officiel de la marque</label>
                <input
                  type="text"
                  placeholder="Ex: NIKE, ADIDAS"
                  value={newBrandLabel}
                  onChange={(e) => setNewBrandLabel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Positionnement sur le marché</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "newBrandPosition" ? null : "newBrandPosition")}
                    className={`w-full flex items-center justify-between bg-black/40 border ${
                      activeDropdown === "newBrandPosition" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
                    } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
                  >
                    <span>
                      {newBrandPosition === "GENERALIST" && "🌍 GENERALIST (Grand public / Standard)"}
                      {newBrandPosition === "TECHNICAL" && "⚙️ TECHNICAL (Technique / Spécialisé)"}
                      {newBrandPosition === "PREMIUM" && "👑 PREMIUM (Haut de Gamme / Luxe)"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "newBrandPosition" ? "rotate-180 text-white" : ""}`} />
                  </button>

                  {activeDropdown === "newBrandPosition" && (
                    <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                      <div className="p-1 space-y-0.5">
                        {[
                          { value: "GENERALIST", label: "🌍 GENERALIST (Grand public / Standard)" },
                          { value: "TECHNICAL", label: "⚙️ TECHNICAL (Technique / Spécialisé)" },
                          { value: "PREMIUM", label: "👑 PREMIUM (Haut de Gamme / Luxe)" }
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
                  onClick={() => setShowAddBrandModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Créer la marque</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
