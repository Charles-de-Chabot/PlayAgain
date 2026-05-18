"use client";

import { UserRound } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getCategories } from "@/app/actions/category";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "SKI" },
  { id: 2, name: "VELO" },
  { id: 3, name: "FITNESS" },
  { id: 4, name: "EQUITATION" },
];

export function HomeHero() {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch categories from DB:", error);
      }
    }
    loadCategories();
  }, []);

  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const visibleCategories = isExpanded ? displayCategories : displayCategories.slice(0, 4);

  return (
    <section 
      className={`relative w-full text-white group transition-all duration-500 overflow-hidden ${
        isExpanded 
          ? "h-[520px] md:h-[620px]" 
          : "h-[320px] md:h-[420px]"
      }`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.png" 
          alt="Sport Tech Background" 
          className="w-full h-full object-cover grayscale-[0.2] contrast-125 group-hover:scale-105 transition-transform duration-[10000ms] ease-out"
        />
        {/* Multi-layer Overlay for Depth */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black" />
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary/20 via-transparent to-brand-accent/10" />
      </div>

      {!isAuthenticated && (
        <>
          {/* Icône en filigrane (Watermark) */}
          <div className="absolute -left-10 -top-10 text-brand-primary opacity-5 pointer-events-none xl:hidden -rotate-12 z-10">
            <UserRound className="h-48 w-48" strokeWidth={1} />
          </div>
        </>
      )}

      {/* Fixed layout content wrapper */}
      <div className="absolute inset-0 z-20 flex flex-col p-6 md:p-8 h-full justify-between items-center overflow-hidden">
        
        {/* Top & Middle: Title & Search bar */}
        <div className="w-full text-center flex flex-col items-center z-20">
          {!isAuthenticated && !isExpanded && (
            <div className="relative mb-6 flex h-12 items-end xl:hidden z-20 justify-center">
              <div className="flex gap-2 text-[11px] font-black uppercase italic text-brand-primary tracking-tighter">
                <Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link>
                <span className="text-white/20">/</span>
                <Link href="/auth/register" className="hover:text-white transition-colors">inscription</Link>
              </div>
            </div>
          )}

          <div className={`${isExpanded ? "mb-4 space-y-2" : "mb-8 space-y-3"}`}>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Donnez une <span className="text-brand-primary">seconde vie</span><br/>
              à votre passion
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/40">
              La marketplace élite de l'équipement sportif
            </p>
          </div>

          <SearchBar className={`${isExpanded ? "mb-4" : "mb-8"} w-full max-w-2xl`} />
        </div>

        {/* Scrollable Categories List container (Only this part scrolls if it overflows) */}
        <div 
          className={`w-full max-w-4xl flex-1 custom-scrollbar px-2 z-20 ${
            isExpanded 
              ? "overflow-y-auto max-h-[180px] md:max-h-[260px] py-1" 
              : "overflow-hidden flex items-center justify-center"
          }`}
        >
          <CategoryGrid categories={visibleCategories} />
        </div>

        {/* Pinned Bottom Button: Always visible and static */}
        <div className="mt-6 text-center w-full z-20">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-black uppercase tracking-[0.2em] italic text-brand-primary hover:text-white transition-colors cursor-pointer"
          >
            {isExpanded ? "Voir -" : "Voir +"}
          </button>
        </div>

      </div>
    </section>
  );
}
