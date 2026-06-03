"use client";

import React from "react";
import { History, User, ShieldCheck } from "lucide-react";

export interface AdminLog {
  id: number;
  adminEmail: string;
  createdAt: string;
  metadata: any;
}

export interface AuditHistoryLogProps {
  history: AdminLog[];
}

export default function AuditHistoryLog({ history }: AuditHistoryLogProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-4 text-left">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.06] pb-4 font-sans">
        <History className="w-4 h-4 text-slate-400" />
        <span>Historique d'Audit & Changements de Taux</span>
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-6 text-slate-500 font-semibold text-xs">
          Aucun changement de configuration enregistré à ce jour.
        </div>
      ) : (
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {history.map((log) => {
            const meta = log.metadata as any;
            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 bg-black/30 border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white truncate max-w-[180px] md:max-w-none">{log.adminEmail}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(log.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>

                {meta && (
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <div className="flex flex-col text-right">
                      <span className="text-[#10B981] font-bold">%{meta.commissionRate}</span>
                      <span className="text-slate-400">+{meta.flatFee}€</span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
