"use client";

import React from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

export interface ArbitrageConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER" | null;
  invoiceId: number;
  totalPrice: number;
  usernameSeller: string;
  usernameBuyer: string;
  explanationMessage: string;
  setExplanationMessage: (msg: string) => void;
  actionLoading: boolean;
  onSubmit: () => void;
}

/**
 * ArbitrageConfirmModal renders double validation for administrative refunds or releases.
 */
export default function ArbitrageConfirmModal({
  isOpen,
  onClose,
  action,
  invoiceId,
  totalPrice,
  usernameSeller,
  usernameBuyer,
  explanationMessage,
  setExplanationMessage,
  actionLoading,
  onSubmit,
}: ArbitrageConfirmModalProps) {
  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn">
      {/* Background overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal box */}
      <div className="w-full max-w-sm bg-[#0C101B] border border-white/[0.08] rounded-3xl p-6 text-center shadow-2xl relative z-10 animate-scale-in">
        <div
          className={`inline-flex p-3 rounded-2xl mb-4 border ${
            action === "RELEASE_TO_SELLER"
              ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-md font-black text-white tracking-tight uppercase">
          {action === "RELEASE_TO_SELLER" ? "Confirmer le Virement" : "Confirmer le Remboursement"}
        </h3>

        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          {action === "RELEASE_TO_SELLER"
            ? `Êtes-vous certain de vouloir verser les fonds de la commande #${invoiceId} (${totalPrice} €) au vendeur ${usernameSeller} ? Cette action est irréversible.`
            : `Êtes-vous certain de vouloir rembourser intégralement l'acheteur ${usernameBuyer} d'un montant de ${totalPrice} € ? Cette action est irréversible.`}
        </p>

        {/* Message d'explication */}
        <div className="mt-4 text-left">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
            Message d'explication (optionnel) :
          </label>
          <textarea
            value={explanationMessage}
            onChange={(e) => setExplanationMessage(e.target.value)}
            placeholder="Ex: Le colis a été livré complet / L'acheteur a retourné un produit défectueux..."
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent resize-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="w-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all text-xs cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={actionLoading}
            className={`w-full font-black text-xs py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              action === "RELEASE_TO_SELLER"
                ? "bg-brand-accent text-black hover:bg-brand-accent/90"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
          >
            {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {action === "RELEASE_TO_SELLER" ? "Valider" : "Rembourser"}
          </button>
        </div>
      </div>
    </div>
  );
}
