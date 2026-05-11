import { ProductCard } from "@/components/home/ProductCard";

export function ProductGrid() {
  return (
    <section className="px-6 py-8">
      <h2 className="mb-6 text-xl font-bold uppercase">Articles Populaires</h2>
      
      <div className="flex flex-wrap justify-center gap-6">
        {/* On peut mapper sur des données réelles plus tard */}
        <ProductCard 
          title="LUNETTE DE SKI"
          price={50}
          condition="Très bon état"
          category="SKI"
        />
        <ProductCard 
          title="GUETRES"
          price={30}
          condition="Bon état"
          category="EQUITATION"
        />
      </div>

      <div className="mt-8 text-center">
        <button className="text-sm font-bold hover:underline">Voir +</button>
      </div>
    </section>
  );
}
