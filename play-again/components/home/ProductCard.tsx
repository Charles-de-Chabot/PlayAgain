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
    <div className="group overflow-hidden rounded-sm border border-brand-accent">
      <div className="relative aspect-3/4 w-full bg-gray-100">
        <div className="absolute right-2 top-2 z-10 bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase">
          {category}
        </div>
        {/* Placeholder pour l'image */}
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
          Image
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold uppercase">{title}</h3>
        <p className="mt-1 text-lg font-black">{price}€</p>
        <div className="mt-2 inline-block bg-brand-accent px-2 py-0.5 text-[10px] font-bold italic">
          {condition}
        </div>
        
        <Button variant="secondary" size="md" className="mt-4 w-full text-xs font-bold uppercase">
          VOIR
        </Button>
      </div>
    </div>
  );
}
