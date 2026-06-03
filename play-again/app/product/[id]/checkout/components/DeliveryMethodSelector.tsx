"use client";

import React from "react";
import { Truck, Handshake, Check } from "lucide-react";

export interface Product {
  id: number;
  title: string;
  price: string | number;
  is_shipping: boolean;
}

export interface DeliveryMethodSelectorProps {
  isShipping: boolean;
  setIsShipping: (val: boolean) => void;
  product: Product;
  productPrice: number;
}

/**
 * DeliveryMethodSelector renders option buttons to toggle between
 * parcel delivery and physical meeting delivery.
 */
export default function DeliveryMethodSelector({
  isShipping,
  setIsShipping,
  product,
  productPrice,
}: DeliveryMethodSelectorProps) {
  return (
    <div className="space-y-4 text-left">
      <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">1. Mode de livraison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode Expédition */}
        <button
          type="button"
          onClick={() => setIsShipping(true)}
          disabled={!product.is_shipping}
          className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
            isShipping
              ? "bg-zinc-900/60 border-brand-primary/50 shadow-[0_0_20px_rgba(125,56,255,0.1)] opacity-100"
              : "bg-zinc-900/20 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10"
          } ${!product.is_shipping ? "cursor-not-allowed opacity-30!" : ""}`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              isShipping
                ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                : "bg-zinc-800/50 border-white/5 text-zinc-400"
            }`}
          >
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-white text-base">Expédition par colis</h4>
            <p className="text-xs text-zinc-405 mt-1 leading-relaxed">
              Livraison à domicile. Frais de port standard appliqués. Suivi en temps réel.
            </p>
            {productPrice > 100 && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-wider">
                Livraison Offerte (&gt;100€)
              </span>
            )}
          </div>
          {isShipping && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </button>

        {/* Mode Remise en main propre */}
        <button
          type="button"
          onClick={() => setIsShipping(false)}
          className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
            !isShipping
              ? "bg-zinc-900/60 border-brand-accent/50 shadow-[0_0_20px_rgba(198,255,52,0.1)] opacity-100"
              : "bg-zinc-900/20 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              !isShipping
                ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
                : "bg-zinc-800/50 border-white/5 text-zinc-400"
            }`}
          >
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-white text-base">Remise en main propre</h4>
            <p className="text-xs text-zinc-405 mt-1 leading-relaxed">
              Rencontrez le vendeur. Séquestre sécurisé. Code de validation requis pour libérer les fonds.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-brand-accent/10 text-brand-accent font-black text-[9px] uppercase tracking-wider">
              Gratuit (0,00€)
            </span>
          </div>
          {!isShipping && (
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
              <Check className="w-3 h-3 text-black fill-current" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
