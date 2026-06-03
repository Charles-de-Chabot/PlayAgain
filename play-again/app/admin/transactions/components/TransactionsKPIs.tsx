"use client";

import React from "react";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { KPIs } from "@/hooks/useTransactions";

export interface TransactionsKPIsProps {
  kpis: KPIs;
}

/**
 * TransactionsKPIs displays financial indicators and mediation statistics.
 */
export default function TransactionsKPIs({ kpis }: TransactionsKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Sous Séquestre */}
      <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-primary/10 blur-xl group-hover:bg-brand-primary/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">
            Sous Séquestre
          </span>
          <div className="p-2 rounded-xl bg-white/5 text-brand-primary border border-white/5">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-white">
            {kpis.totalEscrowVolume.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Fonds gelés en cours d'expédition/litige</p>
        </div>
      </div>

      {/* KPI 2: Commissions PlayAgain */}
      <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-accent/10 blur-xl group-hover:bg-brand-accent/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">
            Commissions PlayAgain
          </span>
          <div className="p-2 rounded-xl bg-white/5 text-brand-accent border border-white/5">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-brand-accent">
            {kpis.totalCommissions.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Gains nets perçus par la plateforme</p>
        </div>
      </div>

      {/* KPI 3: Litiges Actifs */}
      <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-red-500/10 blur-xl group-hover:bg-red-500/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">
            Litiges Actifs
          </span>
          <div
            className={`p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 ${
              kpis.openDisputes > 0 ? "animate-pulse" : ""
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-red-500">{kpis.openDisputes}</div>
          <p className="text-[10px] text-slate-500 mt-1">Dossiers de réclamation ouverts</p>
        </div>
      </div>

      {/* KPI 4: Taux de Résolution */}
      <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">
            Taux de Résolution
          </span>
          <div className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-white/5">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-emerald-400">{kpis.resolutionRate} %</div>
          <p className="text-[10px] text-slate-500 mt-1">Pourcentage de litiges réglés</p>
        </div>
      </div>
    </div>
  );
}
