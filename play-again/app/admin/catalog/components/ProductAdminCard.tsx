"use client";

import React from "react";
import { Maximize2, User, Tag, Loader2, Trash2, RefreshCw } from "lucide-react";
import { ProductAdmin } from "@/hooks/useAdminCatalog";

export interface ProductAdminCardProps {
  product: ProductAdmin;
  onClick: () => void;
  onZoomImage: (url: string) => void;
  onToggleProductActive: (productId: number, currentActiveState: boolean) => void;
  actionLoadingId: number | null;
}

/**
 * ProductAdminCard displays catalog metadata, image preview with lightbox button,
 * owner details and toggle activation controls.
 */
export default function ProductAdminCard({
  product,
  onClick,
  onZoomImage,
  onToggleProductActive,
  actionLoadingId,
}: ProductAdminCardProps) {
  const firstImage = product.media?.[0]?.url || "/placeholder-product.png";

  return (
    <div
      onClick={onClick}
      className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer text-left"
    >
      {/* Zone Image */}
      <div className="aspect-[4/3] bg-black/60 relative overflow-hidden border-b border-white/[0.04]">
        <img
          src={firstImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />

        {/* Bouton pour agrandir */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoomImage(firstImage);
          }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/65 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
          title="Zoomer sur la photo"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="text-[8px] font-black uppercase bg-[#10B981]/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full backdrop-blur-md">
            {product.category.label}
          </span>
          <span className="text-[8px] font-black uppercase bg-white/5 text-slate-300 border border-white/15 px-2 py-0.5 rounded-full backdrop-blur-md">
            État : {product.state}
          </span>
        </div>
      </div>

      {/* Contenu Carte */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-extrabold text-white line-clamp-1 leading-snug">
              {product.title}
            </h3>
            <span className="text-sm font-black text-emerald-400 font-mono tracking-tight shrink-0">
              {parseFloat(product.price).toFixed(2)}€
            </span>
          </div>

          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || "Aucune description fournie par le vendeur."}
          </p>
        </div>

        {/* Infos Vendeur & Date */}
        <div className="border-t border-white/[0.04] pt-3 space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{product.user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Marque : <span className="text-white font-bold">{product.brand.label}</span>
            </span>
          </div>
        </div>

        {/* Boutons d'Action administrative */}
        <div className="border-t border-white/[0.04] pt-3 flex gap-2">
          {product.is_sold ? (
            <div
              className="w-full text-center bg-slate-800/20 border border-slate-700/30 text-slate-500 font-extrabold text-[10px] uppercase py-2.5 rounded-xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              Produit Vendu (Modération close)
            </div>
          ) : product.is_active ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleProductActive(product.id, true);
              }}
              disabled={actionLoadingId === product.id}
              className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-red-400 hover:text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[10px] uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-97 cursor-pointer"
            >
              {actionLoadingId === product.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Suspendre l'annonce</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleProductActive(product.id, false);
              }}
              disabled={actionLoadingId === product.id}
              className="w-full bg-gradient-to-r from-emerald-650 to-cyan-650 hover:from-emerald-600 hover:to-cyan-600 text-emerald-400 hover:text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[10px] uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-97 cursor-pointer"
            >
              {actionLoadingId === product.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réactiver l'annonce</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
