"use client";

import React from "react";
import { Truck, Clock, AlertTriangle, Package } from "lucide-react";
import { ShippingItem } from "@/hooks/useShipping";

export interface ShippingKPIsProps {
  shippings: ShippingItem[];
}

/**
 * ShippingKPIs renders a dashboard summary of critical shipment statistics,
 * calculating metrics dynamically from the shippings data.
 */
export default function ShippingKPIs({ shippings }: ShippingKPIsProps) {
  const totalShippings = shippings.length;
  const lateDeposits = shippings.filter((s) => s.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED").length;
  const blockedPackages = shippings.filter(
    (s) => s.carrierStatus === "BLOCKED_IN_HUB" || s.carrierStatus === "LOST"
  ).length;

  const mrPackages = shippings.filter((s) => s.carrierCode === "MR").length;
  const ccPackages = shippings.filter((s) => s.carrierCode === "CC").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* KPI 1 : Total */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.05)] text-left">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">En transit actif</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-black text-white">{totalShippings}</span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">Colis suivis en temps réel</span>
        </div>
      </div>

      {/* KPI 2 : Retards dépôt */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_25px_rgba(245,158,11,0.05)] text-left">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retards de Dépôt</span>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-black text-amber-400">{lateDeposits}</span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">Non déposés vendeur &gt; 5j</span>
        </div>
      </div>

      {/* KPI 3 : Bloqués ou perdus */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.08)] text-left">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Colis Bloqués / Perdus</span>
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-black text-red-400">{blockedPackages}</span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">Bloqués en hub routier &gt; 7j</span>
        </div>
      </div>

      {/* KPI 4 : Répartition */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,91,255,0.05)] text-left">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transporteurs</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-white">{mrPackages}</span>
            <span className="text-[9px] font-black text-pink-400 block tracking-wider">Mondial Relay</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-2xl font-black text-white">{ccPackages}</span>
            <span className="text-[9px] font-black text-amber-300 block tracking-wider">Colissimo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
