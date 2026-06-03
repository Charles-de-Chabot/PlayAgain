"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface ProductAdmin {
  id: number;
  title: string;
  description: string | null;
  price: string;
  state: string;
  is_sold: boolean;
  is_active: boolean;
  created_at: string;
  category: {
    id: number;
    label: string;
  };
  brand: {
    id: number;
    label: string;
  };
  user: {
    id: number;
    username: string | null;
    email: string;
  };
  media: {
    id: number;
    url: string;
  }[];
}

/**
 * Custom hook useAdminCatalog handles search filters, status updates, detail drawers,
 * and seller moderations.
 */
export function useAdminCatalog() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterState, setFilterState] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductAdmin | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [isSellerDrawerOpen, setIsSellerDrawerOpen] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [categories, setCategories] = useState<{ id: number; label: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; label: string }[]>([]);

  // Fetch catalog list from database API
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (filterCategory) queryParams.append("categoryId", filterCategory);
      if (filterBrand) queryParams.append("brandId", filterBrand);
      if (filterStatus) queryParams.append("status", filterStatus);
      if (filterState) queryParams.append("state", filterState);
      if (sortBy) queryParams.append("sortBy", sortBy);

      const res = await fetch(`/api/admin/catalog?${queryParams.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);

        // Reactively extract unique categories and brands for filter options
        const uniqueCats = Array.from(
          new Map(data.products.map((p: any) => [p.category.id, p.category])).values()
        ) as any[];
        const uniqueBrands = Array.from(
          new Map(data.products.map((p: any) => [p.brand.id, p.brand])).values()
        ) as any[];

        setCategories(uniqueCats);
        setBrands(uniqueBrands);
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterBrand, filterStatus, filterState, sortBy, showToast]);

  // Debounce API calls when changing filters
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCatalog();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchCatalog]);

  // Handle outside click to close dropdown menus
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Fetch full details of the product's seller
  const handleViewSeller = useCallback(async (userId: number) => {
    try {
      setSellerLoading(true);
      setIsSellerDrawerOpen(true);
      const response = await fetch(`/api/admin/users?userId=${userId}`);
      const data = await response.json();
      if (data.user) {
        setSelectedSeller(data.user);
      } else {
        showToast("error", "Impossible de récupérer les détails du vendeur.");
      }
    } catch (error) {
      console.error("Error fetching seller details:", error);
      showToast("error", "Une erreur est survenue lors de la récupération.");
    } finally {
      setSellerLoading(false);
    }
  }, [showToast]);

  // Suspend/Reactivate product page listing
  const handleToggleProductActive = useCallback(async (productId: number, currentActiveState: boolean) => {
    try {
      setActionLoadingId(productId);
      const res = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          is_active: !currentActiveState,
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("error", data.error);
        return;
      }

      // Sync state locally
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return { ...p, is_active: !currentActiveState };
          }
          return p;
        })
      );
      showToast("success", data.message);
    } catch (e) {
      console.error(e);
      showToast("error", "Une erreur technique est survenue.");
    } finally {
      setActionLoadingId(null);
    }
  }, [showToast]);

  // Suspend full user profile account
  const handleSuspendSeller = useCallback(async (userId: number) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: false }),
      });
      const data = await res.json();
      if (data.user) {
        setSelectedSeller((prev: any) => (prev ? { ...prev, is_active: false } : null));
        showToast("success", "Le vendeur a été suspendu ainsi que toutes ses annonces.");
        fetchCatalog();
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Erreur lors de la suspension.");
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchCatalog, showToast]);

  // Reactivate user profile account
  const handleReactivateSeller = useCallback(async (userId: number) => {
    try {
      setActionLoadingId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: true }),
      });
      const data = await res.json();
      if (data.user) {
        setSelectedSeller((prev: any) => (prev ? { ...prev, is_active: true } : null));
        showToast("success", "Le membre a été réactivé avec succès.");
        fetchCatalog();
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Erreur de réactivation.");
    } finally {
      setActionLoadingId(null);
    }
  }, [fetchCatalog, showToast]);

  return {
    products,
    setProducts,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterBrand,
    setFilterBrand,
    filterStatus,
    setFilterStatus,
    filterState,
    setFilterState,
    sortBy,
    setSortBy,
    activeDropdown,
    setActiveDropdown,
    selectedProduct,
    setSelectedProduct,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedSeller,
    setSelectedSeller,
    isSellerDrawerOpen,
    setIsSellerDrawerOpen,
    sellerLoading,
    selectedImage,
    setSelectedImage,
    actionLoadingId,
    categories,
    brands,
    fetchCatalog,
    handleViewSeller,
    handleToggleProductActive,
    handleSuspendSeller,
    handleReactivateSeller,
  };
}
