"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { ProductCard } from "@/components/home/ProductCard";

export interface ProductGridProps {
  products: any[];
  visibleCount: number;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  visibleCardsPerRow: number;
  handleResetFilters: () => void;
  mounted: boolean;
  filtersLoaded: boolean;
  isRestoringFilters: boolean;
  isPending: boolean;
  hasSavedFilters: boolean;
}

/**
 * ProductGrid renders loading states, empty state screens, and responsive product list cards.
 */
export default function ProductGrid({
  products,
  visibleCount,
  setVisibleCount,
  visibleCardsPerRow,
  handleResetFilters,
  mounted,
  filtersLoaded,
  isRestoringFilters,
  isPending,
  hasSavedFilters,
}: ProductGridProps) {
  // Global loading state
  if ((mounted && !filtersLoaded && hasSavedFilters) || isRestoringFilters || (isPending && products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-32">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase font-black italic tracking-widest text-zinc-500">
          Mise à jour du catalogue...
        </span>
      </div>
    );
  }

  if (products.length > 0) {
    return (
      <div className="text-center w-full flex-1">
        {/* Grille responsive des cartes */}
        <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,240px)] gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-10 justify-center w-full">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              condition={product.state}
              category={product.category?.label || "SPORT"}
              image={product.media?.[0]?.url}
              matchScore={product.matchScore > 0 ? product.matchScore : undefined}
              fullProduct={product}
            />
          ))}
        </div>

        {/* Bouton Voir Plus */}
        {products.length > visibleCount && (
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + visibleCardsPerRow * 2)}
              className="relative px-8 py-3.5 bg-zinc-950 text-white font-black uppercase italic tracking-widest text-[10px] border border-white/20 hover:border-brand-primary hover:bg-brand-primary/10 transition-all rounded-none cursor-pointer group"
            >
              <span className="relative z-10">Afficher plus d'articles</span>
              <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-none pointer-events-none" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Beautiful Empty state
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl max-w-2xl mx-auto w-full mt-4 mb-auto">
      <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4">
        <Trash2 className="w-5 h-5 text-brand-primary" />
      </div>
      <h4 className="text-base font-black uppercase italic tracking-tight mb-2">Aucun article trouvé</h4>
      <p className="text-xs text-white/50 max-w-md leading-relaxed mb-6">
        Vos critères de filtrage sont très spécifiques. Essayez de réinitialiser vos options ou d'élargir vos recherches pour trouver le matériel idéal !
      </p>
      <button
        type="button"
        onClick={handleResetFilters}
        className="px-6 py-3 bg-brand-primary text-white font-black uppercase italic tracking-widest text-[10px] hover:bg-brand-primary/95 transition-all rounded-none cursor-pointer"
      >
        Réinitialiser les critères
      </button>
    </div>
  );
}
