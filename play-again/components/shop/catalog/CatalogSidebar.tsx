"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";
import SortByFilter from "./filters/SortByFilter";
import SearchFilter from "./filters/SearchFilter";
import PlayMatchToggle from "./filters/PlayMatchToggle";
import SportsFilter from "./filters/SportsFilter";
import ConditionFilter from "./filters/ConditionFilter";
import LevelFilter from "./filters/LevelFilter";
import PriceFilter from "./filters/PriceFilter";
import BrandFilter from "./filters/BrandFilter";
import GenderFilter from "./filters/GenderFilter";
import ShippingFilter from "./filters/ShippingFilter";
import { Category, Brand } from "../hooks/useShopFilters";

export interface CatalogSidebarProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onlyRecommended: boolean;
  setOnlyRecommended: (val: boolean) => void;
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (val: number | null) => void;
  selectedConditions: string[];
  setSelectedConditions: (val: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (val: string[]) => void;
  minPrice: number | "";
  setMinPrice: (val: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (val: number | "") => void;
  brands: Brand[];
  selectedBrand: number | null;
  setSelectedBrand: (val: number | null) => void;
  selectedGenders: string[];
  setSelectedGenders: (val: string[]) => void;
  isShipping: boolean;
  setIsShipping: (val: boolean) => void;
  handleResetFilters: () => void;
  toggleSelection: (val: string, list: string[], setList: (l: string[]) => void) => void;
  isAuthenticated: boolean;
}

/**
 * CatalogSidebar coordinates filters on larger monitors.
 */
export default function CatalogSidebar({
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onlyRecommended,
  setOnlyRecommended,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedConditions,
  setSelectedConditions,
  selectedLevels,
  setSelectedLevels,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  brands,
  selectedBrand,
  setSelectedBrand,
  selectedGenders,
  setSelectedGenders,
  isShipping,
  setIsShipping,
  handleResetFilters,
  toggleSelection,
  isAuthenticated,
}: CatalogSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-72 shrink-0 top-24 self-start">
      {/* 1. Tri */}
      <SortByFilter sortBy={sortBy} setSortBy={setSortBy} isAuthenticated={isAuthenticated} />

      {/* 2. Recherche */}
      <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 3. PlayMatch IA */}
      {isAuthenticated && (
        <PlayMatchToggle onlyRecommended={onlyRecommended} setOnlyRecommended={setOnlyRecommended} />
      )}

      {/* 4. Sports */}
      <SportsFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 5. État */}
      <ConditionFilter
        selectedConditions={selectedConditions}
        setSelectedConditions={setSelectedConditions}
        toggleSelection={toggleSelection}
      />

      {/* 6. Niveau requis */}
      <LevelFilter
        selectedLevels={selectedLevels}
        setSelectedLevels={setSelectedLevels}
        toggleSelection={toggleSelection}
      />

      {/* 7. Prix */}
      <PriceFilter
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      {/* 8. Marques */}
      <BrandFilter brands={brands} selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />

      {/* 9. Genre */}
      <GenderFilter
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
        toggleSelection={toggleSelection}
      />

      {/* 10. Livraison */}
      <ShippingFilter isShipping={isShipping} setIsShipping={setIsShipping} />

      {/* Bouton de Réinitialisation */}
      <button
        type="button"
        onClick={handleResetFilters}
        className="w-full py-3.5 border-2 border-dashed border-white/10 hover:border-white/30 text-white/40 hover:text-white text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none mt-2"
      >
        <RefreshCcw className="w-3.5 h-3.5 text-brand-primary" />
        Réinitialiser filtres
      </button>
    </aside>
  );
}
