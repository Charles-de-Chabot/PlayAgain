import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getCategories } from "@/app/actions/category";
import { getBrands, getFilteredProducts } from "@/app/actions/catalog";
import { getSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMetadata("shop");
  return {
    title: seo?.title || "Catalogue Produits - Play Again",
    description: seo?.description || "Parcourez notre catalogue d'articles de sport de seconde main expertisés.",
    keywords: seo?.keywords,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ playmatch?: string; category?: string; q?: string; minmatch?: string }> | { playmatch?: string; category?: string; q?: string; minmatch?: string };
}) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  const playMatchActive = resolvedParams?.playmatch === "true" || resolvedParams?.playmatch === "90";
  const minMatchScore = resolvedParams?.playmatch === "90" ? 90 : (resolvedParams?.minmatch ? parseInt(resolvedParams.minmatch, 10) : undefined);
  
  // Validation de la catégorie passée en paramètre
  const categoryParam = resolvedParams?.category;
  const initialCategoryId = categoryParam ? parseInt(categoryParam, 10) : null;
  const validCategoryId = (initialCategoryId && !isNaN(initialCategoryId)) ? initialCategoryId : null;

  // Extraction de la requête de recherche passée en paramètre
  const searchQueryParam = resolvedParams?.q || null;

  // Récupération initiale des données côté serveur pour un chargement rapide
  const [categories, brands, initialProducts] = await Promise.all([
    getCategories(),
    getBrands(),
    getFilteredProducts({
      onlyRecommended: playMatchActive || undefined,
      minMatchScore: minMatchScore,
      categoryId: validCategoryId || undefined,
      searchQuery: searchQueryParam || undefined,
    }), // Pré-filtrage côté serveur si PlayMatch, une catégorie ou une recherche est active par défaut
  ]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      {/* Background Decor - Cohérence de la charte graphique PlayAgain */}
      <div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[76px] md:pt-[96px] pb-16">
        <Header />
        
        {/* Composant catalogue avec filtres dynamiques */}
        <ShopCatalog 
          initialProducts={initialProducts}
          categories={categories}
          brands={brands}
          initialPlayMatch={playMatchActive}
          initialCategory={validCategoryId}
          initialSearchQuery={searchQueryParam}
        />
      </div>
    </main>
  );
}
