"use client";

import React from "react";
import { Package, Check, Loader2 } from "lucide-react";

export interface ShipTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipTrackingInput: string;
  setShipTrackingInput: (tracking: string) => void;
  onSubmit: () => void;
  isShippingLoading: boolean;
}

/**
 * ShipTrackingModal component enables sellers to submit logistics tracking numbers for shipped items.
 */
export function ShipTrackingModal({
  isOpen,
  onClose,
  shipTrackingInput,
  setShipTrackingInput,
  onSubmit,
  isShippingLoading,
}: ShipTrackingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-9999 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative bg-zinc-950 border border-white/10 rounded-[2.2rem] w-full max-w-md p-7 md:p-9 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col text-left">
        
        {/* Icône d'expédition */}
        <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl flex items-center justify-center text-brand-primary">
          <Package className="w-6 h-6 text-brand-primary" />
        </div>

        {/* Titres */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Confirmer l'expédition</h3>
          <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
            Veuillez saisir ci-dessous le numéro de suivi du colis généré par le transporteur (Mondial Relay, Colissimo, etc.) afin que l'acheteur puisse suivre sa livraison.
          </p>
        </div>

        {/* Formulaire tracking number */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
            Numéro de suivi du colis *
          </label>
          <input
            type="text"
            value={shipTrackingInput}
            onChange={(e) => setShipTrackingInput(e.target.value)}
            className="w-full bg-black/55 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-brand-primary/60 focus:ring-0 transition-all outline-none font-mono font-bold tracking-wider placeholder-zinc-700"
            placeholder="Ex: MR-1234567A ou CC-9876543FR"
            autoFocus
          />
        </div>

        {/* Boutons d'actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Annuler
          </button>
          
          <button
            type="button"
            onClick={onSubmit}
            disabled={!shipTrackingInput.trim() || isShippingLoading}
            className="px-5 py-3 rounded-xl bg-brand-primary hover:brightness-110 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-brand-primary/20 cursor-pointer"
          >
            {isShippingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Check className="w-4 h-4 text-white" />
            )}
            <span>Valider l'envoi</span>
          </button>
        </div>

      </div>
    </div>
  );
}
