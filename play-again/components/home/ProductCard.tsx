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
    <div className="group flex flex-col overflow-hidden rounded-sm border border-brand-accent w-[149px] h-[241px] md:w-[269px] md:h-[434px]">
      <div className="relative -ml-px -mt-px w-[calc(100%+2px)] h-[138px] md:h-[248px] bg-gray-100 z-10">
        <div className="absolute right-2 top-2 z-20 bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase">
          {category}
        </div>
        {/* Placeholder pour l'image */}
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
          Image
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-3">
          <h3 className="text-[11px] font-normal uppercase leading-tight">{title}</h3>
          <p className="mt-1 text-sm font-bold">{price}€</p>
          <div className="mt-2 w-fit rounded-sm bg-brand-accent px-2 py-0.5 text-[9px] font-bold italic">
            {condition}
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          className="h-[21px] w-full rounded-none border-t border-brand-accent text-[10px] font-semibold uppercase"
        >
          VOIR
        </Button>
      </div>
    </div>
  );
}
