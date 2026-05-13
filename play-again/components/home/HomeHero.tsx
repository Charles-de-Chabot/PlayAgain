"use client";

import { UserRound } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function HomeHero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[300px] md:min-h-[400px] flex flex-col justify-center px-6 py-8 text-white overflow-hidden group">
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

          <div className="relative mb-12 flex h-20 items-end xl:hidden z-20">
            <div className="ml-8 flex gap-2 text-[11px] font-black uppercase italic text-brand-primary tracking-tighter">
              <Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link>
              <span className="text-white/20">/</span>
              <Link href="/auth/register" className="hover:text-white transition-colors">inscription</Link>
            </div>
          </div>
        </>
      )}

      <div className="relative z-20 max-w-4xl mx-auto w-full text-center">
        <div className="mb-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
            Donnez une <span className="text-brand-primary">seconde vie</span><br/>
            à votre passion
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/40">
            La marketplace élite de l'équipement sportif
          </p>
        </div>

        <SearchBar className="mb-10" />
        <CategoryGrid />
      </div>

      <div className="mt-12 text-center relative z-20">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] italic text-brand-primary hover:text-white transition-colors">Découvrir l'univers</button>
      </div>
    </section>
  );
}
