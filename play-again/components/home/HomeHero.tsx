import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import Link from "next/link";

interface HomeHeroProps {
  isAuthenticated: boolean;
}

export function HomeHero({ isAuthenticated }: HomeHeroProps) {
  return (
    <section className="bg-black px-6 pb-12 pt-8 text-white">
      {!isAuthenticated && (
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-800">
            {/* Placeholder avatar */}
            <div className="flex h-full w-full items-center justify-center bg-brand-primary/20 text-brand-primary">
              <span className="text-xs">User</span>
            </div>
          </div>
          <div>
            <div className="flex gap-1 text-sm italic text-brand-primary">
              <Link href="/login" className="hover:underline">Se connecter</Link>
              <span>/</span>
              <Link href="/register" className="hover:underline">s'inscrire</Link>
            </div>
          </div>
        </div>
      )}

      <SearchBar className="mb-8" />
      
      <CategoryGrid />

      <div className="mt-6 text-center">
        <button className="text-xs italic text-brand-primary hover:underline">Voir plus...</button>
      </div>
    </section>
  );
}
