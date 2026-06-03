"use client";

import React from "react";
import { Check, AlertTriangle, Loader2 } from "lucide-react";

export interface EscrowActionsProps {
  notifId: number;
  invoiceId: number;
  processingInvoices: Record<number, "releasing" | "disputing" | "done_release" | "done_dispute" | null>;
  onReleaseFunds: (e: React.MouseEvent, notifId: number, invoiceId: number) => void;
  onDispute: (e: React.MouseEvent, notifId: number, invoiceId: number) => void;
}

/**
 * EscrowActions renders shipping delivery confirmation triggers
 * or allows raising a transaction dispute.
 */
export default function EscrowActions({
  notifId,
  invoiceId,
  processingInvoices,
  onReleaseFunds,
  onDispute,
}: EscrowActionsProps) {
  const currentStatus = processingInvoices[invoiceId];

  return (
    <div className="w-full mt-2 p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Actions requises</span>
        <p className="text-xs text-white/80 font-semibold">
          Veuillez confirmer si vous avez reçu l'équipement de sport en parfait état ou s'il y a un problème.
        </p>
      </div>

      {currentStatus === "done_release" ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-md">
          <Check className="w-4 h-4" />
          <span>Fonds libérés avec succès ! Merci de votre confiance.</span>
        </div>
      ) : currentStatus === "done_dispute" ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold shadow-md">
          <AlertTriangle className="w-4 h-4" />
          <span>Litige déclaré. Notre service client analyse votre demande.</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Release Funds Button */}
          <button
            type="button"
            onClick={(e) => onReleaseFunds(e, notifId, invoiceId)}
            disabled={currentStatus !== undefined && currentStatus !== null}
            className="px-5 py-3 rounded-xl bg-brand-accent hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-accent/10 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
          >
            {currentStatus === "releasing" ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Tout est OK</span>
              </>
            )}
          </button>

          {/* Dispute Transaction Button */}
          <button
            type="button"
            onClick={(e) => onDispute(e, notifId, invoiceId)}
            disabled={currentStatus !== undefined && currentStatus !== null}
            className="px-5 py-3 rounded-xl bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
          >
            {currentStatus === "disputing" ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Déclarer un problème</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
