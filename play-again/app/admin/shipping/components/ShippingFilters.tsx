"use client";

import React from "react";
import { Search, ArrowUpDown, ChevronRight, Check, AlertTriangle, Package } from "lucide-react";

export interface ShippingFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterCarrier: string;
  setFilterCarrier: (c: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (d: string | null) => void;
}

/**
 * ShippingFilters provides administrative search filters and sorting options
 * for logistics list management.
 */
export default function ShippingFilters({
  search,
  setSearch,
  sortBy,
  setSortBy,
  filterStatus,
  setFilterStatus,
  filterCarrier,
  setFilterCarrier,
  activeDropdown,
  setActiveDropdown,
}: ShippingFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg relative z-20">
      {/* Ligne 1 : Recherche & Tri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche */}
        <div className="md:col-span-2 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par numéro de suivi, e-mail, pseudo de membre, nom d'article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 transition-all font-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Tri */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "sortBy" ? null : "sortBy")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "sortBy"
                ? "border-brand-accent/50 text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {sortBy === "date_desc" && "Tri : Plus récent"}
                {sortBy === "date_asc" && "Tri : Plus ancien"}
                {sortBy === "delay_desc" && "Tri : Plus long retard"}
              </span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "sortBy" ? "rotate-90 text-white" : ""
              }`}
            />
          </button>

          {/* Menu Déroulant Tri */}
          {activeDropdown === "sortBy" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl font-medium">
              <div className="p-1 space-y-0.5 font-medium">
                {[
                  { value: "date_desc", label: "Date : Commande récente" },
                  { value: "date_asc", label: "Date : Commande ancienne" },
                  { value: "delay_desc", label: "Temps : Plus long transit" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                      sortBy === option.value
                        ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ligne 2 : Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Filtre Gravité Anomalie */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "status"
                ? "border-brand-accent/50 text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterStatus === "ALL" && "Anomalies : Toutes les expéditions"}
                {filterStatus === "NONE" && "Expéditions : En transit (Sans anomalies)"}
                {filterStatus === "WARNING" && "Expéditions : Retards (Warning)"}
                {filterStatus === "CRITICAL" && "Expéditions : Bloqués/Perdus (Critical)"}
              </span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "status" ? "rotate-90 text-white" : ""
              }`}
            />
          </button>

          {/* Menu Déroulant Gravité */}
          {activeDropdown === "status" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl font-medium">
              <div className="p-1 space-y-0.5 font-medium">
                {[
                  { value: "ALL", label: "Toutes les expéditions" },
                  { value: "NONE", label: "En transit (Sans anomalies)" },
                  { value: "WARNING", label: "Retards (Warning) - Non déposés" },
                  { value: "CRITICAL", label: "Bloqués / Perdus (Critical) - Hub" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFilterStatus(option.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                      filterStatus === option.value
                        ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {filterStatus === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtre Transporteur */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "carrier" ? null : "carrier")}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "carrier"
                ? "border-brand-accent/50 text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterCarrier === "" && "Transporteur : Tous"}
                {filterCarrier === "MR" && "Mondial Relay uniquement"}
                {filterCarrier === "CC" && "Colissimo uniquement"}
              </span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "carrier" ? "rotate-90 text-white" : ""
              }`}
            />
          </button>

          {/* Menu Déroulant Transporteur */}
          {activeDropdown === "carrier" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl font-medium">
              <div className="p-1 space-y-0.5 font-medium">
                {[
                  { value: "", label: "Tous" },
                  { value: "MR", label: "Mondial Relay" },
                  { value: "CC", label: "Colissimo" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFilterCarrier(option.value);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                      filterCarrier === option.value
                        ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {filterCarrier === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
