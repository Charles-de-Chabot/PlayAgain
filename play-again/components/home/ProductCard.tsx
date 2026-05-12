import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface ProductCardProps {
  title: string;
  price: number;
  condition: string;
  category: string;
  image?: string;
}

export function ProductCard({ title, price, condition, category }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-none bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 w-[149px] h-[241px] md:w-[269px] md:h-[434px] cursor-pointer">
      <div className="relative -ml-px -mt-px w-[calc(100%+2px)] h-[138px] md:h-[248px] bg-gray-50 z-10 overflow-hidden">
        <div className="absolute right-2 top-2 z-20 bg-brand-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-none text-[10px] font-bold text-white uppercase tracking-wider">
          {category}
        </div>
        {/* Placeholder pour l'image avec un léger effet de zoom au hover */}
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 transition-transform duration-500 group-hover:scale-110">
          Image
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-3 md:p-4">
          <h3 className="text-[11px] md:text-sm font-semibold uppercase leading-tight text-zinc-800">{title}</h3>
          <p className="mt-1 text-sm md:text-lg font-black text-brand-primary">{price}€</p>
          <div className="mt-2 w-fit rounded-none bg-brand-accent/20 border border-brand-accent/30 px-2 py-0.5 text-[9px] md:text-[10px] font-bold italic text-brand-black">
            {condition}
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="h-[26px] md:h-12 w-full rounded-none border-t border-brand-accent/50 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors group-hover:bg-brand-accent"
        >
          VOIR LE PRODUIT
        </Button>
      </div>
    </div>
  );
}
