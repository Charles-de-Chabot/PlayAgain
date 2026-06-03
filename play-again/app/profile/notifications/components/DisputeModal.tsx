"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export interface DisputeModalProps {
  showDisputeModal: boolean;
  setShowDisputeModal: (val: boolean) => void;
  disputeReason: string;
  setDisputeReason: (val: string) => void;
  onSubmit: () => void;
}

/**
 * DisputeModal collects user reports on transaction/item issues.
 */
export default function DisputeModal({
  showDisputeModal,
  setShowDisputeModal,
  disputeReason,
  setDisputeReason,
  onSubmit,
}: DisputeModalProps) {
  if (!showDisputeModal) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative bg-zinc-950 border border-white/10 rounded-[2.2rem] w-full max-w-lg p-7 md:p-9 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col text-left">
        {/* Warning Icon */}
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        {/* Modal Titles */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Déclarer un problème</h3>
          <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
            Notre service de médiation est à votre écoute pour sécuriser votre achat. Décrivez précisément le problème
            ci-dessous. Les fonds resteront gelés en sécurité sous séquestre.
          </p>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
            Description de votre problème *
          </label>
          <textarea
            rows={4}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full bg-black/55 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-red-500/60 focus:ring-0 transition-all outline-none resize-none placeholder-zinc-700 font-medium"
            placeholder="Indiquez ici si l'article est défectueux, incomplet, non conforme à la description..."
          />
        </div>

        {/* Form controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowDisputeModal(false)}
            className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!disputeReason.trim()}
            className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Confirmer le litige</span>
          </button>
        </div>
      </div>
    </div>
  );
}
