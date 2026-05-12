import { ProductCard } from "@/components/home/ProductCard";

export function ProductGrid() {
  return (
    <section className="px-6 py-8">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
          Articles <span className="text-brand-primary">Populaires</span>
        </h2>
        <div className="h-1 flex-1 ml-6 bg-zinc-100 hidden md:block"></div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
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
