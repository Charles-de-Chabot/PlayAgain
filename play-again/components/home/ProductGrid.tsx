"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";
import { getLatestProducts } from "@/app/actions/catalog";
import { useVisibleCardsCount } from "@/hooks/useVisibleCardsCount";

export function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const visibleCount = useVisibleCardsCount();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getLatestProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="px-6 py-8">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
          Articles <span className="text-brand-primary">Récents</span>
        </h2>
        <div className="h-1 flex-1 ml-6 bg-zinc-100 hidden md:block"></div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="flex flex-row justify-center gap-6 md:gap-8 lg:gap-10 w-full mx-auto max-w-7xl px-2">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              condition={product.state}
              category={product.category?.label || "SPORT"}
              image={product.media?.[0]?.url}
              matchScore={product.matchScore}
              fullProduct={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Aucun article disponible pour le moment.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-block px-8 py-3 bg-zinc-900 text-white font-black uppercase italic tracking-widest text-[10px] hover:bg-brand-primary transition-all rounded-none cursor-pointer">
            Voir Tout le Shop
          </Link>
        </div>
      )}
    </section>
  );
}
