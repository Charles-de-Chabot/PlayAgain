"use client";

import React from "react";
import { ShieldAlert, Users, CheckCircle2, AlertCircle, Lock, HelpCircle } from "lucide-react";

export interface MassBlockPanelProps {
  selectedCount: number;
  blockReason: string;
  setBlockReason: (val: string) => void;
  blockMessage: { success: boolean; text: string } | null;
  isBlocking: boolean;
  onMassBlock: () => Promise<void>;
}

export default function MassBlockPanel({
  selectedCount,
  blockReason,
  setBlockReason,
  blockMessage,
  isBlocking,
  onMassBlock,
}: MassBlockPanelProps) {
  return (
    <div className="bg-[#0E1322] border border-white/[0.06] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 sticky top-8 text-left">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 relative z-10">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        <h3 className="text-sm font-black uppercase tracking-wider text-white">Centre de Neutralisation</h3>
      </div>

      {/* Résumé de sélection */}
      <div className="bg-black/40 border border-white/[0.04] p-4 rounded-2xl relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Comptes sélectionnés :</span>
        </div>
        <span className="text-sm font-black text-red-400 bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20">
          {selectedCount}
        </span>
      </div>

      {/* Formulaire de Mass-Block */}
      <div className="flex flex-col gap-4 relative z-10">
        <label className="text-xs font-bold text-slate-400">Raison ou motif officiel de suspension :</label>
        <textarea
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="ex: Réseau multi-comptes frauduleux identifié pour tentative de manipulation ou contournement de KYC..."
          className="w-full h-24 bg-black/60 border border-white/[0.08] text-white rounded-xl p-3 text-xs placeholder:text-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all resize-none font-sans"
        />

        {blockMessage && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
              blockMessage.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {blockMessage.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-semibold">{blockMessage.text}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onMassBlock}
          disabled={selectedCount === 0 || isBlocking}
          className={`w-full py-3.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 border cursor-pointer ${
            selectedCount === 0 || isBlocking
              ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 border-red-400/20 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.35)] active:scale-98"
          }`}
        >
          <Lock className="w-4 h-4" />
          {isBlocking ? "Blocage en cours..." : "Suspendre la sélection"}
        </button>
      </div>

      {/* Instructions de sécurité */}
      <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative z-10 text-[10px] text-slate-500 leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Rappel d'action administrative :
        </div>
        <p>
          Cette action effectuera un **Soft-Delete** de chaque compte et suspendra immédiatement toutes leurs annonces
          actives en cours pour éviter de corrompre l'historique des transactions passées.
        </p>
        <p>
          Chaque de désactivation administrative sera journalisée de manière permanente dans la table d'audit{" "}
          `AdminLog` sous votre signature.
        </p>
      </div>
    </div>
  );
}
