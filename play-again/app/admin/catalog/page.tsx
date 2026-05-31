"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Maximize2, 
  X, 
  User, 
  Tag, 
  DollarSign, 
  Loader2,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  Check,
  Calendar,
  Sliders,
  Activity
} from "lucide-react";

interface ProductAdmin {
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

export default function CatalogAdminPage() {
  // --- ÉTATS ---
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterState, setFilterState] = useState(""); // "NEUF", "EXCELLENT", "BON", "SATISFAISANT"
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductAdmin | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [isSellerDrawerOpen, setIsSellerDrawerOpen] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pour remplir les filtres dynamiquement à partir des données réelles
  const [categories, setCategories] = useState<{ id: number; label: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; label: string }[]>([]);

  // --- CHARGEMENT DU CATALOGUE ---
  const fetchCatalog = async () => {
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
        
        // Extraire dynamiquement les catégories et marques uniques pour filtrage réactif
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
      showNotification("error", "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCatalog();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, filterCategory, filterBrand, filterStatus, filterState, sortBy]);

  // Fermer les dropdowns lors d'un clic extérieur
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };
  const handleViewSeller = async (userId: number) => {
    try {
      setSellerLoading(true);
      setIsSellerDrawerOpen(true);
      const response = await fetch(`/api/admin/users?userId=${userId}`);
      const data = await response.json();
      if (data.user) {
        setSelectedSeller(data.user);
      } else {
        console.error("Seller not found");
        showNotification("error", "Impossible de récupérer les détails du vendeur.");
      }
    } catch (error) {
      console.error("Error fetching seller details:", error);
      showNotification("error", "Une erreur est survenue lors de la récupération.");
    } finally {
      setSellerLoading(false);
    }
  };
  const handleToggleProductActive = async (productId: number, currentActiveState: boolean) => {
    try {
      setActionLoadingId(productId);
      const res = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          is_active: !currentActiveState
        })
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      // Mise à jour locale
      setProducts(products.map(p => {
        if (p.id === productId) {
          return { ...p, is_active: !currentActiveState };
        }
        return p;
      }));
      showNotification("success", data.message);
    } catch (e) {
      console.error(e);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setActionLoadingId(null);
    }
  };

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
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Modération du Catalogue
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Examinez les articles de sport mis en vente. Suspendre les fiches contrefaites ou non conformes.
        </p>
      </div>

      {/* 🔍 Barre de Recherche & Filtres Premium */}
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

          {/* Tri (SortBy) - Custom Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "sortBy" ? null : "sortBy")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "sortBy" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "sortBy" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "sortBy" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "date_desc", label: "Date : Plus récent", icon: Calendar },
                    { value: "date_asc", label: "Date : Plus ancien", icon: Calendar },
                    { value: "price_desc", label: "Prix : Plus cher", icon: DollarSign },
                    { value: "price_asc", label: "Prix : Moins cher", icon: DollarSign }
                  ].map((option) => {
                    const isSelected = sortBy === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
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
              onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "category" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterCategory === "" 
                    ? "Toutes les catégories" 
                    : categories.find(c => c.id.toString() === filterCategory)?.label || "Catégorie inconnue"
                  }
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "category" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "category" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full max-h-60 bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-y-auto backdrop-blur-xl scrollbar-thin scrollbar-thumb-white/10">
                <div className="p-1 space-y-0.5">
                  <button
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
              onClick={() => setActiveDropdown(activeDropdown === "brand" ? null : "brand")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "brand" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterBrand === "" 
                    ? "Toutes les marques" 
                    : brands.find(b => b.id.toString() === filterBrand)?.label || "Marque inconnue"
                  }
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "brand" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "brand" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full max-h-60 bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-y-auto backdrop-blur-xl scrollbar-thin scrollbar-thumb-white/10 font-medium">
                <div className="p-1 space-y-0.5 font-medium">
                  <button
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
              onClick={() => setActiveDropdown(activeDropdown === "state" ? null : "state")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "state" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "state" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "state" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Tous les états d'usure" },
                    { value: "NEUF", label: "Neuf" },
                    { value: "EXCELLENT", label: "Excellent" },
                    { value: "BON", label: "Bon" },
                    { value: "SATISFAISANT", label: "Satisfaisant" }
                  ].map((option) => {
                    const isSelected = filterState === option.value;
                    return (
                      <button
                        key={option.value}
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

          {/* Dropdown Statut (Disponibilité / Publication) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "status" ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-300 hover:border-white/20"
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "status" ? "rotate-180 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant */}
            {activeDropdown === "status" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Toutes les dispo", icon: Eye },
                    { value: "active", label: "En vente (Actifs)", icon: Eye },
                    { value: "inactive", label: "Suspendus uniquement", icon: Trash2 },
                    { value: "sold", label: "Vendus uniquement", icon: CheckCircle }
                  ].map((option) => {
                    const isSelected = filterStatus === option.value;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
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

      {/* 📦 Galerie de cartes de modération */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Analyse du catalogue en cours...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <AlertCircle className="w-8 h-8 text-slate-500" />
          <span className="text-xs text-slate-500 font-bold">Aucune annonce trouvée dans le catalogue.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const firstImage = product.media?.[0]?.url || "/placeholder-product.png";
            return (
              <div 
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setIsDrawerOpen(true);
                  setIsSellerDrawerOpen(false);
                }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer"
              >
                {/* 🖼️ Zone Image avec effet loupe au clic */}
                <div className="aspect-[4/3] bg-black/60 relative overflow-hidden border-b border-white/[0.04]">
                  <img 
                    src={firstImage} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                  />
                  
                  {/* Bouton pour agrandir */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(firstImage);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/65 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md"
                    title="Zoomer sur la photo"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Badges sur l'image */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[8px] font-black uppercase bg-[#10B981]/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {product.category.label}
                    </span>
                    <span className="text-[8px] font-black uppercase bg-white/5 text-slate-300 border border-white/15 px-2 py-0.5 rounded-full backdrop-blur-md">
                      État : {product.state}
                    </span>
                  </div>
                </div>

                {/* 📝 Contenu Carte */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-white line-clamp-1 leading-snug">
                        {product.title}
                      </h3>
                      <span className="text-sm font-black text-emerald-400 font-mono tracking-tight shrink-0">
                        {parseFloat(product.price).toFixed(2)}€
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || "Aucune description fournie par le vendeur."}
                    </p>
                  </div>

                  {/* Infos Vendeur & Date */}
                  <div className="border-t border-white/[0.04] pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{product.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span>Marque : <span className="text-white font-bold">{product.brand.label}</span></span>
                    </div>
                  </div>

                  {/* Boutons d'Action administrative */}
                  <div className="border-t border-white/[0.04] pt-3 flex gap-2">
                    {product.is_sold ? (
                      <div className="w-full text-center bg-slate-800/20 border border-slate-700/30 text-slate-500 font-extrabold text-[10px] uppercase py-2.5 rounded-xl" onClick={(e) => e.stopPropagation()}>
                        Produit Vendu (Modération close)
                      </div>
                    ) : product.is_active ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProductActive(product.id, true);
                        }}
                        disabled={actionLoadingId === product.id}
                        className="w-full bg-gradient-to-r from-red-600/10 to-rose-600/10 hover:from-red-600 hover:to-rose-600 text-red-400 hover:text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[10px] uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-97 cursor-pointer"
                      >
                        {actionLoadingId === product.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Suspendre l'annonce</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProductActive(product.id, false);
                        }}
                        disabled={actionLoadingId === product.id}
                        className="w-full bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 hover:from-emerald-600 hover:to-cyan-600 text-emerald-400 hover:text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[10px] uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-97 cursor-pointer"
                      >
                        {actionLoadingId === product.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Réactiver l'annonce</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🖼️ MODAL DE ZOOM IMAGE (LIGHTBOX OVERLAY) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/15 shadow-2xl relative">
            <img src={selectedImage} alt="Zoom produit" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* 🚀 TIROIR LATÉRAL DÉROULANT (MODAL DRAWER) */}
      {isDrawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Arrière-plan flou d'ombrage */}
          <div 
            onClick={() => {
              setIsDrawerOpen(false);
              setIsSellerDrawerOpen(false);
            }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Corps du Tiroir (Slide-in Right Container) */}
          <div className="w-full max-w-md bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left overflow-y-auto">
            <div className="space-y-6">
              {/* En-tête Tiroir */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Détail de l'Annonce
                </h3>
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsSellerDrawerOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Visuel principal avec zoom possible */}
              <div className="aspect-[4/3] bg-black/60 rounded-2xl overflow-hidden border border-white/[0.08] relative group">
                <img 
                  src={selectedProduct.media?.[0]?.url || "/placeholder-product.png"} 
                  alt={selectedProduct.title} 
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setSelectedImage(selectedProduct.media?.[0]?.url || "/placeholder-product.png")}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/65 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-all shadow-md"
                  title="Zoomer sur la photo"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Titre & Prix */}
              <div>
                <h2 className="text-lg font-black text-white leading-snug">{selectedProduct.title}</h2>
                <div className="text-2xl font-black text-brand-accent font-mono tracking-tight mt-1">
                  {parseFloat(selectedProduct.price).toFixed(2)}€
                </div>
              </div>

              {/* Détails Techniques / Caractéristiques */}
              <div className="space-y-3 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-slate-500 font-bold">Catégorie</span>
                  <span className="text-white font-extrabold uppercase bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                    {selectedProduct.category.label}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-slate-500 font-bold">Marque</span>
                  <span className="text-white font-extrabold">{selectedProduct.brand.label}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-slate-500 font-bold">État d'usure</span>
                  <span className="text-white font-extrabold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    {selectedProduct.state}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-slate-500 font-bold">Date de publication</span>
                  <span className="text-slate-400 font-semibold">
                    {new Date(selectedProduct.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 font-bold">Disponibilité</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    selectedProduct.is_sold
                      ? "bg-slate-800/20 border-slate-700/30 text-slate-500"
                      : selectedProduct.is_active
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      selectedProduct.is_sold ? "bg-slate-500" : selectedProduct.is_active ? "bg-emerald-400" : "bg-red-400"
                    }`} />
                    <span>
                      {selectedProduct.is_sold ? "Vendu" : selectedProduct.is_active ? "Actif (En vente)" : "Suspendu"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Description de l'annonce</h4>
                <p className="text-xs text-slate-400 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedProduct.description || "Aucune description fournie par le vendeur."}
                </p>
              </div>

              {/* Fiche Vendeur */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vendeur</h4>
                <div 
                  onClick={() => handleViewSeller(selectedProduct.user.id)}
                  className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.08] hover:border-brand-primary/30 p-4 rounded-2xl text-xs cursor-pointer active:scale-98 transition-all duration-300"
                  title="Voir le profil complet du vendeur"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate hover:text-brand-accent transition-colors">
                      {selectedProduct.user.username || "Membre PlayAgain"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      {selectedProduct.user.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de modération en bas du tiroir */}
            <div className="border-t border-white/[0.06] pt-4 mt-6">
              {selectedProduct.is_sold ? (
                <div className="w-full text-center bg-slate-800/20 border border-slate-700/30 text-slate-500 font-extrabold text-[11px] uppercase py-3 rounded-xl">
                  Produit Vendu (Modération close)
                </div>
              ) : selectedProduct.is_active ? (
                <button
                  onClick={async () => {
                    await handleToggleProductActive(selectedProduct.id, true);
                    setSelectedProduct({ ...selectedProduct, is_active: false });
                  }}
                  disabled={actionLoadingId === selectedProduct.id}
                  className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-red-950/20"
                >
                  {actionLoadingId === selectedProduct.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Suspendre l'annonce immédiatement</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await handleToggleProductActive(selectedProduct.id, false);
                    setSelectedProduct({ ...selectedProduct, is_active: true });
                  }}
                  disabled={actionLoadingId === selectedProduct.id}
                  className="w-full bg-gradient-to-r from-emerald-650 to-cyan-650 hover:from-emerald-600 hover:to-cyan-600 text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  {actionLoadingId === selectedProduct.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Réactiver l'annonce</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 TIROIR DU VENDEUR (S'affiche à GAUCHE du Tiroir Produit) */}
      {isSellerDrawerOpen && (
        <div className="fixed inset-0 z-45 flex justify-end pointer-events-none">
          {/* Arrière-plan flou d'ombrage optionnel sur mobile */}
          <div 
            onClick={() => setIsSellerDrawerOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity pointer-events-auto md:hidden" 
          />

          {/* Corps du Tiroir Vendeur */}
          <div className="w-full max-w-md bg-[#090C15]/98 border-l border-white/[0.06] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left md:right-[448px] pointer-events-auto overflow-y-auto backdrop-blur-xl">
            {sellerLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Chargement du profil vendeur...</span>
              </div>
            ) : selectedSeller ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* En-tête Tiroir Vendeur */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-accent">
                      Profil du Vendeur
                    </h3>
                    <button 
                      onClick={() => setIsSellerDrawerOpen(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fiche d'identité d'utilisateur */}
                  <div className="flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {selectedSeller.profile_picture ? (
                        <img src={selectedSeller.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-slate-400 font-mono">
                          {(selectedSeller.username || selectedSeller.email).substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-extrabold text-white truncate flex items-center gap-1.5">
                        {selectedSeller.username || "Sans pseudo"}
                        {selectedSeller.is_certified && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Certifié" />
                        )}
                      </span>
                      <span className="text-xs text-slate-500 font-bold uppercase mt-0.5">
                        ID unique : #{selectedSeller.id}
                      </span>
                      <span className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border mt-2 ${
                        selectedSeller.role === "ADMIN" 
                          ? "bg-red-500/10 border-red-500/20 text-red-400" 
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      }`}>
                        Rôle : {selectedSeller.role}
                      </span>
                    </div>
                  </div>

                  {/* Informations Générales */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informations Personnelles</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                        <span className="text-slate-500 font-bold">Nom Complet</span>
                        <span className="text-white font-extrabold">
                          {selectedSeller.firstname || selectedSeller.lastname 
                            ? `${selectedSeller.firstname || ""} ${selectedSeller.lastname || ""}`.trim()
                            : "Non renseigné"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                        <span className="text-slate-500 font-bold">Adresse E-mail</span>
                        <span className="text-white font-mono font-bold select-all">{selectedSeller.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                        <span className="text-slate-500 font-bold">Téléphone</span>
                        <span className="text-white font-semibold">
                          {selectedSeller.phone || "Non renseigné"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                        <span className="text-slate-500 font-bold">Inscription</span>
                        <span className="text-slate-400 font-semibold">
                          {new Date(selectedSeller.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                        <span className="text-slate-500 font-bold">Total Annonces</span>
                        <span className="text-brand-primary font-black font-mono">
                          {selectedSeller._count.products}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500 font-bold">Statut de Compte</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          selectedSeller.is_active 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${selectedSeller.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                          <span>{selectedSeller.is_active ? "Actif" : "Suspendu"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions de modération du vendeur */}
                <div className="border-t border-white/[0.06] pt-4 mt-6">
                  {selectedSeller.is_active ? (
                    <button
                      onClick={async () => {
                        try {
                          setActionLoadingId(selectedSeller.id);
                          const res = await fetch("/api/admin/users", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: selectedSeller.id, isActive: false })
                          });
                          const data = await res.json();
                          if (data.user) {
                            setSelectedSeller({ ...selectedSeller, is_active: false });
                            showNotification("success", "Le vendeur a été suspendu ainsi que toutes ses annonces.");
                            fetchCatalog();
                          }
                        } catch (err) {
                          console.error(err);
                          showNotification("error", "Erreur lors de la suspension.");
                        } finally {
                          setActionLoadingId(null);
                        }
                      }}
                      disabled={actionLoadingId === selectedSeller.id}
                      className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-red-950/20"
                    >
                      {actionLoadingId === selectedSeller.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Suspendre le Compte Membre</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          setActionLoadingId(selectedSeller.id);
                          const res = await fetch("/api/admin/users", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: selectedSeller.id, isActive: true })
                          });
                          const data = await res.json();
                          if (data.user) {
                            setSelectedSeller({ ...selectedSeller, is_active: true });
                            showNotification("success", "Le membre a été réactivé avec succès.");
                            fetchCatalog();
                          }
                        } catch (err) {
                          console.error(err);
                          showNotification("error", "Erreur de réactivation.");
                        } finally {
                          setActionLoadingId(null);
                        }
                      }}
                      disabled={actionLoadingId === selectedSeller.id}
                      className="w-full bg-gradient-to-r from-emerald-650 to-cyan-650 hover:from-emerald-600 hover:to-cyan-600 text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-emerald-950/20"
                    >
                      {actionLoadingId === selectedSeller.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Réactiver le Compte Membre</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                Aucune information disponible.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
