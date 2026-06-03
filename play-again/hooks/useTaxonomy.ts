"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface Brand {
  id: number;
  label: string;
  marketPosition: string;
  productCount: number;
}

export interface Category {
  id: number;
  label: string;
}

export interface BrandExpertise {
  id: number;
  brandName: string;
  rangeName: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";
  confidence: number;
  createdAt: string;
}

/**
 * Custom hook useTaxonomy centralizes the state, filtering, autocompletion and API operations
 * for taxonomy management (brands, categories, and AI level rules).
 */
export function useTaxonomy() {
  const { showToast } = useToast();

  // --- DATA STATES ---
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<BrandExpertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "brands">("rules");

  // --- SEARCH FILTERS ---
  const [ruleSearch, setRuleSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // --- FORM STATES: AI RULE INJECTOR ---
  const [newRuleBrand, setNewRuleBrand] = useState("");
  const [newRuleRange, setNewRuleRange] = useState("");
  const [newRuleLevel, setNewRuleLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO">("INTERMEDIATE");
  const [newRuleConfidence, setNewRuleConfidence] = useState("1.0");

  // --- FORM STATES: BRAND MERGE TOOL ---
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergeSearchSource, setMergeSearchSource] = useState("");
  const [mergeSearchTarget, setMergeSearchTarget] = useState("");

  // --- FORM STATES: ADD OFFICIAL BRAND ---
  const [newBrandLabel, setNewBrandLabel] = useState("");
  const [newBrandPosition, setNewBrandPosition] = useState("GENERALIST");
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/taxonomy");
      const data = await res.json();
      if (data.error) {
        showToast("error", data.error);
        return;
      }
      setBrands(data.brands || []);
      setCategories(data.categories || []);
      setRules(data.brandExpertises || []);
    } catch (e) {
      console.error(e);
      showToast("error", "Impossible de charger les données de taxonomie.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FILTERED AND COMPUTED SELECTORS ---
  const userAddedBrands = useMemo(() => {
    return brands.filter((b) => b.id > 225);
  }, [brands]);

  const filteredRules = useMemo(() => {
    const search = ruleSearch.toLowerCase().trim();
    if (!search) return rules;
    return rules.filter(
      (r) =>
        r.brandName.toLowerCase().includes(search) ||
        r.rangeName.toLowerCase().includes(search) ||
        r.level.toLowerCase().includes(search)
    );
  }, [rules, ruleSearch]);

  const filteredBrands = useMemo(() => {
    const search = brandSearch.toLowerCase().trim();
    if (!search) return brands;
    return brands.filter((b) => b.label.toLowerCase().includes(search));
  }, [brands, brandSearch]);

  // Autocomplete suggestions for Brand Merge
  const mergeSourceSuggestions = useMemo(() => {
    const search = mergeSearchSource.toLowerCase().trim();
    if (!search) return [];
    return brands
      .filter((b) => b.label.toLowerCase().includes(search) && b.id !== parseInt(mergeTargetId))
      .slice(0, 5);
  }, [brands, mergeSearchSource, mergeTargetId]);

  const mergeTargetSuggestions = useMemo(() => {
    const search = mergeSearchTarget.toLowerCase().trim();
    if (!search) return [];
    return brands
      .filter((b) => b.label.toLowerCase().includes(search) && b.id !== parseInt(mergeSourceId))
      .slice(0, 5);
  }, [brands, mergeSearchTarget, mergeSourceId]);

  // Autocomplete & validations for Add Brand Modal
  const suggestedExistingBrands = useMemo(() => {
    const cleanLabel = newBrandLabel.trim().toLowerCase();
    if (!cleanLabel) return [];
    return brands.filter((b) => b.label.toLowerCase().includes(cleanLabel)).slice(0, 10);
  }, [brands, newBrandLabel]);

  const brandExists = useMemo(() => {
    const cleanLabel = newBrandLabel.trim().toLowerCase();
    if (!cleanLabel) return false;
    return brands.some((b) => b.label.toLowerCase() === cleanLabel);
  }, [brands, newBrandLabel]);

  // Autocomplete & validations for Rule Injection Form
  const ruleBrandSuggestions = useMemo(() => {
    const cleanLabel = newRuleBrand.trim().toLowerCase();
    if (!cleanLabel) return [];
    const exactMatch = brands.some((b) => b.label.toLowerCase() === cleanLabel);
    if (exactMatch) return [];
    return brands.filter((b) => b.label.toLowerCase().includes(cleanLabel)).slice(0, 5);
  }, [brands, newRuleBrand]);

  const ruleRangeSuggestions = useMemo(() => {
    const cleanRange = newRuleRange.trim().toLowerCase();
    if (!cleanRange) return [];
    const cleanBrand = newRuleBrand.trim().toLowerCase();

    const exactMatch = rules.some(
      (r) =>
        r.rangeName.toLowerCase() === cleanRange &&
        (cleanBrand ? r.brandName.toLowerCase() === cleanBrand : true)
    );
    if (exactMatch) return [];

    const uniqueRanges = Array.from(
      new Set(
        rules
          .filter((r) => {
            if (cleanBrand) {
              return r.brandName.toLowerCase() === cleanBrand && r.rangeName.toLowerCase().includes(cleanRange);
            }
            return r.rangeName.toLowerCase().includes(cleanRange);
          })
          .map((r) => r.rangeName)
      )
    );

    return uniqueRanges.slice(0, 5);
  }, [rules, newRuleBrand, newRuleRange]);

  const ruleExists = useMemo(() => {
    const cleanBrand = newRuleBrand.trim().toLowerCase();
    const cleanRange = newRuleRange.trim().toLowerCase();
    if (!cleanBrand || !cleanRange) return false;
    return rules.some(
      (r) => r.brandName.toLowerCase() === cleanBrand && r.rangeName.toLowerCase() === cleanRange
    );
  }, [rules, newRuleBrand, newRuleRange]);

  // --- ACTIONS ---

  // 1. Submit/Save AI rule
  const handleSaveRule = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!newRuleBrand.trim() || !newRuleRange.trim()) {
        showToast("error", "Veuillez saisir la marque et la gamme du modèle.");
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
            confidence: parseFloat(newRuleConfidence),
          }),
        });

        const data = await res.json();
        if (data.error) {
          showToast("error", data.error);
          return;
        }

        showToast("success", data.message);

        // Reset rule input fields
        setNewRuleBrand("");
        setNewRuleRange("");
        setNewRuleLevel("INTERMEDIATE");
        setNewRuleConfidence("1.0");

        // Refresh taxonomy data
        fetchData();
      } catch (e) {
        console.error(e);
        showToast("error", "Erreur technique de sauvegarde de la règle.");
      } finally {
        setActionLoading(false);
      }
    },
    [newRuleBrand, newRuleRange, newRuleLevel, newRuleConfidence, fetchData, showToast]
  );

  // 2. Delete rule
  const handleDeleteRule = useCallback(
    async (id: number) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cette règle d'expertise IA ?")) return;

      try {
        setActionLoading(true);
        const res = await fetch(`/api/admin/taxonomy/rules?id=${id}`, {
          method: "DELETE",
        });

        const data = await res.json();
        if (data.error) {
          showToast("error", data.error);
          return;
        }

        showToast("success", data.message);
        fetchData();
      } catch (e) {
        console.error(e);
        showToast("error", "Erreur technique de suppression de la règle.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData, showToast]
  );

  // 3. Toggle Lock (Confiance 1.0 vs 0.85)
  const handleToggleLockRule = useCallback(
    async (rule: BrandExpertise) => {
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
            confidence: nextConfidence,
          }),
        });

        const data = await res.json();
        if (data.error) {
          showToast("error", data.error);
          return;
        }

        showToast(
          "success",
          nextConfidence === 1.0
            ? `Règle de classification verrouillée administrativement (Confiance 100%).`
            : `Confiance IA déverrouillée (Confiance à ${nextConfidence * 100}%).`
        );
        fetchData();
      } catch (e) {
        console.error(e);
        showToast("error", "Erreur technique de verrouillage.");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchData, showToast]
  );

  // 4. Merge Brands
  const handleMergeBrands = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!mergeSourceId || !mergeTargetId) {
        showToast("error", "Veuillez sélectionner la marque provisoire et la marque officielle cible.");
        return;
      }

      const sourceBrand = brands.find((b) => b.id === parseInt(mergeSourceId));
      const targetBrand = brands.find((b) => b.id === parseInt(mergeTargetId));

      if (!sourceBrand || !targetBrand) return;

      if (
        !confirm(
          `FUSIONNER ET CORRIGER LES ANNONCES :\n\nCette action va :\n1. Réassocier toutes les annonces (${sourceBrand.productCount}) de "${sourceBrand.label}" vers "${targetBrand.label}".\n2. Supprimer définitivement la marque doublon "${sourceBrand.label}".\n\nSouhaitez-vous continuer ?`
        )
      ) {
        return;
      }

      try {
        setActionLoading(true);
        const res = await fetch("/api/admin/taxonomy/brands/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provisionalBrandId: parseInt(mergeSourceId),
            targetBrandId: parseInt(mergeTargetId),
          }),
        });

        const data = await res.json();
        if (data.error) {
          showToast("error", data.error);
          return;
        }

        showToast("success", data.message);
        setMergeSourceId("");
        setMergeTargetId("");
        setMergeSearchSource("");
        setMergeSearchTarget("");
        fetchData();
      } catch (e) {
        console.error(e);
        showToast("error", "Erreur technique lors de la fusion.");
      } finally {
        setActionLoading(false);
      }
    },
    [mergeSourceId, mergeTargetId, brands, fetchData, showToast]
  );

  // 5. Create official brand
  const handleCreateBrand = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!newBrandLabel.trim()) {
        showToast("error", "Le nom de la marque est requis.");
        return;
      }

      try {
        setActionLoading(true);
        const res = await fetch("/api/admin/taxonomy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: newBrandLabel,
            marketPosition: newBrandPosition,
          }),
        });

        const data = await res.json();
        if (data.error) {
          showToast("error", data.error);
          return;
        }

        showToast("success", `Marque officielle "${newBrandLabel}" créée avec succès.`);
        setNewBrandLabel("");
        setNewBrandPosition("GENERALIST");
        setShowAddBrandModal(false);
        fetchData();
      } catch (e) {
        console.error(e);
        showToast("error", "Erreur technique de création de marque.");
      } finally {
        setActionLoading(false);
      }
    },
    [newBrandLabel, newBrandPosition, fetchData, showToast]
  );

  // 6. Validate user brand
  const handleValidateUserBrand = useCallback(
    async (brand: Brand) => {
      try {
        setActionLoading(true);
        showToast("success", `Marque "${brand.label}" validée comme officielle.`);
      } catch (e) {
        console.error(e);
      } finally {
        setActionLoading(false);
      }
    },
    [showToast]
  );

  return {
    brands,
    categories,
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
  };
}
