"use client";

import { useCompareStore } from "@/store/useCompareStore";
import { X, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { MatchBadge } from "@/components/home/MatchBadge";
import { cn } from "@/lib/utils";

const getLevelLabel = (level?: string | null) => {
  if (!level) return null;
  switch (level) {
    case "BEGINNER":
      return "Débutant";
    case "INTERMEDIATE":
      return "Intermédiaire";
    case "ADVANCED":
      return "Confirmé / Avancé";
    case "PRO":
      return "Pro / Expert";
    default:
      return level;
  }
};

const getLevelStyles = (level?: string | null) => {
  const base = "px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border rounded-md backdrop-blur-md italic shadow-md whitespace-nowrap";
  switch (level) {
    case "PRO":
      return `${base} bg-red-500/10 border-red-500/30 text-red-400`;
    case "ADVANCED":
      return `${base} bg-brand-primary/10 border-brand-primary/30 text-brand-primary`;
    case "INTERMEDIATE":
      return `${base} bg-[#5ce1e6]/10 border-[#5ce1e6]/30 text-[#5ce1e6]`;
    case "BEGINNER":
      return `${base} bg-zinc-500/10 border-zinc-500/30 text-zinc-400`;
    default:
      return `${base} bg-white/5 border-white/10 text-white/60`;
  }
};

export function CompareModal() {
  const { productA, productB, isComparingMode, clearComparison } = useCompareStore();

  const isOpen = productA !== null && productB !== null;
  const showBanner = isComparingMode && productA !== null && productB === null;

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !showBanner) return null;

  return (
    <>
      {/* Bannière de sélection (Mode Comparaison) */}
      {showBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 bg-[#111111]/90 backdrop-blur-xl border border-[#5ce1e6]/40 shadow-[0_0_30px_rgba(92,225,230,0.2)] rounded-full px-6 py-3 md:px-8 md:py-4 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-2 h-2 rounded-full bg-[#5ce1e6] animate-ping" />
          <p className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
            Sélectionnez un autre article similaire pour comparer avec <strong className="text-[#5ce1e6]">{productA?.title}</strong>
          </p>
          <button 
            onClick={clearComparison}
            className="ml-2 p-1.5 rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modale de comparaison */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto global-scrollbar relative shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b bg-[#111111]/95 backdrop-blur-md border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Comparaison</h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  {productA.categoryLabel} • {productA.typeLabel}
                </p>
              </div>
              <button
                onClick={clearComparison}
                className="p-2 transition-colors rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Produit A */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <Image src={productA.image} alt={productA.title} fill className="object-cover" />
                    
                    {/* Badges de compatibilité et de niveau */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
                      {productA.matchScore !== undefined && productA.matchScore !== null && productA.matchScore > 0 && (
                        <MatchBadge score={productA.matchScore} showLabel={false} className="scale-90 origin-top-left" />
                      )}
                      {productA.levelCategory && (
                        <span className={getLevelStyles(productA.levelCategory)}>
                          {getLevelLabel(productA.levelCategory)}
                        </span>
                      )}
                    </div>

                    {/* Badge Deal Score Flottant */}
                    {productA.dealScore?.score >= 75 && (
                      <span className={cn(
                        "absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-md",
                        productA.dealScore.colorClass
                      )}>
                        {productA.dealScore.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{productA.title}</h3>
                    <p className="text-xl sm:text-2xl font-black text-[#5ce1e6] mt-2">{productA.price} €</p>
                  </div>
                </div>

                {/* Produit B */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <Image src={productB.image} alt={productB.title} fill className="object-cover" />
                    
                    {/* Badges de compatibilité et de niveau */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
                      {productB.matchScore !== undefined && productB.matchScore !== null && productB.matchScore > 0 && (
                        <MatchBadge score={productB.matchScore} showLabel={false} className="scale-90 origin-top-left" />
                      )}
                      {productB.levelCategory && (
                        <span className={getLevelStyles(productB.levelCategory)}>
                          {getLevelLabel(productB.levelCategory)}
                        </span>
                      )}
                    </div>

                    {/* Badge Deal Score Flottant */}
                    {productB.dealScore?.score >= 75 && (
                      <span className={cn(
                        "absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-md",
                        productB.dealScore.colorClass
                      )}>
                        {productB.dealScore.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{productB.title}</h3>
                    <p className="text-xl sm:text-2xl font-black text-[#5ce1e6] mt-2">{productB.price} €</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 space-y-4">
                <h4 className="text-base sm:text-lg font-semibold text-white border-b border-white/10 pb-2">L'avis de PlayAgain</h4>
                <div className="p-4 rounded-xl bg-[#5ce1e6]/10 border border-[#5ce1e6]/20 flex gap-4 items-start">
                   <div className="mt-1 shrink-0">
                     <img 
                      src="/images/logoPlayAgain.png" 
                      alt="logo play again" 
                      className="h-8 md:h-10 w-auto object-contain shrink-0 brightness-110"
                      />
                   </div>
                   <div>
                      <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                        {productA.dealScore && productB.dealScore ? (
                          <>
                            {productA.dealScore.score > productB.dealScore.score ? (
                              <>
                                L'algorithme d'opportunité PlayAgain recommande <strong>{productA.title}</strong> avec un score exceptionnel de <strong>{productA.dealScore.score}/100</strong> (classé <em>{productA.dealScore.label}</em>) qui présente un meilleur rapport qualité-prix face à <strong>{productB.title}</strong> ({productB.dealScore.score}/100).
                              </>
                            ) : productB.dealScore.score > productA.dealScore.score ? (
                              <>
                                L'algorithme d'opportunité PlayAgain recommande <strong>{productB.title}</strong> avec un score exceptionnel de <strong>{productB.dealScore.score}/100</strong> (classé <em>{productB.dealScore.label}</em>) qui présente un meilleur rapport qualité-prix face à <strong>{productA.title}</strong> ({productA.dealScore.score}/100).
                              </>
                            ) : (
                              <>
                                Les deux articles présentent une opportunité d'achat équivalente (Score de <strong>{productA.dealScore.score}/100</strong>). Le modèle <strong>{productA.price <= productB.price ? productA.title : productB.title}</strong> est le moins cher, comparez bien leurs spécifications d'usage.
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            Le produit <strong>{productA.price <= productB.price ? productA.title : productB.title}</strong> offre actuellement un meilleur prix, mais vérifiez bien l'état de chaque article avant de vous décider.
                          </>
                        )}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#5ce1e6] mt-2 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Note: Cette recommandation intelligente croise l'état physique de l'objet, le positionnement de marque et les accessoires inclus.
                      </p>
                   </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 border border-white/10 rounded-xl overflow-hidden">
                {/* Rows of comparison */}
                {productA.dealScore && productB.dealScore && (
                  <ComparisonRow 
                    label="Opportunité" 
                    valA={
                      <div className="flex items-center gap-2">
                        <span className={cn("font-black text-base md:text-lg", productA.dealScore.textClass)}>{productA.dealScore.score}/100</span>
                        <span className="text-[9px] text-zinc-500 uppercase font-black">({productA.dealScore.label.replace('🔥', '').replace('✨', '')})</span>
                      </div>
                    } 
                    valB={
                      <div className="flex items-center gap-2">
                        <span className={cn("font-black text-base md:text-lg", productB.dealScore.textClass)}>{productB.dealScore.score}/100</span>
                        <span className="text-[9px] text-zinc-500 uppercase font-black">({productB.dealScore.label.replace('🔥', '').replace('✨', '')})</span>
                      </div>
                    } 
                  />
                )}
                <ComparisonRow label="État" valA={productA.condition.replace('_', ' ')} valB={productB.condition.replace('_', ' ')} />
                <ComparisonRow label="Marque" valA={productA.brand} valB={productB.brand} />
                <ComparisonRow label="Niveau requis" valA={getLevelLabel(productA.levelCategory) || "Tous niveaux"} valB={getLevelLabel(productB.levelCategory) || "Tous niveaux"} />
                {productA.matchScore !== undefined && productA.matchScore !== null && productA.matchScore > 0 && productB.matchScore !== undefined && productB.matchScore !== null && productB.matchScore > 0 && (
                  <ComparisonRow 
                    label="Compatibilité" 
                    valA={<span className="text-brand-accent font-bold">{productA.matchScore}%</span>} 
                    valB={<span className="text-brand-accent font-bold">{productB.matchScore}%</span>} 
                  />
                )}
                <ComparisonRow label="Année" valA={productA.age || "N/A"} valB={productB.age || "N/A"} />
                <ComparisonRow label="Accessoires" valA={productA.accessory_included ? "Inclus" : "Non"} valB={productB.accessory_included ? "Inclus" : "Non"} />
                <ComparisonRow label="Livraison" valA={productA.is_shipping ? "Disponible" : "Remise en main propre"} valB={productB.is_shipping ? "Disponible" : "Remise en main propre"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ComparisonRow({ label, valA, valB }: { label: string; valA: React.ReactNode; valB: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr_1fr] sm:grid-cols-[150px_1fr_1fr] border-b border-white/10 last:border-0">
      <div className="p-3 sm:p-4 bg-white/5 font-medium text-white/60 text-xs sm:text-sm flex items-center">
        {label}
      </div>
      <div className="p-3 sm:p-4 text-white text-xs sm:text-sm border-r border-white/10 flex items-center wrap-break-word">
        {valA}
      </div>
      <div className="p-3 sm:p-4 text-white text-xs sm:text-sm flex items-center wrap-break-word">
        {valB}
      </div>
    </div>
  );
}
