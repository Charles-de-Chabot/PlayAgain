"use client";

import { useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { Package, ShoppingBag, Plus, FileText } from "lucide-react";
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
          
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "listings" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{listings.length}]
          </span>

          {activeTab === "listings" && (
            <div className="absolute bottom-[-2px] w-8 h-[2px] bg-brand-primary rounded-full shadow-[0_0_10px_#7D38FF]" />
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
          
          <span className={`text-[9px] font-bold transition-colors duration-500 ${
            activeTab === "purchases" ? "text-brand-accent" : "text-zinc-800"
          }`}>
            [{purchases.length}]
          </span>

          {activeTab === "purchases" && (
            <div className="absolute bottom-[-2px] w-8 h-[2px] bg-brand-primary rounded-full shadow-[0_0_10px_#7D38FF]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "listings" ? (
          <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,240px)] gap-x-8 gap-y-12 mt-12 justify-center">
            {/* Carte "Ajouter une annonce" style ProductCard */}
            <Link 
              href="/sell"
              className="group flex flex-col rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/15 hover:border-white/40 w-full max-w-[160px] md:max-w-[240px] h-[320px] md:h-[420px] cursor-pointer relative overflow-hidden"
            >
              {/* Image Area Replacement */}
              <div className="relative w-full h-[140px] md:h-[220px] bg-zinc-950/40 flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-500 shadow-2xl border border-white/5">
                  <Plus className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                
                {/* Decorative Pattern / Glow */}
                <div className="absolute inset-0 bg-linear-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Info Area Replacement */}
              <div className="flex flex-col flex-1 p-4 md:p-6 relative">
                <div className="flex items-center gap-1.5 mb-3">
                  <Plus className="w-3 h-3 md:w-4 md:h-4 text-brand-primary" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-primary/70">
                    Nouveau
                  </span>
                </div>

                <h3 className="text-[12px] md:text-sm font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors italic leading-relaxed">
                  Vendre un article
                </h3>

                <div className="mt-auto">
                  <p className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                    Créez votre annonce
                  </p>
                </div>
              </div>

              {/* Border Glow */}
              <div className="absolute inset-0 rounded-[32px] border border-white/0 group-hover:border-white/40 transition-colors duration-500 pointer-events-none" />
            </Link>

            {listings.map((product) => (
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
          purchases.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,220px)] gap-x-8 gap-y-12 mt-12 justify-center">
              {purchases.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 group">
                  <ProductCard 
                    id={product.id}
                    title={product.title}
                    price={Number(product.price)}
                    condition={product.state}
                    category={product.category?.label || "Sport"}
                    image={product.media?.[0]?.url}
                    fullProduct={product}
                  />
                  {product.invoiceId && (
                    <Link
                      href={`/product/${product.id}/checkout/success?invoice_id=${product.invoiceId}`}
                      className="w-full py-2.5 bg-white/5 hover:bg-brand-primary/10 border border-white/10 hover:border-brand-primary/30 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Facture PDF</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] bg-zinc-900/10 border border-white/5 border-dashed">
              <ShoppingBag className="w-12 h-12 text-zinc-800 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aucun achat</p>
              <Link href="/shop" className="inline-block mt-6 px-6 py-3 border border-brand-accent/20 text-brand-accent rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-all cursor-pointer">
                Explorer le shop
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
