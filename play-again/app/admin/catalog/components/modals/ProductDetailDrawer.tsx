"use client";

import React from "react";
import { X, Maximize2, User, Loader2, Trash2, RefreshCw } from "lucide-react";
import { ProductAdmin } from "@/hooks/useAdminCatalog";

export interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductAdmin | null;
  onZoomImage: (url: string) => void;
  onViewSeller: (userId: number) => void;
  onToggleProductActive: (productId: number, currentActiveState: boolean) => void;
  actionLoadingId: number | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<ProductAdmin | null>>;
}

/**
 * ProductDetailDrawer slides in from the right to inspect product listings.
 */
export default function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onZoomImage,
  onViewSeller,
  onToggleProductActive,
  actionLoadingId,
  setSelectedProduct,
}: ProductDetailDrawerProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Arrière-plan flou d'ombrage */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Corps du Tiroir */}
      <div className="w-full max-w-md bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left overflow-y-auto">
        <div className="space-y-6">
          {/* En-tête Tiroir */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Détail de l'Annonce
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visuel principal */}
          <div className="aspect-[4/3] bg-black/60 rounded-2xl overflow-hidden border border-white/[0.08] relative group">
            <img
              src={product.media?.[0]?.url || "/placeholder-product.png"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onZoomImage(product.media?.[0]?.url || "/placeholder-product.png")}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/65 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md active:scale-95 transition-all shadow-md cursor-pointer"
              title="Zoomer sur la photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Titre & Prix */}
          <div className="text-left">
            <h2 className="text-lg font-black text-white leading-snug">{product.title}</h2>
            <div className="text-2xl font-black text-brand-accent font-mono tracking-tight mt-1">
              {parseFloat(product.price).toFixed(2)}€
            </div>
          </div>

          {/* Détails Techniques */}
          <div className="space-y-3 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl text-xs text-left">
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500 font-bold">Catégorie</span>
              <span className="text-white font-extrabold uppercase bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                {product.category.label}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500 font-bold">Marque</span>
              <span className="text-white font-extrabold">{product.brand.label}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500 font-bold">État d'usure</span>
              <span className="text-white font-extrabold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {product.state}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500 font-bold">Date de publication</span>
              <span className="text-slate-400 font-semibold">
                {new Date(product.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 font-bold">Disponibilité</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  product.is_sold
                    ? "bg-slate-800/20 border-slate-700/30 text-slate-500"
                    : product.is_active
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full ${
                    product.is_sold ? "bg-slate-500" : product.is_active ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span>
                  {product.is_sold ? "Vendu" : product.is_active ? "Actif (En vente)" : "Suspendu"}
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Description de l'annonce</h4>
            <p className="text-xs text-slate-400 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
              {product.description || "Aucune description fournie par le vendeur."}
            </p>
          </div>

          {/* Fiche Vendeur */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vendeur</h4>
            <div
              onClick={() => onViewSeller(product.user.id)}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.08] hover:border-brand-primary/30 p-4 rounded-2xl text-xs cursor-pointer active:scale-98 transition-all duration-300"
              title="Voir le profil complet du vendeur"
            >
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate hover:text-brand-accent transition-colors">
                  {product.user.username || "Membre PlayAgain"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                  {product.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions de modération en bas */}
        <div className="border-t border-white/[0.06] pt-4 mt-6">
          {product.is_sold ? (
            <div className="w-full text-center bg-slate-800/20 border border-slate-700/30 text-slate-500 font-extrabold text-[11px] uppercase py-3 rounded-xl">
              Produit Vendu (Modération close)
            </div>
          ) : product.is_active ? (
            <button
              type="button"
              onClick={async () => {
                onToggleProductActive(product.id, true);
                setSelectedProduct({ ...product, is_active: false });
              }}
              disabled={actionLoadingId === product.id}
              className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-red-950/20"
            >
              {actionLoadingId === product.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Suspendre l'annonce immédiatement</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                onToggleProductActive(product.id, false);
                setSelectedProduct({ ...product, is_active: true });
              }}
              disabled={actionLoadingId === product.id}
              className="w-full bg-gradient-to-r from-emerald-650 to-cyan-650 hover:from-emerald-600 hover:to-cyan-600 text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              {actionLoadingId === product.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
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
