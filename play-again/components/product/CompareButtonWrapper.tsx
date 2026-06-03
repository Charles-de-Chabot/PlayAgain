"use client";

import { useState } from "react";
import { useCompareStore, CompareProduct } from "@/store/useCompareStore";
import { Scale, X } from "lucide-react";
import { getFilteredProducts } from "@/app/actions/catalog";
import Image from "next/image";

export function CompareButtonWrapper({ product }: { product: any }) {
  const { setProductA, setProductB, clearComparison } = useCompareStore();
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompareClick = async () => {
    // 1. Définir ce produit comme Produit A
    const compProduct: CompareProduct = {
      id: Number(product.id),
      title: product.title,
      price: Number(product.price),
      categoryId: product.category_id,
      typeId: product.type_id,
      categoryLabel: product.category?.label || "Sport",
      typeLabel: product.type?.label || "N/A",
      condition: product.state,
      image: product.media?.[0]?.url || "",
      brand: product.brand?.label || "N/A",
      age: product.age,
      accessory_included: product.accessory_included,
      is_shipping: product.is_shipping,
      matchScore: product.matchScore,
      levelCategory: product.levelCategory,
    };
    
    setProductA(compProduct);
    
    // 2. Ouvrir la modale de sélection et charger les produits similaires
    setIsSelectionOpen(true);
    setLoading(true);
    
    try {
      const data = await getFilteredProducts({
        categoryId: product.category_id,
      });
      // Filtrer pour s'assurer que c'est le même type et exclure le produit actuel
      const filtered = data.filter(p => p.type_id === product.type_id && p.id !== product.id);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProductB = (p: any) => {
    const compProductB: CompareProduct = {
      id: Number(p.id),
      title: p.title,
      price: Number(p.price),
      categoryId: p.category_id,
      typeId: p.type_id,
      categoryLabel: p.category?.label || "Sport",
      typeLabel: p.type?.label || "N/A",
      condition: p.state,
      image: p.media?.[0]?.url || "",
      brand: p.brand?.label || "N/A",
      age: p.age,
      accessory_included: p.accessory_included,
      is_shipping: p.is_shipping,
      matchScore: p.matchScore,
      levelCategory: p.levelCategory,
    };
    setProductB(compProductB);
    setIsSelectionOpen(false); // On ferme la modale de sélection, la modale de comparaison globale va s'ouvrir !
  };

  return (
    <>
      <button 
        onClick={handleCompareClick}
        className="w-full h-14 rounded-3xl bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
      >
        <Scale className="w-4 h-4 md:w-5 md:h-5 text-[#5ce1e6]" />
        Comparer cet article
      </button>

      {/* Modale de sélection du produit B */}
      {isSelectionOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative">
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Comparer avec...</h3>
                <p className="text-xs text-white/50 mt-1 line-clamp-1">
                  Recherche des produits similaires à "{product.title}"
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsSelectionOpen(false);
                  clearComparison();
                }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto global-scrollbar flex-1">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#5ce1e6] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : similarProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarProducts.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => handleSelectProductB(p)}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#5ce1e6]/50 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
                        {p.media?.[0]?.url && (
                          <Image src={p.media[0].url} alt={p.title} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#5ce1e6] transition-colors">{p.title}</h4>
                        <p className="text-[10px] sm:text-xs text-white/60 mt-1">{p.state.replace('_', ' ')}</p>
                        <p className="text-xs sm:text-sm font-black text-[#5ce1e6] mt-1">{p.price} €</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-white/50 text-sm font-medium">Aucun autre article similaire disponible pour l'instant.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
