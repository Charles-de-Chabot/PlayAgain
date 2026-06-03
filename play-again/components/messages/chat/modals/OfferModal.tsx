"use client";

import React from "react";

export interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerAmount: string;
  setOfferAmount: (amount: string) => void;
  onSendOffer: () => void;
  isSending: boolean;
}

/**
 * OfferModal component lets buyers submit a custom purchase offer to sellers.
 */
export function OfferModal({
  isOpen,
  onClose,
  offerAmount,
  setOfferAmount,
  onSendOffer,
  isSending,
}: OfferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-brand-black/90 backdrop-blur-lg p-5 shadow-2xl animate-fade-in-up">
        <h3 className="text-base font-black text-white mb-2">Faire une offre de prix</h3>
        <p className="text-xs text-white/50 mb-4">
          Proposez un prix d'achat au vendeur. S'il l'accepte, vous pourrez commander l'article directement à ce tarif.
        </p>

        <div className="relative mb-4">
          <span className="absolute left-3 top-2 text-sm text-white/50 font-bold">€</span>
          <input
            type="number"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            placeholder="Montant de votre offre"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-7 pr-4 text-sm text-white focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSendOffer}
            disabled={!offerAmount || isSending}
            className="flex-1 bg-brand-accent text-brand-black font-bold text-xs py-2.5 rounded-xl hover:bg-brand-accent/80 transition-colors disabled:opacity-50"
          >
            Envoyer l'offre
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white py-2.5 rounded-xl transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
