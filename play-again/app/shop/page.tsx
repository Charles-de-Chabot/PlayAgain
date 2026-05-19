import { Header } from "@/components/layout/Header";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getCategories } from "@/app/actions/category";
import { getBrands, getFilteredProducts } from "@/app/actions/product";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  // Récupération initiale des données côté serveur pour un chargement rapide
  const [categories, brands, initialProducts] = await Promise.all([
    getCategories(),
    getBrands(),
    getFilteredProducts({}), // Récupère tous les produits actifs par défaut triés par récents
  ]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
      {/* Background Decor - Cohérence de la charte graphique PlayAgain */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[80px] md:pt-[96px] pb-16">
        <Header />
        
        {/* Composant catalogue avec filtres dynamiques */}
        <ShopCatalog 
          initialProducts={initialProducts}
          categories={categories}
          brands={brands}
        />
      </div>
    </main>
  );
}
