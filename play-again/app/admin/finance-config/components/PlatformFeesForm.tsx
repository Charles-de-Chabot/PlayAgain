"use client";

import React, { useState, useEffect } from "react";
import { Coins, Percent, Info, Euro, AlertCircle, Loader2, Save } from "lucide-react";

export interface PlatformFeesFormProps {
  commissionRate: number;
  setCommissionRate: (val: number) => void;
  flatFee: number;
  setFlatFee: (val: number) => void;
  actionLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PlatformFeesForm({
  commissionRate,
  setCommissionRate,
  flatFee,
  setFlatFee,
  actionLoading,
  onSubmit,
}: PlatformFeesFormProps) {
  const [activeTooltip, setActiveTooltip] = useState<"commission" | "flatFee" | null>(null);

  // Close tooltips when clicking outside
  useEffect(() => {
    if (!activeTooltip) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".info-tooltip-container")) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [activeTooltip]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl relative text-left">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent" />

      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.06] pb-4 font-sans">
        <Coins className="w-4 h-4 text-emerald-400" />
        <span>Règles de Frais de Plateforme</span>
      </h2>

      <form onSubmit={onSubmit} className="space-y-6 text-xs">
        {/* Variable 1 : Pourcentage de commission */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative group/info info-tooltip-container">
              <label
                onClick={() => setActiveTooltip(activeTooltip === "commission" ? null : "commission")}
                className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-help hover:text-white transition-colors"
              >
                <Percent className="w-3.5 h-3.5 text-slate-500" />
                <span>Commission Variable (%)</span>
                <Info className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 transition-colors" />
              </label>

              {/* Information Commission Variable Tooltip */}
              <div
                className={`absolute left-0 bottom-full mb-2 w-64 bg-[#0E1322]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl text-[10px] text-slate-300 font-medium leading-relaxed backdrop-blur-xl z-20 transition-all duration-200 ${
                  activeTooltip === "commission"
                    ? "block opacity-100 translate-y-0"
                    : "hidden group-hover/info:block opacity-0 group-hover/info:opacity-100 group-hover/info:translate-y-0"
                }`}
              >
                <span className="font-extrabold text-white block mb-1 text-xs">Commission Variable</span>
                Prélèvement proportionnel appliqué sur le prix de l'article pour couvrir les frais de fonctionnement de
                la plateforme, le service d'intermédiation sécurisée et le support technique.
              </div>
            </div>
            <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              {commissionRate.toFixed(1)} %
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="appearance-none h-1.5 w-full bg-white/10 rounded-lg cursor-pointer accent-[#10B981] hover:accent-[#059669] transition-all"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
              <span>0% (Frais offerts)</span>
              <span>10%</span>
              <span>20% (Max)</span>
            </div>
          </div>
        </div>

        {/* Variable 2 : Frais fixes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative group/info info-tooltip-container">
              <label
                onClick={() => setActiveTooltip(activeTooltip === "flatFee" ? null : "flatFee")}
                className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-help hover:text-white transition-colors"
              >
                <Euro className="w-3.5 h-3.5 text-slate-500" />
                <span>Frais Fixes de Traitement (€)</span>
                <Info className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 transition-colors" />
              </label>

              {/* Information Frais Fixes Tooltip */}
              <div
                className={`absolute left-0 bottom-full mb-2 w-64 bg-[#0E1322]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl text-[10px] text-slate-300 font-medium leading-relaxed backdrop-blur-xl z-20 transition-all duration-200 ${
                  activeTooltip === "flatFee"
                    ? "block opacity-100 translate-y-0"
                    : "hidden group-hover/info:block opacity-0 group-hover/info:opacity-100 group-hover/info:translate-y-0"
                }`}
              >
                <span className="font-extrabold text-white block mb-1 text-xs">Frais Fixes de Traitement</span>
                Montant forfaitaire appliqué sur chaque transaction pour couvrir les frais de transaction Stripe, la
                sécurisation des fonds sous séquestre (escrow) et le coût du protocole 3D Secure.
              </div>
            </div>
            <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              {flatFee.toFixed(2)} €
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0.00"
              max="5.00"
              step="0.10"
              value={flatFee}
              onChange={(e) => setFlatFee(parseFloat(e.target.value))}
              className="appearance-none h-1.5 w-full bg-white/10 rounded-lg cursor-pointer accent-[#10B981] hover:accent-[#059669] transition-all"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
              <span>0.00 €</span>
              <span>2.50 €</span>
              <span>5.00 € (Max)</span>
            </div>
          </div>
        </div>

        {/* Warning card */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 text-amber-400/90 leading-relaxed font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-300 block mb-1">Impact sur la Production</span>
            Tout changement sera appliqué **instantanément** sur les futures factures d'achats initiées par les
            utilisateurs. Les transactions déjà finalisées ne seront pas affectées.
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-gradient-to-r from-[#10B981] to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-wider text-xs py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <>
              <Save className="w-4 h-4 text-black" />
              <span>Appliquer la configuration</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
