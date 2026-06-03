"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, User, Lock, AlertTriangle } from "lucide-react";
import { Product } from "@/hooks/useChat";

export interface ChatHeaderProps {
  partner: {
    username: string | null;
    firstname: string | null;
    profile_picture: string | null;
    products?: Array<{ id: number }>;
  };
  product: Product | null;
  isBuyer: boolean;
  isReadOnly: boolean;
  isSupportClosed?: boolean;
  acceptedOffer: boolean;
  currentPrice: number;
}

/**
 * ChatHeader component renders the conversation context (partner info, product, buying flow, alerts).
 */
export function ChatHeader({
  partner,
  product,
  isBuyer,
  isReadOnly,
  isSupportClosed = false,
  acceptedOffer,
  currentPrice,
}: ChatHeaderProps) {
  const partnerName = partner.username || partner.firstname || "Utilisateur";
  const partnerSoldCount = partner.products?.length || 0;
  const productMedia = product?.media?.[0]?.url;

  return (
    <div className="flex flex-col shrink-0">
      {/* Bandeau En-tête de Discussion */}
      <header className="p-3.5 border-b border-white/10 bg-brand-black/20 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/messages"
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          
          {partner.profile_picture ? (
            <img
              src={partner.profile_picture}
              alt={partnerName}
              className="h-11 w-11 rounded-full object-cover border border-white/15"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-zinc-400">
              <User className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1 text-left flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-sm sm:text-base font-black text-white truncate leading-none">
              {partnerName}
            </h2>

            {/* Badge Ventes Réussies (Preuve Sociale Compacte) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-accent/30 bg-zinc-950/80 hover:bg-zinc-900/50 transition-all select-none group w-fit cursor-default shrink-0 shadow-[0_0_10px_rgba(198,255,52,0.05)] hover:shadow-[0_0_15px_rgba(198,255,52,0.15)] hover:border-brand-accent/50 duration-300">
              <span className="text-[9px] animate-pulse">⚡</span>
              <span className="text-[8px] font-black uppercase tracking-[0.15em] italic text-brand-accent">
                {partnerSoldCount} {partnerSoldCount > 1 ? "vendus" : "vendu"}
              </span>
            </div>
            
            {/* Séparateur discret */}
            <span className="text-white/20 text-xs select-none hidden sm:inline">•</span>
            
            {/* Infos produit affichées à côté du nom */}
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-white/50 min-w-0 leading-none">
              {product ? (
                <>
                  <span className="font-bold text-brand-accent truncate max-w-[150px] sm:max-w-xs">
                    {product.title}
                  </span>
                  <span className="text-white/30">•</span>
                  <span>
                    État : <span className="text-white/80 font-bold">{product.state}</span>
                  </span>
                  <span className="text-white/30">•</span>
                  <span>
                    Prix :{" "}
                    <span className="font-semibold text-white/80">
                      {acceptedOffer ? (
                        <>
                          <span className="line-through text-white/30 mr-1">{product.price} €</span>
                          <span className="text-brand-accent font-black">{currentPrice} €</span>
                        </>
                      ) : (
                        <span>{product.price} €</span>
                      )}
                    </span>
                  </span>
                </>
              ) : (
                <span className="font-bold text-brand-accent">Assistance SAV PlayAgain</span>
              )}
            </div>
          </div>
        </div>

        {/* Partie droite (Photo du produit à gauche du bouton Acheter) */}
        {product && (
          <div className="flex items-center gap-3 shrink-0">
            {productMedia && (
              <img
                src={productMedia}
                alt={product.title}
                className="h-10 w-10 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
              />
            )}
            {isBuyer && !isReadOnly && (
              <Link
                href={acceptedOffer ? `/product/${product.id}/checkout` : `/product/${product.id}`}
                className="bg-brand-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-brand-primary/80 border border-brand-primary/20 transition-all shadow-md"
              >
                Acheter
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Bannière d'avertissement Lecture seule */}
      {isReadOnly && product && (
        <div className="bg-brand-primary/10 border-b border-brand-primary/20 p-2 text-center text-xs text-white/70 font-semibold flex items-center justify-center gap-2">
          <Lock className="h-3.5 w-3.5 text-brand-primary" />
          {!product.is_active && !product.is_sold
            ? "Le vendeur a supprimé cette annonce. La discussion est désormais en lecture seule."
            : "La transaction est terminée. La discussion est désormais fermée en lecture seule."}
        </div>
      )}

      {isSupportClosed && (
        <div className="bg-brand-accent/15 border-b border-brand-accent/30 p-2.5 text-center text-xs text-brand-accent font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <AlertTriangle className="h-4 w-4 text-brand-accent shrink-0 animate-pulse" />
          Ce litige a été résolu par l'administration. La discussion avec le support est close et en lecture seule.
        </div>
      )}
    </div>
  );
}
