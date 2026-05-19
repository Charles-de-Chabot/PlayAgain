import Link from "next/link";
import { Zap, CheckCircle2, Star, Sparkles, Shield, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareStore, CompareProduct } from "@/store/useCompareStore";

interface ProductCardProps {
  id: number | string;
  title: string;
  price: number;
  condition: string;
  category: string;
  image?: string;
  matchScore?: number;
  className?: string;
  fullProduct?: any;
}

export function ProductCard({ id, title, price, condition, category, image, matchScore, className, fullProduct }: ProductCardProps) {
  // Icônes et couleurs pour l'état de l'objet (Minimaliste)
  const getConditionUI = (state: string) => {
    switch (state) {
      case "NEUF":
        return { color: "text-emerald-400", icon: Sparkles, label: "Neuf" };
      case "EXCELLENT":
        return { color: "text-cyan-400", icon: Star, label: "Excellent" };
      case "BON":
        return { color: "text-amber-400", icon: CheckCircle2, label: "Bon" };
      case "SATISFAISANT":
        return { color: "text-orange-400", icon: Shield, label: "Satisfaisant" };
      default:
        return { color: "text-gray-400", icon: CheckCircle2, label: state };
    }
  };

  const ui = getConditionUI(condition);

  const { isComparingMode, productA, setProductA, setProductB } = useCompareStore();

  const isCompatible = isComparingMode && productA && fullProduct && 
    productA.categoryId === fullProduct.category_id && 
    productA.typeId === fullProduct.type_id &&
    productA.id !== fullProduct.id;

  const isSelectedA = productA?.id === id;
  const dimCard = isComparingMode && !isCompatible && !isSelectedA;
  const highlightCard = isComparingMode && isCompatible;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();
    if (!fullProduct) return;
    
    const compProduct: CompareProduct = {
      id: Number(fullProduct.id),
      title: fullProduct.title,
      price: Number(fullProduct.price),
      categoryId: fullProduct.category_id,
      typeId: fullProduct.type_id,
      categoryLabel: fullProduct.category?.label || category,
      typeLabel: fullProduct.type?.label || "N/A",
      condition: fullProduct.state,
      image: image || "",
      brand: fullProduct.brand?.label || "N/A",
      age: fullProduct.age,
      accessory_included: fullProduct.accessory_included,
      is_shipping: fullProduct.is_shipping,
      matchScore: fullProduct.matchScore,
      levelCategory: fullProduct.levelCategory,
      dealScore: fullProduct.dealScore,
    };

    if (isComparingMode) {
      if (isCompatible) {
        setProductB(compProduct);
      }
    } else {
      setProductA(compProduct);
    }
  };

  return (
    <Link 
      href={`/product/${id}`}
      className={cn(
        "group flex flex-col rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 w-full max-w-[160px] md:max-w-[240px] h-[320px] md:h-[420px] cursor-pointer relative overflow-visible shrink-0",
        dimCard ? "opacity-30 grayscale pointer-events-none" : "hover:-translate-y-3 hover:bg-white/15 hover:border-white/40",
        highlightCard && "ring-2 ring-[#5ce1e6] ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(92,225,230,0.4)]",
        isSelectedA && "ring-2 ring-brand-primary opacity-80",
        className
      )}
    >
      {/* 1. IMAGE AREA */}
      <div className="relative w-full h-[140px] md:h-[220px] rounded-t-[31px] overflow-hidden">
        {/* Badge Catégorie Flottant (Glass) */}
        <div className="absolute left-3 top-3 z-30 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-white/90 uppercase tracking-widest border border-white/10 shadow-lg">
          {category}
        </div>

        {/* Deal Badge Dynamique */}
        {fullProduct?.dealScore?.score >= 75 && (
          <div className={cn(
            "absolute right-3 top-3 z-30 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg",
            fullProduct.dealScore.colorClass
          )}>
            {fullProduct.dealScore.label}
          </div>
        )}

        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
            <span className="text-[10px] uppercase font-black italic">No Visual</span>
          </div>
        )}
      </div>

      {/* 2. MATCH BADGE DYNAMIQUE (Point -> Badge complet) */}
      {matchScore !== undefined && (
        <div className="absolute top-[150px] md:top-[225px] right-6 z-50">
          <div className={cn(
            "flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-2xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden",
            // État de base (Point)
            "w-3 h-3 group-hover:w-10 group-hover:h-10 md:group-hover:w-11 md:group-hover:h-11",
            matchScore >= 90 ? "bg-cyan-400 border-cyan-500/40 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]" :
            matchScore >= 70 ? "bg-brand-accent border-brand-accent/40 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]" :
            matchScore >= 50 ? "bg-amber-400 border-amber-500/40 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]" :
            "bg-white border-white/40 text-zinc-950"
          )}>
            {/* Contenu (Affiché seulement au hover) */}
            <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Zap className={cn("w-3 h-3 md:w-4 md:h-4 fill-current mb-0.5", matchScore >= 70 && "animate-pulse")} />
              <span className="text-[10px] md:text-[11px] font-black italic leading-none">{matchScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. INFO AREA */}
      <div className="flex flex-col flex-1 p-4 md:p-6 relative">
        {/* État de l'objet (Icône discrète) */}
        <div className="flex items-center gap-1.5 mb-3">
          <ui.icon className={cn("w-3 h-3 md:w-4 md:h-4", ui.color)} />
          <span className={cn("text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70", ui.color)}>
            {ui.label}
          </span>
        </div>

        {/* Titre (Regular comme demandé) */}
        <h3 className="text-[12px] md:text-sm font-medium text-white/80 line-clamp-2 leading-relaxed mb-4 group-hover:text-white transition-colors">
          {title}
        </h3>

        {/* Prix (Gras comme demandé) */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className={cn(
              "text-xl md:text-2xl font-black tracking-tighter",
              fullProduct?.dealScore?.glowClass || "text-white"
            )}>{price}</span>
            <span className="text-[10px] md:text-xs font-bold text-white/40">€</span>
          </div>

          {/* Boutons actions (Comparer & Voir) */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            {/* Bouton Comparer */}
            {fullProduct && !isSelectedA && (
              <button 
                onClick={handleCompareClick}
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-2xl p-px transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(92,225,230,0.3)]",
                  highlightCard ? "bg-[#5ce1e6]" : "bg-white/20 hover:bg-white/40"
                )}
                title={highlightCard ? "Comparer avec ce produit" : "Comparer"}
              >
                <div className="w-full h-full rounded-[15px] bg-zinc-950 flex items-center justify-center">
                  <span className="text-sm md:text-base">⚖️</span>
                </div>
              </button>
            )}

            {/* Bouton Voir le produit */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-linear-to-br from-brand-primary to-brand-accent p-px shadow-[0_0_20px_rgba(109,40,217,0.3)] shrink-0">
              <div className="w-full h-full rounded-[15px] bg-zinc-950 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brillance de bordure au hover */}
      <div className="absolute inset-0 rounded-[32px] border border-white/0 group-hover:border-white/40 transition-colors duration-500 pointer-events-none" />
    </Link>
  );
}
