import Link from "next/link";
import { Zap, CheckCircle2, Star, Sparkles, Shield, ShoppingCart, Heart, Trophy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareStore, CompareProduct } from "@/store/useCompareStore";
import { useState, useEffect } from "react";
import { BookmarkSelector } from "@/components/product/BookmarkSelector";
import { getProductFavoritedStatus } from "@/app/actions/bookmark";

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
  const [showBookmarkSelector, setShowBookmarkSelector] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await getProductFavoritedStatus(Number(id));
        setIsFavorited(res.isFavorited);
      } catch (err) {
        console.error("Error fetching favorited status:", err);
      }
    }
    checkStatus();
  }, [id]);

  // Fermer le sélecteur si un autre produit ouvre son sélecteur
  useEffect(() => {
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.productId !== Number(id)) {
        setShowBookmarkSelector(false);
      }
    };
    window.addEventListener("close-other-bookmark-selectors", handleCloseOthers);
    return () => {
      window.removeEventListener("close-other-bookmark-selectors", handleCloseOthers);
    };
  }, [id]);

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

  const getCompareProductData = (): CompareProduct | null => {
    if (!fullProduct) return null;
    return {
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
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();
    const compProduct = getCompareProductData();
    if (!compProduct) return;

    if (isComparingMode) {
      if (isCompatible) {
        setProductB(compProduct);
      }
    } else {
      setProductA(compProduct);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isComparingMode && isCompatible) {
      e.preventDefault();
      e.stopPropagation();
      const compProduct = getCompareProductData();
      if (!compProduct) return;
      setProductB(compProduct);
    }
  };

  const showMatch = matchScore !== undefined && matchScore > 0;
  const level = fullProduct?.levelCategory || "INTERMEDIATE";
  
  const getLevelUI = (lvl: string) => {
    switch (lvl) {
      case "BEGINNER":
        return {
          bgColor: "bg-emerald-400 border-emerald-500/40 text-zinc-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]",
          label: "NOV"
        };
      case "INTERMEDIATE":
        return {
          bgColor: "bg-brand-accent border-brand-accent/40 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]",
          label: "INT"
        };
      case "ADVANCED":
        return {
          bgColor: "bg-amber-400 border-amber-500/40 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
          label: "CONF"
        };
      case "PRO":
        return {
          bgColor: "bg-cyan-400 border-cyan-500/40 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
          label: "PRO"
        };
      default:
        return {
          bgColor: "bg-brand-accent border-brand-accent/40 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]",
          label: "INT"
        };
    }
  };

  const levelUI = getLevelUI(level);

  return (
    <Link 
      href={`/product/${id}`}
      onClick={handleCardClick}
      className={cn(
        "group flex flex-col rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 w-full max-w-[160px] md:max-w-[240px] h-[320px] md:h-[420px] cursor-pointer relative overflow-visible shrink-0",
        dimCard ? "opacity-30 grayscale pointer-events-none" : "hover:-translate-y-3 hover:bg-white/15 hover:border-transparent hover:shadow-[0_0_30px_rgba(125,56,255,0.25),0_0_20px_rgba(163,230,53,0.2)]",
        highlightCard && "ring-2 ring-[#5ce1e6] ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(92,225,230,0.4)]",
        isSelectedA && "ring-2 ring-brand-primary opacity-80",
        showBookmarkSelector ? "z-50" : "hover:z-10",
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

        {/* Badge Vendeur Certifié (Glass) */}
        {fullProduct?.user?.is_certified && (
          <div 
            className="absolute left-3 bottom-3 z-30 bg-zinc-950/60 backdrop-blur-md px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider border border-brand-accent/30 text-brand-accent shadow-[0_0_15px_rgba(163,230,53,0.15)] flex items-center gap-1 cursor-help"
            title="Vendeur Certifié Play Again"
          >
            <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-brand-accent" />
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

        {/* Sold Overlay/Badge */}
        {fullProduct?.is_sold && (
          <div className="absolute inset-0 bg-black/60 z-20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
            <span className="bg-red-500/90 text-white font-black text-[10px] md:text-xs uppercase tracking-widest px-4 py-1.5 rounded-full border border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              Vendu
            </span>
          </div>
        )}

        {/* Bouton Favoris Flottant en négatif/rouge (sans cercle, mix-blend-difference si vide) */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowBookmarkSelector(!showBookmarkSelector);
          }}
          className={cn(
            "absolute right-3.5 bottom-3.5 z-30 transition-all hover:scale-120 active:scale-90 cursor-pointer",
            isFavorited 
              ? "text-red-500 hover:text-red-600 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" 
              : "text-white mix-blend-difference"
          )}
          title="Ajouter aux favoris"
        >
          <Heart className={cn("w-5 h-5 md:w-6 md:h-6", isFavorited && "fill-current")} />
        </button>
      </div>

      {showBookmarkSelector && (
        <BookmarkSelector
          productId={Number(id)}
          onClose={() => setShowBookmarkSelector(false)}
          onStatusChange={(fav) => setIsFavorited(fav)}
        />
      )}

      {/* 2. MATCH OR LEVEL BADGE DYNAMIQUE (Point -> Badge complet) */}
      <div className="absolute top-[150px] md:top-[225px] right-6 z-30">
        {showMatch ? (
          <div className={cn(
            "flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-2xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden",
            // État de base (Point)
            "w-3 h-3 group-hover:w-10 group-hover:h-10 md:group-hover:w-11 md:group-hover:h-11",
            matchScore! >= 90 ? "bg-cyan-400 border-cyan-500/40 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]" :
            matchScore! >= 70 ? "bg-brand-accent border-brand-accent/40 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]" :
            matchScore! >= 50 ? "bg-amber-400 border-amber-500/40 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]" :
            "bg-white border-white/40 text-zinc-950"
          )}>
            {/* Contenu Match (Affiché seulement au hover) */}
            <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Zap className={cn("w-3 h-3 md:w-4 md:h-4 fill-current mb-0.5", matchScore! >= 70 && "animate-pulse")} />
              <span className="text-[10px] md:text-[11px] font-black italic leading-none">{matchScore}%</span>
            </div>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-2xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden",
            // État de base (Point)
            "w-3 h-3 group-hover:w-10 group-hover:h-10 md:group-hover:w-11 md:group-hover:h-11",
            levelUI.bgColor
          )}>
            {/* Contenu Level (Affiché seulement au hover) */}
            <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <span className="text-[9px] md:text-[10px] font-black italic leading-none">{levelUI.label}</span>
            </div>
          </div>
        )}
      </div>

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

          {/* Bouton action (Comparer) */}
          <div className="flex opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            {/* Bouton Comparer */}
            {fullProduct && !isSelectedA && (
              <button 
                onClick={handleCompareClick}
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all flex items-center justify-center shrink-0 text-sm md:text-base",
                  highlightCard && "bg-[#5ce1e6]/25 border-[#5ce1e6]/45 text-[#5ce1e6] shadow-[0_0_15px_rgba(92,225,230,0.35)]"
                )}
                title={highlightCard ? "Comparer avec ce produit" : "Comparer"}
              >
                <span>⚖️</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brillance de bordure au hover (Violet & Vert) */}
      <div 
        className="absolute inset-0 rounded-[32px] p-px bg-linear-to-br from-brand-primary to-brand-accent opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" 
        style={{ 
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", 
          maskComposite: "exclude", 
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", 
          WebkitMaskComposite: "xor" 
        }} 
      />
    </Link>
  );
}
