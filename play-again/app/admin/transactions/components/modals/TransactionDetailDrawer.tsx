"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  XCircle,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { InvoiceAdmin } from "@/hooks/useTransactions";

export interface TransactionDetailDrawerProps {
  invoice: InvoiceAdmin | null;
  onClose: () => void;
  onRelease: () => void;
  onRefund: () => void;
  panelsExpanded: boolean;
  setPanelsExpanded: (val: boolean) => void;
  articleExpanded: boolean;
  setArticleExpanded: (val: boolean) => void;
  editingTracking: boolean;
  setEditingTracking: (val: boolean) => void;
  tempTracking: string;
  setTempTracking: (val: string) => void;
  onUpdateTracking: () => void;
}

/**
 * TransactionDetailDrawer renders a detailed split layout of the dispute ticket.
 */
export default function TransactionDetailDrawer({
  invoice,
  onClose,
  onRelease,
  onRefund,
  panelsExpanded,
  setPanelsExpanded,
  articleExpanded,
  setArticleExpanded,
  editingTracking,
  setEditingTracking,
  tempTracking,
  setTempTracking,
  onUpdateTracking,
}: TransactionDetailDrawerProps) {
  if (!invoice) return null;

  const buyer = invoice.user;
  const item = invoice.items?.[0];
  const product = item?.product;
  const seller = product?.user;
  const address = invoice.address;
  const productMedia = product?.media?.[0]?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Overlay flou */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300" />

      {/* Drawer Panel */}
      <div className="w-full max-w-4xl h-full bg-[#0B0F19]/95 border-l border-white/[0.08] backdrop-blur-2xl shadow-2xl flex flex-col relative z-10 transition-all duration-300 animate-slide-left p-6 overflow-y-auto">
        {/* En-tête du tiroir */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand-accent" />
            <h2 className="text-md font-black text-white uppercase tracking-wider">
              Arbitrage & Profils Protagonistes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Corps du Dossier */}
        <div className="flex-1 space-y-6 py-6 text-left">
          {/* Détails de la Commande */}
          <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500">Commande</span>
              <span className="text-xs font-bold text-white">
                PA-INV-{invoice.id.toString().padStart(6, "0")}
              </span>
            </div>

            {item && product && (
              <div className="flex gap-3 bg-black/40 border border-white/[0.04] p-2.5 rounded-xl">
                <div className="h-12 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950">
                  {productMedia ? (
                    <img src={productMedia} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600 font-bold">
                      N/A
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white line-clamp-1">{product.title}</div>
                  <div className="text-[10px] text-brand-accent font-bold mt-0.5">
                    {Number(product.price).toFixed(2)} €
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400">Total (TTC + Séquestre) :</span>
              <span className="font-extrabold text-white font-mono">
                {Number(invoice.total_price).toFixed(2)} €
              </span>
            </div>

            {invoice.commission && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Commissions PlayAgain :</span>
                <span className="font-bold text-brand-accent font-mono">
                  {Number(invoice.commission).toFixed(2)} €
                </span>
              </div>
            )}

            {/* Bouton Accordéon pour les détails de l'article & livraison */}
            <div className="border-t border-white/[0.06] pt-3 mt-1">
              <button
                type="button"
                onClick={() => setArticleExpanded(!articleExpanded)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none group"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                  Détails du Produit & Suivi
                </span>
                {articleExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                )}
              </button>

              {articleExpanded && (
                <div className="mt-3 space-y-4 animate-fadeIn">
                  {/* 1. SUIVI & LIVRAISON */}
                  <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                      Suivi & Livraison
                    </span>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <span className="text-slate-500 block">Frais de livraison :</span>
                        <span className="font-semibold text-slate-300 font-mono">
                          {invoice.shipping_fee && Number(invoice.shipping_fee) > 0
                            ? `${Number(invoice.shipping_fee).toFixed(2)} €`
                            : "Offerts / Remise en main propre"}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block mb-1">Numéro de suivi :</span>
                        {editingTracking ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="text"
                              value={tempTracking}
                              onChange={(e) => setTempTracking(e.target.value)}
                              placeholder="Ex: FR123456789"
                              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 w-full"
                            />
                            <button
                              type="button"
                              onClick={onUpdateTracking}
                              className="px-2 py-1 bg-brand-accent hover:bg-brand-accent/80 text-black text-[10px] font-bold rounded cursor-pointer transition-colors"
                            >
                              Sauver
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTracking(false);
                                setTempTracking(invoice.tracking_number || "");
                              }}
                              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] rounded cursor-pointer transition-colors"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`font-mono font-bold ${
                                invoice.tracking_number
                                  ? "text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded border border-brand-accent/10"
                                  : "text-slate-500 italic"
                              }`}
                            >
                              {invoice.tracking_number || "Non renseigné"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingTracking(true)}
                              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                            >
                              [Modifier]
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 block">Date d'achat :</span>
                        <span className="font-semibold text-slate-300">
                          {new Date(invoice.invoice_date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Date de livraison :</span>
                        <span className="font-semibold text-slate-300">
                          {invoice.delivered_at
                            ? new Date(invoice.delivered_at).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "En cours de livraison / À valider"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. DESCRIPTION */}
                  {product && (
                    <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                        Description
                      </span>
                      <p className="text-slate-300 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                        {product.description || "Aucune description fournie par le vendeur."}
                      </p>
                    </div>
                  )}

                  {/* 3. SPECIFICATIONS TECHNIQUES */}
                  {product && (
                    <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                        Spécifications Techniques
                      </span>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Marque :</span>
                          <span className="font-semibold text-slate-300">{product.brand?.label || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Catégorie :</span>
                          <span className="font-semibold text-slate-300">{product.category?.label || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Type :</span>
                          <span className="font-semibold text-slate-300">{product.type?.label || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Taille :</span>
                          <span className="font-semibold text-slate-300">{product.size?.label || "Non spécifiée"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Année de fabrication :</span>
                          <span className="font-semibold text-slate-300 font-mono">{product.age || "Non spécifiée"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Accessoires inclus :</span>
                          <span className="font-semibold text-slate-300">{product.accessory_included ? "Oui" : "Non"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Genre ciblé :</span>
                          <span className="font-semibold text-slate-300">
                            {product.targetGender === "MALE"
                              ? "Homme"
                              : product.targetGender === "FEMALE"
                              ? "Femme"
                              : "Unisexe"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Niveau requis :</span>
                          <span className="font-semibold text-slate-300">
                            {product.levelCategory === "BEGINNER"
                              ? "Débutant"
                              : product.levelCategory === "INTERMEDIATE"
                              ? "Intermédiaire"
                              : product.levelCategory === "ADVANCED"
                              ? "Confirmé"
                              : product.levelCategory === "EXPERT"
                              ? "Expert"
                              : product.levelCategory || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Double bandeau côte à côte (Acheteur et Vendeur) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* --- ACHETEUR --- */}
            <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <button
                type="button"
                onClick={() => setPanelsExpanded(!panelsExpanded)}
                className="w-full flex items-center justify-between border-b border-white/[0.06] pb-3 text-left focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {buyer?.profile_picture ? (
                        <img src={buyer.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-slate-400 font-mono">
                          {(buyer?.username || buyer?.email || "AC").substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                        Acheteur
                        {buyer?.is_certified && <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        @{buyer?.username || "client"} ({buyer?.firstname || ""} {buyer?.lastname || ""})
                      </span>
                    </div>
                  </div>
                </div>
                {panelsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                )}
              </button>

              {panelsExpanded && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Email :</span>
                      <a
                        href={`mailto:${buyer?.email}`}
                        className="text-slate-300 hover:text-brand-accent transition-colors font-semibold font-mono"
                      >
                        {buyer?.email}
                      </a>
                    </div>
                    {buyer?.phone && (
                      <div>
                        <span className="text-slate-500 block">Téléphone :</span>
                        <span className="text-slate-300 font-mono font-semibold">{buyer.phone}</span>
                      </div>
                    )}
                    {buyer?.created_at && (
                      <div>
                        <span className="text-slate-500 block">Membre depuis :</span>
                        <span className="text-slate-300 font-semibold">
                          {new Date(buyer.created_at).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Adresse de Livraison */}
                  <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                      Adresse de Livraison
                    </span>
                    {address || (buyer?.addresses && buyer.addresses.length > 0) ? (
                      (() => {
                        const addr = address || buyer?.addresses?.[0];
                        if (!addr) return null;
                        return (
                          <div className="text-xs text-slate-300 space-y-0.5 leading-relaxed font-medium">
                            <div className="font-semibold text-white">
                              {buyer?.firstname || buyer?.username} {buyer?.lastname || ""}
                            </div>
                            <div>
                              {addr.street_number || ""} {addr.street_name}
                            </div>
                            <div>
                              {addr.zip_code} {addr.city}
                            </div>
                            <div className="uppercase font-bold text-[10px] text-slate-400 tracking-wider mt-1">
                              {addr.country}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Aucune adresse renseignée ou remise en main propre
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- VENDEUR --- */}
            <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <button
                type="button"
                onClick={() => setPanelsExpanded(!panelsExpanded)}
                className="w-full flex items-center justify-between border-b border-white/[0.06] pb-3 text-left focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {seller?.profile_picture ? (
                        <img src={seller.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-slate-400 font-mono">
                          {(seller?.username || seller?.email || "VE").substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                        Vendeur
                        {seller?.is_certified && <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        @{seller?.username || "vendeur"} ({seller?.firstname || ""} {seller?.lastname || ""})
                      </span>
                    </div>
                  </div>
                </div>
                {panelsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                )}
              </button>

              {panelsExpanded && (
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Email :</span>
                      <a
                        href={`mailto:${seller?.email}`}
                        className="text-slate-300 hover:text-brand-accent transition-colors font-semibold font-mono"
                      >
                        {seller?.email}
                      </a>
                    </div>
                    {seller?.phone && (
                      <div>
                        <span className="text-slate-500 block">Téléphone :</span>
                        <span className="text-slate-300 font-mono font-semibold">{seller.phone}</span>
                      </div>
                    )}
                    {seller?.created_at && (
                      <div>
                        <span className="text-slate-500 block">Membre depuis :</span>
                        <span className="text-slate-300 font-semibold">
                          {new Date(seller.created_at).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Adresse Renseignée */}
                  <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                      Adresse du Vendeur
                    </span>
                    {seller?.addresses && seller.addresses.length > 0 ? (
                      (() => {
                        const addr = seller.addresses[0];
                        return (
                          <div className="text-xs text-slate-300 space-y-0.5 leading-relaxed font-medium">
                            <div className="font-semibold text-white">
                              {seller?.firstname || seller?.username} {seller?.lastname || ""}
                            </div>
                            <div>
                              {addr.street_number || ""} {addr.street_name}
                            </div>
                            <div>
                              {addr.zip_code} {addr.city}
                            </div>
                            <div className="uppercase font-bold text-[10px] text-slate-400 tracking-wider mt-1">
                              {addr.country}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Aucune adresse renseignée par le vendeur
                      </span>
                    )}
                  </div>

                  {/* Statut Financier Stripe */}
                  <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block font-bold">
                      Statut Bancaire Stripe Connect
                    </span>
                    {seller?.stripeConnectId ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span>Compte Connecté & Prêt</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate bg-black/40 px-2 py-1 rounded border border-white/[0.02]">
                          ID: {seller.stripeConnectId}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                        <span>Non Configuré (Virement Impossible)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dossier de Réclamation / Raison */}
          {invoice.status === "DISPUTED" && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold">
                <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
                Motif déclaré du litige
              </div>
              <p className="text-xs text-red-200/80 leading-relaxed italic bg-black/40 border border-white/[0.02] p-3 rounded-xl">
                "L'acheteur a signalé un problème ou ouvert un litige concernant la commande #{invoice.id}."
              </p>
            </div>
          )}

          {/* Redirection vers le support / chat de médiation */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 block">Actions de Médiation</span>
            <Link
              href="/admin/support"
              className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-xl py-3 px-4 transition-all"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-accent" />
                Ouvrir le Support Helpdesk
              </span>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Zone de Décisions d'arbitrage */}
        {invoice.status === "DISPUTED" ? (
          <div className="pt-4 border-t border-white/[0.08] space-y-3 shrink-0">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold text-center block mb-2 select-none">
              Verdict Administratif Souverain
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Rembourser l'acheteur */}
              <button
                type="button"
                onClick={onRefund}
                className="bg-red-600 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] text-white font-black text-xs py-3.5 px-3 rounded-xl border border-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                Rembourser l'Acheteur
              </button>

              {/* Débloquer pour le vendeur */}
              <button
                type="button"
                onClick={onRelease}
                className="bg-brand-accent hover:bg-brand-accent/90 hover:shadow-[0_0_15px_rgba(198,255,52,0.3)] text-black font-black text-xs py-3.5 px-3 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Débloquer les Fonds
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-slate-500 py-2 select-none font-medium">
            Cette transaction a déjà été traitée (Statut: {invoice.status}).
          </div>
        )}
      </div>
    </div>
  );
}
