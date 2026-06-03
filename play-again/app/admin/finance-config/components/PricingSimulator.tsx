"use client";

import React, { useState } from "react";
import { Sparkles, Coins, TrendingUp, ArrowUpRight } from "lucide-react";

export interface PricingSimulatorProps {
  commissionRate: number;
  flatFee: number;
}

export default function PricingSimulator({ commissionRate, flatFee }: PricingSimulatorProps) {
  const [simulatorPrice, setSimulatorPrice] = useState<number>(100);
  const [simulatorShipping, setSimulatorShipping] = useState<boolean>(true);

  // --- CALCULS DU SIMULATEUR ---
  const priceInCents = Math.round(simulatorPrice * 100);
  // Formule : Frais fixe + commissionRate%
  const commissionInCents = Math.round(flatFee * 100 + priceInCents * (commissionRate / 100));
  const commissionVal = commissionInCents / 100;

  // Livraison : 4.99€ standard, offerte si article > 100€
  const shippingFeeVal = simulatorShipping ? (simulatorPrice > 100 ? 0 : 4.99) : 0;

  const totalPaidVal = simulatorPrice + commissionVal + shippingFeeVal;

  return (
    <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6 text-left">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-4 right-4 w-40 h-40 bg-[#10B981]/5 rounded-full filter blur-2xl -z-10" />

      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Simulateur de Tarification (Impact Réel)</span>
        </h3>

        {/* Mode Expédition Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold text-slate-500">Expédition</span>
          <button
            type="button"
            onClick={() => setSimulatorShipping(!simulatorShipping)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              simulatorShipping ? "bg-[#10B981]" : "bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                simulatorShipping ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Split details layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Buyer pays */}
        <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">
              L'Acheteur paie
            </span>
            <h4 className="text-2xl font-black text-white font-mono mt-1 pt-1.5 pb-1.5">
              {totalPaidVal.toFixed(2)} €
            </h4>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-400 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Article :</span>
              <span className="font-bold text-white">{simulatorPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Port ({simulatorShipping ? "Colis" : "Main propre"}) :</span>
              <span className="font-bold text-slate-300">
                {shippingFeeVal === 0 ? "Offert" : `${shippingFeeVal.toFixed(2)} €`}
              </span>
            </div>
          </div>
        </div>

        {/* Platform revenue */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Coins className="w-12 h-12 text-[#10B981]" />
          </div>
          <div>
            <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
              PlayAgain Perçoit
            </span>
            <h4 className="text-2xl font-extrabold font-mono mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#10B981] drop-shadow-[0_0_15px_rgba(16,185,129,0.1)] pt-1.5 pb-1.5">
              {commissionVal.toFixed(2)} €
            </h4>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/10 text-[10px] text-emerald-400/80 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Frais fixes ({flatFee.toFixed(2)}€) :</span>
              <span className="font-bold text-white">{flatFee.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Taux variable ({commissionRate}%) :</span>
              <span className="font-bold text-white">{((simulatorPrice * commissionRate) / 100).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Seller net input */}
        <div className="bg-white/[0.01] border border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div>
            <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-1">
              Prix de l'Article (Vendeur Net)
            </span>
            <div className="flex items-center gap-2 bg-black/40 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-400 focus-within:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all mt-1">
              <input
                type="number"
                min="1"
                max="10000"
                value={simulatorPrice || ""}
                onChange={(e) => setSimulatorPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="bg-transparent w-full text-right text-base font-mono font-black text-cyan-300 focus:outline-none"
                placeholder="0"
              />
              <span className="text-cyan-400 font-black text-sm font-mono shrink-0">€</span>
            </div>
            <span className="text-[8px] text-slate-500 font-bold block mt-1.5 text-right animate-pulse">
              * Saisissez le prix d'essai ici ✎
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-400 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Net perçu :</span>
              <span className="font-bold text-white">{simulatorPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-cyan-400/80">
              <span>Stripe Connect :</span>
              <span className="font-bold">Automatique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator comments */}
      <div className="bg-white/[0.01] border border-white/[0.03] p-4.5 rounded-2xl text-[11px] text-slate-400 space-y-2.5">
        <span className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          Performance commerciale et équilibre
        </span>
        <p className="leading-relaxed">
          Sur un panier moyen d'équipement de seconde main de{" "}
          <span className="text-white font-bold">{simulatorPrice} €</span>, le taux d'apport de revenus de la commission
          s'élève à{" "}
          <span className="text-emerald-400 font-bold">
            {simulatorPrice > 0 ? ((commissionVal / simulatorPrice) * 100).toFixed(1) : "0.0"}%
          </span>{" "}
          du prix de vente. Cette marge permet d'assurer la solvabilité de l'assurance Escrow de Stripe tout en restant
          très compétitive face aux concurrents généralistes (ex: Vinted, Leboncoin).
        </p>
      </div>
    </div>
  );
}
