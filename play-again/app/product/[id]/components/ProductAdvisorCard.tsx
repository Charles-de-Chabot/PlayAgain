import React from "react";
import Link from "next/link";
import { CircuitBoard, Info, Star, TrendingUp } from "lucide-react";
import { MatchBadge } from "@/components/home/MatchBadge";

export interface ProductAdvisorCardProps {
  product: any;
  matchData: any;
  showMatch: boolean;
  isGuest: boolean;
  session: any;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Novice",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Confirmé",
  PRO: "Pro",
};

export default function ProductAdvisorCard({
  product,
  matchData,
  showMatch,
  isGuest,
  session,
}: ProductAdvisorCardProps) {
  return (
    <div className="space-y-6 text-left">
      {/* ── Avis IA ── */}
      {matchData && (
        <div className="w-full p-3.5 md:p-4 rounded-xl bg-linear-to-br from-zinc-900/80 to-black border border-brand-primary/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <CircuitBoard className="w-10 h-10 text-brand-primary" />
          </div>

          <div className="flex items-center gap-3 relative z-10 mb-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
              <CircuitBoard className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
                  {isGuest ? "L'avis de Play Again (Général)" : "L'avis de Play Again"}
                </span>
                <div className="h-px flex-1 bg-brand-primary/20" />
              </div>
              <p className="text-[9px] font-bold text-zinc-400">
                {showMatch ? "Analyse de compatibilité sportive & budget" : "Analyse budget et opportunité d'achat"}
              </p>
            </div>
          </div>

          <div className="space-y-3 relative z-10 text-xs leading-relaxed mb-3.5">
            {showMatch && matchData.levelAdvice ? (
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-brand-accent uppercase tracking-widest">Compatibilité Technique</p>
                <p className="font-bold text-zinc-300">{matchData.levelAdvice}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-brand-accent uppercase tracking-widest">Niveau Conseillé</p>
                <p className="font-bold text-zinc-300">
                  Cet équipement est idéalement adapté à un niveau{" "}
                  <span className="text-brand-accent">
                    {LEVEL_LABELS[product.levelCategory] || "Novice"}
                  </span>.
                </p>
              </div>
            )}

            {matchData.priceAdvice && (
              <div className="space-y-1.5 border-t border-white/5 pt-2">
                <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Côté Budget</p>
                <p className="font-bold text-zinc-300">{matchData.priceAdvice}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-medium pt-0.5">
                  {product.dealScore?.priceScore >= 85 && (
                    <span className="text-emerald-400">✓ Prix particulièrement avantageux</span>
                  )}
                  {product.dealScore?.priceScore >= 70 && product.dealScore?.priceScore < 85 && (
                    <span className="text-green-400/90">✓ Prix inférieur à la moyenne</span>
                  )}
                  {product.dealScore?.priceScore >= 55 && product.dealScore?.priceScore < 70 && (
                    <span className="text-zinc-400/80">• Tarif équitable et cohérent</span>
                  )}
                  {product.dealScore?.priceScore >= 35 && product.dealScore?.priceScore < 55 && (
                    <span className="text-zinc-500">• Légèrement supérieur à la moyenne</span>
                  )}
                  {product.dealScore?.priceScore < 35 && (
                    <span className="text-red-400">⚠ Surcoût par rapport à la moyenne</span>
                  )}
                  {product.accessory_included && (
                    <span className="text-emerald-400 font-bold">+ Accessoires inclus (+10 pts)</span>
                  )}
                </div>
              </div>
            )}

            {isGuest && (
              <div className="pt-1.5">
                <Link
                  href={!session ? "/auth/login" : "/profile/sportif-id"}
                  className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-wider"
                >
                  {!session ? "Connecte-toi" : "Remplis ton Sportif ID"} pour personnaliser cet avis →
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 relative z-10">
            {showMatch ? (
              <>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-brand-accent">
                      <Star className="w-2 h-2 fill-current" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Niveau</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {LEVEL_LABELS[matchData.detectedLevel] || "Novice"}
                    </p>
                  </div>
                  <div className="shrink-0 scale-75 origin-right pr-0.5">
                    <MatchBadge score={matchData.score} showLabel={false} />
                  </div>
                </div>

                {product.dealScore ? (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <TrendingUp className="w-2 h-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
                          Deal Score
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold ${product.dealScore.glowClass || "text-zinc-400"}`}>
                        {product.dealScore.label}
                      </p>
                    </div>
                    <div className="shrink-0 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[9px] px-1.5 py-0.5 rounded-full select-none">
                      {product.dealScore.score}/100
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Info className="w-2 h-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Conseil</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {matchData.score >= 80 ? "Go ! Foncé !" : matchData.score >= 50 ? "À tester" : "Attention"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-2">
                {product.dealScore ? (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
                          Deal Score
                        </span>
                      </div>
                      <p className={`text-xs font-bold ${product.dealScore.glowClass || "text-zinc-400"}`}>
                        {product.dealScore.label}
                      </p>
                    </div>
                    <div className="shrink-0 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-xs px-2.5 py-1 rounded-full select-none">
                      {product.dealScore.score}/100
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Info className="w-2 h-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Conseil</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {matchData.score >= 80 ? "Go ! Foncé !" : matchData.score >= 50 ? "À tester" : "Attention"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Jauge Opportunity ── */}
      <div className="w-full p-3.5 md:p-4 rounded-xl bg-linear-to-br from-zinc-900/80 to-black border border-brand-accent/20 backdrop-blur-xl relative overflow-hidden group">
        <div className="flex items-start gap-4 relative z-10">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="3"
                className="text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="3"
                className="text-transparent"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 19}`}
                strokeDashoffset={`${2 * Math.PI * 19 * (1 - (product.dealScore?.score || 0) / 100)}`}
                style={{
                  stroke:
                    product.dealScore?.score >= 90
                      ? "#34D399"
                      : product.dealScore?.score >= 75
                      ? "#4ADE80"
                      : "#71717A",
                }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-[10px] font-black text-white">{product.dealScore?.score}</div>
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-brand-accent uppercase tracking-[0.2em]">
                Indice d'Opportunité (Deal Score)
              </span>
              <div className="h-px flex-1 bg-brand-accent/20" />
            </div>
            <p className={`text-xs font-bold ${product.dealScore?.glowClass || "text-white"} leading-tight`}>
              {product.dealScore?.label}
            </p>
          </div>
        </div>

        <div className="ml-14 space-y-1 relative z-10 text-[9px]">
          {product.dealScore?.priceScore >= 85 && (
            <div className="text-emerald-400 font-medium leading-none pl-1">
              ✓ Prix particulièrement avantageux pour cette gamme
            </div>
          )}
          {product.dealScore?.priceScore >= 70 && product.dealScore?.priceScore < 85 && (
            <div className="text-green-400/90 font-medium leading-none pl-1">
              ✓ Bon plan : prix inférieur à la moyenne du marché
            </div>
          )}
          {product.dealScore?.priceScore >= 55 && product.dealScore?.priceScore < 70 && (
            <div className="text-zinc-400/80 font-medium leading-none pl-1">
              • Prix équitable et cohérent avec la moyenne
            </div>
          )}
          {product.dealScore?.priceScore >= 35 && product.dealScore?.priceScore < 55 && (
            <div className="text-zinc-500 font-medium leading-none pl-1">
              • Prix légèrement supérieur à la moyenne de cette gamme
            </div>
          )}
          {product.dealScore?.priceScore < 35 && (
            <div className="text-red-400 font-medium leading-none pl-1">
              ⚠ Surcoût notable par rapport à la moyenne de cette gamme
            </div>
          )}
          {product.accessory_included && (
            <div className="flex justify-between text-emerald-400 font-bold pl-1 pt-0.5">
              <span>Bonus accessoires inclus :</span>
              <span>+10 pts</span>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 relative z-10 text-[10px] text-zinc-400">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">État du produit</span>
            <p className="font-bold text-zinc-200">{product.dealScore?.stateScore}/100</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Score du Prix</span>
            <p className="font-bold text-zinc-200">{product.dealScore?.priceScore}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
