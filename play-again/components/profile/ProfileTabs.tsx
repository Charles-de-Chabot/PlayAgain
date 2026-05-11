"use client";

import { useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { Package, ShoppingBag } from "lucide-react";

interface ProfileTabsProps {
  listings: any[];
  purchases: any[];
}

export function ProfileTabs({ listings, purchases }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"listings" | "purchases">("listings");

  return (
    <div className="w-full">
      {/* Tab Switcher - Dark Style */}
      <div className="flex bg-zinc-900/50 backdrop-blur-md p-1.5 rounded-4xl mb-8 border border-white/5 shadow-inner">
        <button
          onClick={() => setActiveTab("listings")}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 ${
            activeTab === "listings" 
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Package className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === "listings" ? "text-brand-primary" : ""}`} />
          <span>Mes annonces</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] ${
            activeTab === "listings" ? "bg-black/5 text-black" : "bg-white/5 text-zinc-500"
          }`}>
            {listings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("purchases")}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 ${
            activeTab === "purchases" 
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ShoppingBag className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === "purchases" ? "text-brand-primary" : ""}`} />
          <span>Mes achats</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] ${
            activeTab === "purchases" ? "bg-black/5 text-black" : "bg-white/5 text-zinc-500"
          }`}>
            {purchases.length}
          </span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
        {activeTab === "listings" ? (
          listings.length > 0 ? (
            listings.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={Number(product.price)}
                condition={product.state}
                category={product.category.label}
                image={product.media?.[0]?.url}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Package className="w-8 h-8 text-zinc-700" />
              </div>
              <p className="text-zinc-500 font-medium">Vous n'avez pas encore d'annonces.</p>
              <button className="mt-4 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">
                Créer une annonce
              </button>
            </div>
          )
        ) : (
          purchases.length > 0 ? (
            purchases.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={Number(product.price)}
                condition={product.state}
                category={product.category.label}
                image={product.media?.[0]?.url}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <ShoppingBag className="w-8 h-8 text-zinc-700" />
              </div>
              <p className="text-zinc-500 font-medium">Vous n'avez pas encore effectué d'achats.</p>
              <button className="mt-4 text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline">
                Explorer le shop
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
