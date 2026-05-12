"use client";

import { UserRound } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function HomeHero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-black bg-radial-[at_50%_50%] from-zinc-900 to-black px-6 pb-12 pt-8 text-white overflow-hidden">
      {!isAuthenticated && (
        <>
          {/* Icône en filigrane (Watermark) - Sortie de la div pour ignorer le padding */}
          <div className="absolute -left-10 -top-10 text-brand-primary opacity-10 pointer-events-none xl:hidden -rotate-12">
            <UserRound className="h-48 w-48" strokeWidth={1} />
          </div>

          <div className="relative mb-12 flex h-20 items-end xl:hidden">
            <div className="relative z-10 ml-8 flex gap-2 text-[11px] font-black uppercase italic text-brand-primary tracking-tighter">
              <Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link>
              <span className="text-white/20">/</span>
              <Link href="/auth/register" className="hover:text-white transition-colors">inscription</Link>
            </div>
          </div>
        </>
      )}

      <SearchBar className="mb-4" />
      
      <CategoryGrid />

      <div className="mt-6 text-center">
        <button className="text-xs italic text-brand-primary hover:underline">Voir plus...</button>
      </div>
    </section>
  );
}
