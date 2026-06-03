"use client";

import React from "react";
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Check,
  Calendar,
  DollarSign,
  Tag,
  Sliders,
  Activity,
  Eye,
  Trash2,
  CheckCircle,
} from "lucide-react";

export interface CatalogFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  categories: { id: number; label: string }[];
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  brands: { id: number; label: string }[];
  filterBrand: string;
  setFilterBrand: (b: string) => void;
  filterState: string;
  setFilterState: (s: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (d: string | null) => void;
}

/**
 * CatalogFilters renders search fields and dropdowns for moderating lists.
 */
export default function CatalogFilters({
  search,
  setSearch,
  sortBy,
  setSortBy,
  categories,
  filterCategory,
  setFilterCategory,
  brands,
  filterBrand,
  setFilterBrand,
  filterState,
  setFilterState,
  filterStatus,
  setFilterStatus,
  activeDropdown,
  setActiveDropdown,
}: CatalogFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg relative z-20">
      {/* Ligne 1 : Recherche & Tri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche textuelle */}
        <div className="md:col-span-2 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un article par titre, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 transition-all font-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Tri (SortBy) */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "sortBy" ? null : "sortBy")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "sortBy"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {sortBy === "date_desc" && "Tri : Plus récent"}
                {sortBy === "date_asc" && "Tri : Plus ancien"}
                {sortBy === "price_desc" && "Tri : Plus cher"}
                {sortBy === "price_asc" && "Tri : Moins cher"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "sortBy" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "sortBy" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "date_desc", label: "Date : Plus récent", icon: Calendar },
                  { value: "date_asc", label: "Date : Plus ancien", icon: Calendar },
                  { value: "price_desc", label: "Prix : Plus cher", icon: DollarSign },
                  { value: "price_asc", label: "Prix : Moins cher", icon: DollarSign },
                ].map((option) => {
                  const isSelected = sortBy === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ligne 2 : Filtres Multiples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dropdown Catégorie */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "category"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterCategory === ""
                  ? "Toutes les catégories"
                  : categories.find((c) => c.id.toString() === filterCategory)?.label || "Catégorie inconnue"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "category" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "category" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full max-h-60 bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-y-auto backdrop-blur-xl scrollbar-thin scrollbar-thumb-white/10">
              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory("");
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                    filterCategory === ""
                      ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className={`w-3.5 h-3.5 ${filterCategory === "" ? "text-brand-primary" : "text-slate-500"}`} />
                    <span>Toutes les catégories</span>
                  </div>
                  {filterCategory === "" && <Check className="w-3 h-3 text-brand-primary" />}
                </button>
                {categories.map((cat) => {
                  const isSelected = filterCategory === cat.id.toString();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFilterCategory(cat.id.toString());
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{cat.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Marque */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "brand" ? null : "brand")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "brand"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterBrand === ""
                  ? "Toutes les marques"
                  : brands.find((b) => b.id.toString() === filterBrand)?.label || "Marque inconnue"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "brand" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "brand" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full max-h-60 bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-y-auto backdrop-blur-xl scrollbar-thin scrollbar-thumb-white/10 font-medium">
              <div className="p-1 space-y-0.5 font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setFilterBrand("");
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                    filterBrand === ""
                      ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className={`w-3.5 h-3.5 ${filterBrand === "" ? "text-brand-primary" : "text-slate-500"}`} />
                    <span>Toutes les marques</span>
                  </div>
                  {filterBrand === "" && <Check className="w-3 h-3 text-brand-primary" />}
                </button>
                {brands.map((b) => {
                  const isSelected = filterBrand === b.id.toString();
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setFilterBrand(b.id.toString());
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{b.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown État d'usure */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "state" ? null : "state")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "state"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterState === "" && "État d'usure : Tous"}
                {filterState === "NEUF" && "État : Neuf"}
                {filterState === "EXCELLENT" && "État : Excellent"}
                {filterState === "BON" && "État : Bon"}
                {filterState === "SATISFAISANT" && "État : Satisfaisant"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "state" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "state" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "", label: "Tous les états d'usure" },
                  { value: "NEUF", label: "Neuf" },
                  { value: "EXCELLENT", label: "Excellent" },
                  { value: "BON", label: "Bon" },
                  { value: "SATISFAISANT", label: "Satisfaisant" },
                ].map((option) => {
                  const isSelected = filterState === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterState(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Statut */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "status"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterStatus === "" && "Disponibilité : Tous"}
                {filterStatus === "active" && "En vente (Actifs)"}
                {filterStatus === "inactive" && "Suspendus uniquement"}
                {filterStatus === "sold" && "Vendus uniquement"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "status" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "status" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "", label: "Toutes les dispo", icon: Eye },
                  { value: "active", label: "En vente (Actifs)", icon: Eye },
                  { value: "inactive", label: "Suspendus uniquement", icon: Trash2 },
                  { value: "sold", label: "Vendus uniquement", icon: CheckCircle },
                ].map((option) => {
                  const isSelected = filterStatus === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterStatus(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
