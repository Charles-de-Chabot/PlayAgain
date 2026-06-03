"use client";

import React from "react";
import { Truck, Info } from "lucide-react";

export interface Product {
  id: number;
  title: string;
  price: string | number;
  media: Array<{ url: string }>;
  brand?: { label: string };
  user: {
    username: string;
  };
}

export interface CheckoutSummaryProps {
  product: Product;
  productPrice: number;
  isShipping: boolean;
  commission: number;
  shippingFee: number;
  totalPrice: number;
}

/**
 * CheckoutSummary displays the order's items, pricing breakdown details,
 * and calculations overview.
 */
export default function CheckoutSummary({
  product,
  productPrice,
  isShipping,
  commission,
  shippingFee,
  totalPrice,
}: CheckoutSummaryProps) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-lg lg:sticky lg:top-24 space-y-6 text-left">
      <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Récapitulatif de la commande</h3>

      {/* Article Info */}
      <div className="flex gap-4 pb-6 border-b border-white/5">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0 relative">
          {product.media && product.media.length > 0 ? (
            <img src={product.media[0].url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Truck className="w-8 h-8 text-zinc-700" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {product.brand && (
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              {product.brand.label}
            </span>
          )}
          <h4 className="font-bold text-white text-base truncate leading-snug">{product.title}</h4>
          <p className="text-xs text-zinc-405 mt-1">
            Vendu par <span className="font-bold text-brand-primary">{product.user.username}</span>
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400 font-medium">Prix de l'article</span>
          <span className="font-bold text-white">{productPrice.toFixed(2)} €</span>
        </div>

        <div className="flex justify-between items-center group relative">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5 cursor-pointer">
            Frais de Protection Acheteur
            <div className="relative inline-block text-zinc-500 hover:text-white">
              <Info className="w-3.5 h-3.5" />
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-zinc-950 border border-white/10 text-[10px] text-zinc-300 font-medium leading-normal opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-55 shadow-xl">
                Assure la protection de vos fonds sous séquestre, finance la couverture d'assurance et couvre le
                traitement bancaire Stripe.
              </span>
            </div>
          </span>
          <span className="font-bold text-white">{commission.toFixed(2)} €</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400 font-medium">Frais de livraison</span>
          <span className="font-bold">
            {isShipping ? (
              shippingFee === 0 ? (
                <span className="text-brand-accent uppercase tracking-wider text-xs">Gratuit</span>
              ) : (
                `${shippingFee.toFixed(2)} €`
              )
            ) : (
              <span className="text-brand-accent uppercase tracking-wider text-xs">Gratuit</span>
            )}
          </span>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
          <span className="text-base font-black text-white uppercase tracking-wider">Total</span>
          <div className="text-right">
            <span className="text-3xl font-black text-brand-primary drop-shadow-[0_0_12px_rgba(125,56,255,0.2)]">
              {totalPrice.toFixed(2)} €
            </span>
            <p className="text-[9px] text-zinc-500 font-bold mt-1">TVA & frais de traitement inclus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
