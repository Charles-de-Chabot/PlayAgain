"use client";

import { useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { Package, CheckCircle2, ShoppingBag } from "lucide-react";

interface PublicProfileTabsProps {
  activeListings: any[];
  soldListings: any[];
}

export function PublicProfileTabs({ activeListings, soldListings }: PublicProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "sold">("listings");

  return (
    <div className="w-full">
      {/* Tab Switcher - Premium Glassmorphic */}
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
          <span className="relative z-10">En vente</span>
          
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "listings" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{activeListings.length}]
          </span>

          {activeTab === "listings" && (
            <div className="absolute bottom-[-2px] w-8 h-[2px] bg-brand-primary rounded-full shadow-[0_0_10px_#7D38FF]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sold")}
          className={`relative flex-1 flex items-center justify-center gap-3 py-3 rounded-full font-black uppercase tracking-[0.15em] text-[10px] md:text-xs transition-all duration-500 group cursor-pointer ${
            activeTab === "sold" 
              ? "bg-zinc-800 text-white shadow-[0_0_20px_rgba(125,56,255,0.15)]" 
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-500 ${
            activeTab === "sold" ? "text-brand-accent" : "text-zinc-700 group-hover:text-zinc-500"
          }`} />
          <span className="relative z-10">Vendus</span>
          
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "sold" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{soldListings.length}]
          </span>

          {activeTab === "sold" && (
            <div className="absolute bottom-[-2px] w-8 h-[2px] bg-brand-accent rounded-full shadow-[0_0_10px_#C6FF34]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "listings" ? (
          activeListings.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,240px)] gap-x-8 gap-y-12 mt-12 justify-center md:justify-start">
              {activeListings.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  condition={product.state}
                  category={product.category?.label || "Sport"}
                  image={product.media?.[0]?.url}
                  fullProduct={product}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 border-dashed">
              <Package className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-550 font-bold uppercase tracking-widest text-[10px] text-center">Aucun article en vente pour le moment</p>
            </div>
          )
        ) : (
          soldListings.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,240px)] gap-x-8 gap-y-12 mt-12 justify-center md:justify-start">
              {soldListings.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  condition={product.state}
                  category={product.category?.label || "Sport"}
                  image={product.media?.[0]?.url}
                  fullProduct={product}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 border-dashed">
              <ShoppingBag className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-550 font-bold uppercase tracking-widest text-[10px] text-center">Aucun article vendu pour le moment</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
