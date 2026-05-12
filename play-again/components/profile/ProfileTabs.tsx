"use client";

import { useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface ProfileTabsProps {
  listings: any[];
  purchases: any[];
}

export function ProfileTabs({ listings, purchases }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "purchases">("listings");

  return (
    <div className="w-full">
      {/* Tab Switcher - Minimalist with Brand Violet & Lime */}
      <div className="flex bg-zinc-900/80 backdrop-blur-sm p-1 rounded-full mb-10 border border-white/10 max-w-xl mx-auto md:mx-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setActiveTab("listings")}
          className={`relative flex-1 flex items-center justify-center gap-3 py-3 rounded-full font-black uppercase tracking-[0.15em] text-[10px] md:text-xs transition-all duration-500 group cursor-pointer ${
            activeTab === "listings" 
              ? "bg-zinc-800 text-white shadow-[0_0_20px_rgba(125,56,255,0.15)]" 
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <Package className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-500 ${
            activeTab === "listings" ? "text-brand-primary" : "text-zinc-700 group-hover:text-zinc-500"
          }`} />
          <span className="relative z-10">Annonces</span>
          
          {/* Compteur avec touche Lime */}
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "listings" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{listings.length}]
          </span>

          {/* Indicateur Violet Lumineux */}
          {activeTab === "listings" && (
            <div className="absolute -bottom-[2px] w-8 h-[2px] bg-brand-primary rounded-full shadow-[0_0_10px_#7D38FF]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("purchases")}
          className={`relative flex-1 flex items-center justify-center gap-3 py-3 rounded-full font-black uppercase tracking-[0.15em] text-[10px] md:text-xs transition-all duration-500 group cursor-pointer ${
            activeTab === "purchases" 
              ? "bg-zinc-800 text-white shadow-[0_0_20px_rgba(125,56,255,0.15)]" 
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <ShoppingBag className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-500 ${
            activeTab === "purchases" ? "text-brand-primary" : "text-zinc-700 group-hover:text-zinc-500"
          }`} />
          <span className="relative z-10">Achats</span>
          
          {/* Compteur avec touche Lime */}
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "purchases" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{purchases.length}]
          </span>

          {/* Indicateur Violet Lumineux */}
          {activeTab === "purchases" && (
            <div className="absolute -bottom-[2px] w-8 h-[2px] bg-brand-primary rounded-full shadow-[0_0_10px_#7D38FF]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "listings" ? (
          listings.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((product) => (
                <ProductCard 
                  key={product.id} 
                  title={product.title}
                  price={Number(product.price)}
                  condition={product.state}
                  category={product.category?.label || "Sport"}
                  image={product.media?.[0]?.url}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 border-dashed">
              <Package className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aucune annonce</p>
              <Link 
                href="/sell" 
                className="mt-6 px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all cursor-pointer inline-block"
              >
                Vendre un article
              </Link>
            </div>
          )
        ) : (
          purchases.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((product) => (
                <ProductCard 
                  key={product.id} 
                  title={product.title}
                  price={Number(product.price)}
                  condition={product.state}
                  category={product.category?.label || "Sport"}
                  image={product.media?.[0]?.url}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 border-dashed">
              <ShoppingBag className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aucun achat</p>
              <button className="mt-6 px-6 py-3 border border-brand-accent/20 text-brand-accent rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-all cursor-pointer">
                Explorer le shop
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
