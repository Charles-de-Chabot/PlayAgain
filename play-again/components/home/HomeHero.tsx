"use client";

import { UserRound } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function HomeHero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-black px-6 pb-12 pt-8 text-white overflow-hidden">
      {!isAuthenticated && (
        <>
          {/* Icône en filigrane (Watermark) - Sortie de la div pour ignorer le padding */}
          <div className="absolute -left-6 -top-6 text-brand-primary opacity-18 pointer-events-none xl:hidden">
            <UserRound className="h-40 w-40" strokeWidth={1.5} />
          </div>

          <div className="relative mb-12 flex h-20 items-end xl:hidden">
            <div className="relative z-10 ml-8 flex gap-1 text-sm italic text-brand-primary">
              <Link href="/auth/login" className="hover:underline">Se connecter</Link>
              <span>/</span>
              <Link href="/auth/register" className="hover:underline">s'inscrire</Link>
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
