"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import SearchFilter from "./filters/SearchFilter";
import SortByFilter from "./filters/SortByFilter";
import PlayMatchToggle from "./filters/PlayMatchToggle";
import SportsFilter from "./filters/SportsFilter";
import ConditionFilter from "./filters/ConditionFilter";
import LevelFilter from "./filters/LevelFilter";
import GenderFilter from "./filters/GenderFilter";
import BrandFilter from "./filters/BrandFilter";
import ShippingFilter from "./filters/ShippingFilter";
import { Category, Brand } from "../hooks/useShopFilters";

export interface CatalogMobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
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
  productsCount: number;
}

/**
 * CatalogMobileFilters wraps filters in a sliding bottom sheet using React Portals.
 */
export default function CatalogMobileFilters({
  isOpen,
  onClose,
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
  productsCount,
}: CatalogMobileFiltersProps) {
  // Mobile accordion toggle states
  const [isSportsOpen, setIsSportsOpen] = useState(false);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [isGendersOpen, setIsGendersOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // Sync accordion layout open states on modal presentation
  useEffect(() => {
    if (isOpen) {
      setIsSportsOpen(selectedCategory !== null);
      setIsConditionsOpen(selectedConditions.length > 0);
      setIsLevelsOpen(selectedLevels.length > 0);
      setIsGendersOpen(selectedGenders.length > 0);
      setIsBrandsOpen(selectedBrand !== null);
      setIsPriceOpen(minPrice !== "" || maxPrice !== "" || isShipping);
    }
  }, [isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    selectedConditions.length +
    selectedLevels.length +
    selectedGenders.length +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0) +
    (isShipping ? 1 : 0) +
    (onlyRecommended ? 1 : 0);

  return createPortal(
    <div style={{ zIndex: 9999 }} className="fixed inset-0 lg:hidden bg-zinc-950 flex flex-col animate-in fade-in duration-200">
      <div className="relative z-10 bg-zinc-950 flex flex-col h-dvh w-full shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-black uppercase tracking-widest italic">Filtres de sport</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Content */}
        <ScrollArea className="p-6 flex flex-col gap-4 pb-6">
          <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col gap-4 shrink-0">
            {/* Search */}
            <SearchFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} isMobile />

            {/* SortBy */}
            <SortByFilter sortBy={sortBy} setSortBy={setSortBy} isAuthenticated={isAuthenticated} isMobile />
          </div>

          {/* PlayMatch Toggle */}
          {isAuthenticated && (
            <PlayMatchToggle onlyRecommended={onlyRecommended} setOnlyRecommended={setOnlyRecommended} isMobile />
          )}

          {/* Sports Accordion */}
          <SportsFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isMobile
            isOpen={isSportsOpen}
            setIsOpen={setIsSportsOpen}
          />

          {/* Conditions Accordion */}
          <ConditionFilter
            selectedConditions={selectedConditions}
            setSelectedConditions={setSelectedConditions}
            toggleSelection={toggleSelection}
            isMobile
            isOpen={isConditionsOpen}
            setIsOpen={setIsConditionsOpen}
          />

          {/* Levels Accordion */}
          <LevelFilter
            selectedLevels={selectedLevels}
            setSelectedLevels={setSelectedLevels}
            toggleSelection={toggleSelection}
            isMobile
            isOpen={isLevelsOpen}
            setIsOpen={setIsLevelsOpen}
          />

          {/* Gender Accordion */}
          <GenderFilter
            selectedGenders={selectedGenders}
            setSelectedGenders={setSelectedGenders}
            toggleSelection={toggleSelection}
            isMobile
            isOpen={isGendersOpen}
            setIsOpen={setIsGendersOpen}
          />

          {/* Brands Accordion */}
          <BrandFilter
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            isMobile
            isOpen={isBrandsOpen}
            setIsOpen={setIsBrandsOpen}
          />

          {/* Price & Options Accordion */}
          <ShippingFilter
            isShipping={isShipping}
            setIsShipping={setIsShipping}
            isMobile
            isOpen={isPriceOpen}
            setIsOpen={setIsPriceOpen}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </ScrollArea>

        {/* Persisted Footer Buttons */}
        <div className="p-5 bg-zinc-950 border-t border-white/10 grid grid-cols-2 gap-4 shrink-0 z-20 pb-8 rounded-b-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full py-3.5 border border-white/25 text-white/60 hover:text-white active:scale-95 transition-all text-[9px] font-black uppercase italic tracking-widest cursor-pointer hover:border-white/40"
          >
            Réinitialiser ({activeFiltersCount})
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-brand-primary text-white active:scale-95 transition-all text-[9px] font-black uppercase italic tracking-widest cursor-pointer shadow-[0_0_20px_rgba(125,56,255,0.3)] hover:bg-brand-primary/90"
          >
            Voir les articles ({productsCount})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
