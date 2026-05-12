import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ProductCardProps {
  id: number | string;
  title: string;
  price: number;
  condition: string;
  category: string;
  image?: string;
}

export function ProductCard({ id, title, price, condition, category, image }: ProductCardProps) {
  const getStateStyles = (state: string) => {
    const baseClass = "bg-zinc-50 border-zinc-200 transition-all duration-500";
    switch (state) {
      case "NEUF":
        return `${baseClass} text-cyan-400 group-hover:bg-cyan-400 group-hover:text-zinc-900 group-hover:border-cyan-400`;
      case "EXCELLENT":
        return `${baseClass} text-lime-400 group-hover:bg-lime-400 group-hover:text-zinc-900 group-hover:border-lime-400`;
      case "BON":
        return `${baseClass} text-yellow-300 group-hover:bg-yellow-300 group-hover:text-zinc-900 group-hover:border-yellow-300`;
      case "SATISFAISANT":
        return `${baseClass} text-orange-400 group-hover:bg-orange-400 group-hover:text-zinc-900 group-hover:border-orange-400`;
      default:
        return `${baseClass} text-zinc-400`;
    }
  };

  return (
    <Link 
      href={`/product/${id}`}
      className="group flex flex-col rounded-none bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 w-full max-w-[160px] md:max-w-[220px] h-[260px] md:h-[360px] cursor-pointer relative"
    >
      {/* Badge de catégorie - Déplacé ici pour pouvoir dépasser sur le côté */}
      <div className="absolute right-2 top-2 z-30 bg-brand-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-none text-[10px] font-bold text-white uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-6 shadow-lg">
        {category}
      </div>

      <div className="relative -ml-px -mt-px w-[calc(100%+2px)] h-[140px] md:h-[200px] bg-gray-50 z-10 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Aucune image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="flex flex-col flex-1 p-3 md:p-4 bg-white relative z-20">
        <h3 className="text-[11px] md:text-sm font-bold text-gray-900 uppercase tracking-tight line-clamp-1 group-hover:text-brand-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[12px] md:text-lg font-black text-brand-primary mt-1">
          {price}€
        </p>
        
        <div className="mt-2 md:mt-3">
          <span className={`px-1.5 py-0.5 text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-xs italic ${getStateStyles(condition)}`}>
            {condition.replace('_', ' ')}
          </span>
        </div>

        <div className="mt-auto pt-3 md:pt-4 border-t border-gray-50">
          <div className="w-full py-2 bg-brand-accent text-black text-[9px] md:text-[11px] font-black uppercase tracking-[0.15em] text-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
            Voir le produit
          </div>
        </div>
      </div>
    </Link>
  );
}
