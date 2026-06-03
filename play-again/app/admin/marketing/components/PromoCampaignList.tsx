"use client";

import React from "react";
import { Loader2, Clock, Send } from "lucide-react";
import { type PromoCodeAdmin } from "../page";

export interface PromoCampaignListProps {
  coupons: PromoCodeAdmin[];
  loading: boolean;
  broadcastLoadingId: number | null;
  onBroadcastCoupon: (couponId: number) => void;
}

export default function PromoCampaignList({
  coupons,
  loading,
  broadcastLoadingId,
  onBroadcastCoupon,
}: PromoCampaignListProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 text-left">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 font-sans">
        Historique des Campagnes Promotionnelles
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Extraction des campagnes...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center p-16 text-slate-500 font-bold text-xs">
          Aucun code promotionnel enregistré pour le moment.
        </div>
      ) : (
        <div className="space-y-6">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expiresAt) < new Date();
            return (
              <div
                key={coupon.id}
                className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-all relative overflow-hidden group"
              >
                {/* CSS Retro Ticket shape */}
                <div className="relative flex items-center p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-dashed border-amber-500/30 text-amber-300 font-mono font-extrabold text-sm rounded-xl shrink-0 group-hover:scale-102 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.02)] overflow-hidden min-w-[160px] text-center justify-center">
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#080B13] border-r border-white/5 rounded-full" />
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#080B13] border-l border-white/5 rounded-full" />

                  <div className="space-y-0.5 z-10">
                    <span className="text-base font-black tracking-widest">{coupon.code}</span>
                    <span className="text-[10px] font-bold block text-amber-400/80">-{coupon.discountPercent}% RÉDUC</span>
                  </div>
                </div>

                {/* Validation terms */}
                <div className="flex-1 flex flex-col space-y-1 text-xs text-slate-300">
                  <p className="font-extrabold text-white">Conditions de validation :</p>
                  <p>
                    Panier minimum requis :{" "}
                    <span className="font-mono text-slate-100 font-extrabold">
                      {parseFloat(coupon.minBasketAmount.toString()).toFixed(2)}€
                    </span>
                  </p>

                  {/* Restrictions badges */}
                  {((coupon as any).category || (coupon as any).type) && (
                    <div className="flex flex-wrap gap-1.5 my-1">
                      {(coupon as any).category && (
                        <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Catégorie : {(coupon as any).category.label}
                        </span>
                      )}
                      {(coupon as any).type && (
                        <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          Type : {(coupon as any).type.label}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {isExpired
                        ? `Expiré le ${new Date(coupon.expiresAt).toLocaleDateString("fr-FR")}`
                        : `Valide jusqu'au ${new Date(coupon.expiresAt).toLocaleDateString("fr-FR")}`}
                    </span>
                  </div>
                </div>

                {/* Broadcast offer */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isExpired ? (
                    <div className="px-4 py-2 text-center text-red-400 bg-red-500/5 border border-red-500/15 text-[10px] font-black uppercase rounded-lg">
                      Coupon Expiré
                    </div>
                  ) : (
                    <button
                      onClick={() => onBroadcastCoupon(coupon.id)}
                      disabled={broadcastLoadingId === coupon.id}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-95 text-black text-xs font-black px-4 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 group cursor-pointer border-0"
                    >
                      {broadcastLoadingId === coupon.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          <span>Diffuser l'offre</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
