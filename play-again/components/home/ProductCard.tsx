import Link from "next/link";
import { Zap } from "lucide-react";

interface ProductCardProps {
  id: number | string;
  title: string;
  price: number;
  condition: string;
  category: string;
  image?: string;
  matchScore?: number;
}

export function ProductCard({ id, title, price, condition, category, image, matchScore }: ProductCardProps) {
  const getStateStyles = (state: string) => {
    const baseClass = "px-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border italic";
    switch (state) {
      case "NEUF":
        return `${baseClass} bg-cyan-400 text-black border-cyan-400`;
      case "EXCELLENT":
        return `${baseClass} bg-brand-accent text-black border-brand-accent`;
      case "BON":
        return `${baseClass} bg-yellow-300 text-black border-yellow-300`;
      case "SATISFAISANT":
        return `${baseClass} bg-orange-500 text-white border-orange-500`;
      default:
        return `${baseClass} bg-gray-200 text-gray-600 border-gray-200`;
    }
  };

  const getMatchButtonStyles = () => {
    if (!matchScore) return "text-zinc-400 border-zinc-200";
    if (matchScore >= 90) return "text-rose-500 bg-rose-500/5 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
    if (matchScore >= 70) return "text-amber-500 bg-amber-500/5 border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]";
    return "text-zinc-500 bg-zinc-500/5 border-zinc-500/40";
  };

  return (
    <Link 
      href={`/product/${id}`}
      className="group flex flex-col rounded-none bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:border-brand-primary hover:shadow-[8px_8px_0px_rgba(109,40,217,0.1)] w-full max-w-[160px] md:max-w-[220px] h-[260px] md:h-[360px] cursor-pointer relative"
    >
      {/* Badge de catégorie - VIOLET BRAND - Aligné par défaut, dépasse au hover */}
      <div className="absolute right-0 top-1 z-30 bg-brand-primary px-3 py-1 text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-lg transition-transform duration-300 group-hover:translate-x-3">
        {category}
      </div>

      {/* Container Image */}
      <div className="relative w-full h-[130px] md:h-[200px] bg-gray-50 overflow-hidden border-b border-gray-100">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-[10px] uppercase font-bold tracking-widest italic">No Image</span>
          </div>
        )}
      </div>

      {/* Infos Produit */}
      <div className="flex flex-col flex-1 p-3 md:p-4 bg-white relative z-20">
        <h3 className="text-[11px] md:text-[13px] font-black text-gray-900 uppercase tracking-tight line-clamp-1 group-hover:text-brand-primary transition-colors duration-300 mb-1">
          {title}
        </h3>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-[16px] md:text-2xl font-black text-brand-primary">{price}€</span>
        </div>
        
        <div className="mb-4">
          <span className={getStateStyles(condition)}>
            {condition.replace('_', ' ')}
          </span>
        </div>

        {/* Bouton dynamique Match / Voir le produit - Style Cyber/Sport */}
        <div className="mt-auto">
          <div className="w-full h-10 md:h-12 relative overflow-hidden transition-all duration-300 border-2 border-gray-900 group-hover:border-brand-accent">
            
            {/* Texte Match IA */}
            <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 font-black italic ${matchScore !== undefined ? 'group-hover:translate-x-full opacity-100 group-hover:opacity-0' : 'hidden'} ${getMatchButtonStyles()}`}>
              <Zap className={`w-4 h-4 fill-current ${matchScore && matchScore >= 70 ? "animate-pulse" : ""}`} />
              <span className="text-[10px] md:text-[12px] tracking-[0.1em]">MATCH : {matchScore}%</span>
            </div>

            {/* Texte Voir le produit */}
            <div className={`flex items-center justify-center w-full h-full ${matchScore !== undefined ? '-translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100' : ''} transition-all duration-500 bg-brand-accent text-black font-black text-[10px] md:text-[12px] uppercase tracking-[0.2em]`}>
              VOIR LE PRODUIT
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
