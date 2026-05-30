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
  RefreshCw
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
  }, [search, filterCategory, filterBrand, filterStatus]);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
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

      {/* 🔍 Barre de Recherche & Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg">
        {/* Recherche textuelle */}
        <div className="sm:col-span-2 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un article par titre, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>

        {/* Filtrer par Catégorie */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        {/* Filtrer par Statut */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
        >
          <option value="">Tous les états</option>
          <option value="active">En vente (Actifs)</option>
          <option value="inactive">Suspendus uniquement</option>
          <option value="sold">Vendus uniquement</option>
        </select>
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
                className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-white/10 transition-all"
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
                    onClick={() => setSelectedImage(firstImage)}
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
                      <div className="w-full text-center bg-slate-800/20 border border-slate-700/30 text-slate-500 font-extrabold text-[10px] uppercase py-2.5 rounded-xl">
                        Produit Vendu (Modération close)
                      </div>
                    ) : product.is_active ? (
                      <button
                        onClick={() => handleToggleProductActive(product.id, true)}
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
                        onClick={() => handleToggleProductActive(product.id, false)}
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

    </div>
  );
}
