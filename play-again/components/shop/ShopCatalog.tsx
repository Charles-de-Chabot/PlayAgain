"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useShopFilters, Category, Brand } from "./hooks/useShopFilters";
import CatalogSidebar from "./catalog/CatalogSidebar";
import CatalogMobileFilters from "./catalog/CatalogMobileFilters";
import ProductGrid from "./catalog/ProductGrid";

interface ShopCatalogProps {
  initialProducts: any[];
  categories: Category[];
  brands: Brand[];
  initialPlayMatch?: boolean;
  initialCategory?: number | null;
  initialSearchQuery?: string | null;
}

const hasSavedFilters = () => {
  if (typeof window === "undefined") return false;
  try {
    return !!sessionStorage.getItem("playagain_shop_filters");
  } catch {
    return false;
  }
};

/**
 * ShopCatalog coordinates the public shop layout.
 */
export function ShopCatalog({
  initialProducts,
  categories,
  brands,
  initialPlayMatch = false,
  initialCategory = null,
  initialSearchQuery = null,
}: ShopCatalogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isAuthenticated,
    isPending,
    filtersLoaded,
    isRestoringFilters,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    selectedConditions,
    setSelectedConditions,
    selectedGenders,
    setSelectedGenders,
    selectedLevels,
    setSelectedLevels,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    isShipping,
    setIsShipping,
    onlyRecommended,
    setOnlyRecommended,
    products,
    visibleCount,
    setVisibleCount,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    visibleCardsPerRow,
    handleResetFilters,
    toggleSelection,
  } = useShopFilters({
    initialProducts,
    initialPlayMatch,
    initialCategory,
    initialSearchQuery,
  });

  return (
    <div className="w-full max-w-8xl mx-auto px-4 md:px-16 py-6 text-white relative">
      {/* 1. EN-TÊTE DYNAMIQUE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Tous les <span className="text-brand-primary">articles</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
            <span>
              Découvrez {products.length}{" "}
              {products.length > 1 ? "équipements de sport disponibles" : "équipement de sport disponible"}
            </span>
            {isPending && <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />}
          </p>
        </div>

        {/* Bouton Filtres Mobile */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-black uppercase italic tracking-widest hover:border-brand-primary active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
          Filtres & Tri
        </button>
      </div>

      {/* 2. LAYOUT DE COLONNES */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* COLONNE FILTRES (DESKTOP) */}
        <CatalogSidebar
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onlyRecommended={onlyRecommended}
          setOnlyRecommended={setOnlyRecommended}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
          selectedLevels={selectedLevels}
          setSelectedLevels={setSelectedLevels}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          brands={brands}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedGenders={selectedGenders}
          setSelectedGenders={setSelectedGenders}
          isShipping={isShipping}
          setIsShipping={setIsShipping}
          handleResetFilters={handleResetFilters}
          toggleSelection={toggleSelection}
          isAuthenticated={isAuthenticated}
        />

        {/* 3. GRILLE DE PRODUITS (DROITE) */}
        <main className="flex-1 w-full flex flex-col justify-between min-h-[500px]">
          <ProductGrid
            products={products}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            visibleCardsPerRow={visibleCardsPerRow}
            handleResetFilters={handleResetFilters}
            mounted={mounted}
            filtersLoaded={filtersLoaded}
            isRestoringFilters={isRestoringFilters}
            isPending={isPending}
            hasSavedFilters={hasSavedFilters()}
          />
        </main>
      </div>

      {/* 4. MODAL / TIROIR FILTRES MOBILE */}
      {mounted && (
        <CatalogMobileFilters
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onlyRecommended={onlyRecommended}
          setOnlyRecommended={setOnlyRecommended}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
          selectedLevels={selectedLevels}
          setSelectedLevels={setSelectedLevels}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          brands={brands}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedGenders={selectedGenders}
          setSelectedGenders={setSelectedGenders}
          isShipping={isShipping}
          setIsShipping={setIsShipping}
          handleResetFilters={handleResetFilters}
          toggleSelection={toggleSelection}
          isAuthenticated={isAuthenticated}
          productsCount={products.length}
        />
      )}
    </div>
  );
}
