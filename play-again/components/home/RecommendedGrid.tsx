"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { getRecommendedProducts } from "@/app/actions/product";
import { getSportProfile } from "@/app/actions/sport-profile";
import { useAuth } from "@/hooks/useAuth";
import { useVisibleCardsCount } from "@/hooks/useVisibleCardsCount";
import { Sparkles, ArrowRight, UserCircle2 } from "lucide-react";
import Link from "next/link";

export function RecommendedGrid() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const visibleCount = useVisibleCardsCount();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadRecommendationsAndProfile() {
      try {
        const profile = await getSportProfile();
        setHasProfile(!!profile);

        if (profile) {
          const data = await getRecommendedProducts();
          // Trie par score de matching décroissant (les plus compatibles en premier)
          const sorted = data.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
          setProducts(sorted);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des recommandations:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendationsAndProfile();
  }, [isAuthenticated, authLoading]);

  return (
    <section className="px-6 py-8">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
          Articles <span className="text-brand-accent">Pour Vous</span>
        </h2>
        <div className="h-1 flex-1 ml-6 bg-zinc-100 hidden md:block"></div>
      </div>

      {loading || authLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !isAuthenticated ? (
        /* Bannière Glassmorphic pour les visiteurs invités */
        <div className="relative w-full max-w-5xl mx-auto rounded-[32px] overflow-hidden bg-linear-to-br from-zinc-900/60 to-zinc-950/80 border border-white/10 p-8 md:p-12 text-center shadow-2xl flex flex-col items-center justify-center">
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-brand-primary blur-[80px] opacity-10 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-brand-accent blur-[80px] opacity-10 pointer-events-none" />
          
          <UserCircle2 className="w-12 h-12 text-brand-primary mb-4 animate-pulse" />
          <h3 className="text-lg md:text-xl font-black uppercase italic tracking-wider mb-2">Des recommandations sur-mesure</h3>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Connectez-vous et complétez votre profil sportif pour obtenir une sélection d'équipements parfaitement adaptée à votre morphologie et niveau de pratique.
          </p>
          <Link 
            href="/auth/login"
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white font-black uppercase italic tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] transition-all rounded-full cursor-pointer"
          >
            Se Connecter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : !hasProfile ? (
        /* Bannière Glassmorphic invitant à créer le Sportif ID */
        <div className="relative w-full max-w-5xl mx-auto rounded-[32px] overflow-hidden bg-linear-to-br from-zinc-900/60 to-zinc-950/80 border border-white/10 p-8 md:p-12 text-center shadow-2xl flex flex-col items-center justify-center">
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-brand-primary blur-[80px] opacity-15 pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-brand-accent blur-[80px] opacity-15 pointer-events-none" />
          
          <Sparkles className="w-12 h-12 text-brand-accent mb-4 animate-bounce" />
          <h3 className="text-lg md:text-xl font-black uppercase italic tracking-wider mb-2">Découvrez votre Sportif ID</h3>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Renseignez votre profil sportif pour voir instantanément votre score de compatibilité personnalisé et obtenir des suggestions d'articles ciblées.
          </p>
          <Link 
            href="/profile/sportif-id"
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-brand-primary to-brand-accent text-white font-black uppercase italic tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] transition-all rounded-full cursor-pointer"
          >
            Compléter mon Sportif ID <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8 w-full">
          {/* Grille des articles recommandés triés par pertinence */}
          <div className="flex flex-row justify-center gap-6 md:gap-8 lg:gap-10 w-full mx-auto max-w-7xl px-2 animate-fade-in">
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

          {products.length > visibleCount && (
            <div className="mt-12 text-center animate-fade-in">
              <Link 
                href="/shop?playmatch=true" 
                className="px-8 py-3 bg-zinc-900 text-white font-black uppercase italic tracking-widest text-[10px] hover:bg-brand-accent hover:text-black transition-all rounded-none cursor-pointer inline-block"
              >
                voir +
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Fallback si aucun produit correspondant aux sports */
        <div className="text-center py-12 bg-zinc-900/20 rounded-[24px] border border-white/5 max-w-xl mx-auto">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">
            nous n'avons pas encore d'articles correspondant à vos sports
          </p>
        </div>
      )}
    </section>
  );
}
