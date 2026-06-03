"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  ShoppingBag,
  Check,
  User,
  UserCheck,
  ShieldAlert,
  Activity,
  UserMinus,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export interface UserFilterSectionProps {
  search: string;
  setSearch: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  filterRole: string;
  setFilterRole: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterCertified: string;
  setFilterCertified: (val: string) => void;
  filterHasProducts: string;
  setFilterHasProducts: (val: string) => void;
}

export default function UserFilterSection({
  search,
  setSearch,
  sortBy,
  setSortBy,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  filterCertified,
  setFilterCertified,
  filterHasProducts,
  setFilterHasProducts,
}: UserFilterSectionProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg relative z-20 text-left">
      {/* Ligne 1 : Recherche & Tri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche textuelle */}
        <div className="md:col-span-2 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 transition-all font-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Tri (SortBy) */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => toggleDropdown("sortBy", e)}
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
                {sortBy === "products_desc" && "Tri : Plus d'articles"}
                {sortBy === "products_asc" && "Tri : Moins d'articles"}
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
                  { value: "products_desc", label: "Articles : Plus d'articles", icon: ShoppingBag },
                  { value: "products_asc", label: "Articles : Moins d'articles", icon: ShoppingBag },
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
        {/* Dropdown Rôle */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => toggleDropdown("role", e)}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "role"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterRole === "" && "Rôle : Tous"}
                {filterRole === "USER" && "Membres (USER)"}
                {filterRole === "ADMIN" && "Admin (ADMIN)"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "role" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "role" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "", label: "Rôle : Tous", icon: User },
                  { value: "USER", label: "Membres (USER)", icon: UserCheck },
                  { value: "ADMIN", label: "Admin (ADMIN)", icon: ShieldAlert },
                ].map((option) => {
                  const isSelected = filterRole === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterRole(option.value);
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

        {/* Dropdown Statut */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => toggleDropdown("status", e)}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "status"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterStatus === "" && "Statut : Tous"}
                {filterStatus === "active" && "Actifs"}
                {filterStatus === "inactive" && "Suspendus"}
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
                  { value: "", label: "Statut : Tous", icon: Activity },
                  { value: "active", label: "Actifs uniquement", icon: UserCheck },
                  { value: "inactive", label: "Suspendus uniquement", icon: UserMinus },
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

        {/* Dropdown Certification */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => toggleDropdown("certified", e)}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "certified"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterCertified === "" && "Certif : Toutes"}
                {filterCertified === "true" && "Certifiés uniquement"}
                {filterCertified === "false" && "Standard / Non-Certif"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "certified" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "certified" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "", label: "Toutes les confiances", icon: Award },
                  { value: "true", label: "Certifiés uniquement", icon: CheckCircle },
                  { value: "false", label: "Standard / Non-Certif", icon: AlertCircle },
                ].map((option) => {
                  const isSelected = filterCertified === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterCertified(option.value);
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

        {/* Dropdown Ventes */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => toggleDropdown("hasProducts", e)}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              activeDropdown === "hasProducts"
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {filterHasProducts === "" && "Activités : Toutes"}
                {filterHasProducts === "true" && "Vendeurs uniquement"}
                {filterHasProducts === "false" && "Acheteurs uniquement"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                activeDropdown === "hasProducts" ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {activeDropdown === "hasProducts" && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "", label: "Activités : Toutes", icon: ShoppingBag },
                  { value: "true", label: "Vendeurs uniquement", icon: ShoppingBag },
                  { value: "false", label: "Acheteurs uniquement", icon: User },
                ].map((option) => {
                  const isSelected = filterHasProducts === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilterHasProducts(option.value);
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
