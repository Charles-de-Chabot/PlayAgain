"use client";

import React from "react";
import { Loader2, UserX, UserCheck } from "lucide-react";

export interface KycDecisionFormProps {
  rejectionReason: string;
  setRejectionReason: (val: string) => void;
  actionLoading: boolean;
  onVerifyAction: (action: "APPROVE" | "REJECT") => void;
}

export default function KycDecisionForm({
  rejectionReason,
  setRejectionReason,
  actionLoading,
  onVerifyAction,
}: KycDecisionFormProps) {
  return (
    <div className="p-6 bg-white/[0.01] border-t border-white/[0.04] space-y-4 text-left">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Verdict Administratif</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Rejection input */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Motif de Rejet (Obligatoire en cas de refus)
          </label>
          <input
            type="text"
            placeholder="Ex: Photo trop floue, selfie incomplet..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-all font-medium"
          />
        </div>

        {/* Verdict buttons */}
        <div className="flex gap-3">
          {/* REJECT */}
          <button
            type="button"
            onClick={() => onVerifyAction("REJECT")}
            disabled={actionLoading}
            className="flex-1 bg-gradient-to-r from-red-600/10 to-rose-600/10 hover:from-red-600 hover:to-rose-600 border border-red-500/25 hover:border-transparent text-red-400 hover:text-white disabled:opacity-50 font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserX className="w-4.5 h-4.5" />
                <span>Refuser le dossier</span>
              </>
            )}
          </button>

          {/* APPROVE */}
          <button
            type="button"
            onClick={() => onVerifyAction("APPROVE")}
            disabled={actionLoading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4.5 h-4.5" />
                <span>Valider & Certifier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
