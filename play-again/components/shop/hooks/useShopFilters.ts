"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { getFilteredProducts } from "@/app/actions/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useVisibleCardsCount } from "@/hooks/useVisibleCardsCount";

export interface Category {
  id: number;
  name: string;
  productCount?: number;
}

export interface Brand {
  id: number;
  label: string;
}

export interface UseShopFiltersProps {
  initialProducts: any[];
  initialPlayMatch?: boolean;
  initialCategory?: number | null;
  initialSearchQuery?: string | null;
}

/**
 * Custom hook useShopFilters handles filtering states, session storage, search debouncing,
 * and fetching items from Server Actions.
 */
export function useShopFilters({
  initialProducts,
  initialPlayMatch = false,
  initialCategory = null,
  initialSearchQuery = null,
}: UseShopFiltersProps) {
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [isRestoringFilters, setIsRestoringFilters] = useState(false);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>(isAuthenticated ? "match" : "recent");
  const [isShipping, setIsShipping] = useState(false);
  const [onlyRecommended, setOnlyRecommended] = useState(initialPlayMatch);

  // --- OTHER STATES ---
  const visibleCardsPerRow = useVisibleCardsCount(3);
  const [products, setProducts] = useState(initialProducts);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize initial pagination
  useEffect(() => {
    setVisibleCount(visibleCardsPerRow * 4);
  }, [visibleCardsPerRow]);

  // Load from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("playagain_shop_filters");
      if (saved) {
        setIsRestoringFilters(true);
        const filters = JSON.parse(saved);

        if (initialSearchQuery !== undefined && initialSearchQuery !== null) {
          setSearchQuery(initialSearchQuery);
        } else if (filters.searchQuery !== undefined) {
          setSearchQuery(filters.searchQuery);
        }

        if (initialCategory !== undefined && initialCategory !== null) {
          setSelectedCategory(initialCategory);
        } else if (filters.selectedCategory !== undefined) {
          setSelectedCategory(filters.selectedCategory);
        }

        if (filters.selectedBrand !== undefined) setSelectedBrand(filters.selectedBrand);
        if (filters.selectedConditions !== undefined) setSelectedConditions(filters.selectedConditions);
        if (filters.selectedGenders !== undefined) setSelectedGenders(filters.selectedGenders);
        if (filters.selectedLevels !== undefined) setSelectedLevels(filters.selectedLevels);
        if (filters.minPrice !== undefined) setMinPrice(filters.minPrice);
        if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice);
        if (filters.sortBy !== undefined) setSortBy(filters.sortBy);
        if (filters.isShipping !== undefined) setIsShipping(filters.isShipping);

        if (initialPlayMatch) {
          setOnlyRecommended(true);
        } else if (filters.onlyRecommended !== undefined) {
          setOnlyRecommended(filters.onlyRecommended);
        }
      } else {
        if (initialCategory !== undefined && initialCategory !== null) {
          setSelectedCategory(initialCategory);
        }
        if (initialSearchQuery !== undefined && initialSearchQuery !== null) {
          setSearchQuery(initialSearchQuery);
        }
        if (initialPlayMatch) {
          setIsRestoringFilters(true);
          setOnlyRecommended(true);
        }
      }
    } catch (e) {
      console.error("Failed to load filters from sessionStorage:", e);
    } finally {
      setFiltersLoaded(true);
    }
  }, [initialPlayMatch, initialCategory, initialSearchQuery]);

  // Save to sessionStorage
  useEffect(() => {
    if (!filtersLoaded) return;

    const filters = {
      searchQuery,
      selectedCategory,
      selectedBrand,
      selectedConditions,
      selectedGenders,
      selectedLevels,
      minPrice,
      maxPrice,
      sortBy,
      isShipping,
      onlyRecommended,
    };
    try {
      sessionStorage.setItem("playagain_shop_filters", JSON.stringify(filters));
    } catch (e) {
      console.error("Failed to save filters to sessionStorage:", e);
    }
  }, [
    filtersLoaded,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedConditions,
    selectedGenders,
    selectedLevels,
    minPrice,
    maxPrice,
    sortBy,
    isShipping,
    onlyRecommended,
  ]);

  // Apply filters Server Action
  const handleApplyFilters = useCallback(() => {
    startTransition(async () => {
      try {
        const results = await getFilteredProducts({
          searchQuery: searchQuery || undefined,
          categoryId: selectedCategory || undefined,
          brandId: selectedBrand || undefined,
          conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
          targetGenders: selectedGenders.length > 0 ? selectedGenders : undefined,
          sportLevels: selectedLevels.length > 0 ? selectedLevels : undefined,
          minPrice: minPrice !== "" ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
          sortBy,
          isShipping: isShipping || undefined,
          onlyRecommended: onlyRecommended || undefined,
        });
        setProducts(results);
        setVisibleCount(visibleCardsPerRow * 4);
      } catch (error) {
        console.error("Erreur de filtrage :", error);
      } finally {
        setIsRestoringFilters(false);
      }
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedConditions,
    selectedGenders,
    selectedLevels,
    minPrice,
    maxPrice,
    sortBy,
    isShipping,
    onlyRecommended,
    visibleCardsPerRow,
  ]);

  // Search Debouncing
  useEffect(() => {
    if (!filtersLoaded) return;

    const delayDebounceFn = setTimeout(() => {
      handleApplyFilters();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    filtersLoaded,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedConditions,
    selectedGenders,
    selectedLevels,
    minPrice,
    maxPrice,
    sortBy,
    isShipping,
    onlyRecommended,
    handleApplyFilters,
  ]);

  // Reset Filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedConditions([]);
    setSelectedGenders([]);
    setSelectedLevels([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy(isAuthenticated ? "match" : "recent");
    setIsShipping(false);
    setOnlyRecommended(false);
  }, [isAuthenticated]);

  const toggleSelection = useCallback((value: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  }, []);

  return {
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
  };
}
