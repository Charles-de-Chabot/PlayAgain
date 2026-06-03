"use client";

import React from "react";
import {
  Calendar,
  User,
  Copy,
  CheckCircle,
  Clock,
  AlertOctagon,
  ShieldAlert,
  Send,
  Loader2,
} from "lucide-react";
import { ShippingItem } from "@/hooks/useShipping";

export interface ShippingTableProps {
  shippings: ShippingItem[];
  loading: boolean;
  onSelectShipping: (shipping: ShippingItem) => void;
  onCopyTracking: (trackingNumber: string) => void;
  onShippingAction: (invoiceId: number, action: "WARN_SELLER" | "POSTPONE_VALIDATION") => void;
  actionLoading: string | null;
}

/**
 * ShippingTable renders a table containing active shipments, logistics statuses,
 * and quick mediation buttons.
 */
export default function ShippingTable({
  shippings,
  loading,
  onSelectShipping,
  onCopyTracking,
  onShippingAction,
  actionLoading,
}: ShippingTableProps) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Commande &amp; Article</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Expéditeur (Vendeur)</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destinataire (Acheteur)</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Transporteur &amp; Suivi</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">État Logistique</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">Actions Relance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="text-xs text-slate-400 font-semibold">Récupération des flux de transit...</span>
                  </div>
                </td>
              </tr>
            ) : shippings.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <span className="text-xs text-slate-500 font-bold">Aucune expédition logistique en anomalie détectée.</span>
                </td>
              </tr>
            ) : (
              shippings.map((shipping) => (
                <tr
                  key={shipping.invoiceId}
                  onClick={() => onSelectShipping(shipping)}
                  className="hover:bg-white/[0.01] active:bg-white/[0.02] cursor-pointer transition-colors duration-200"
                >
                  {/* Commande / Produit */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Cmd #{shipping.invoiceId}</span>
                      <span
                        className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px] mt-0.5"
                        title={shipping.product?.title || ""}
                      >
                        {shipping.product?.title || "Article inconnu"}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500 font-bold">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(shipping.invoiceDate).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </td>

                  {/* Vendeur (Expéditeur) */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {shipping.seller?.username || "Sans pseudo"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {shipping.seller?.email}
                      </span>
                    </div>
                  </td>

                  {/* Acheteur (Destinataire) */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200">
                        {shipping.buyer?.username || "Sans pseudo"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {shipping.buyer?.email}
                      </span>
                    </div>
                  </td>

                  {/* Transporteur & Suivi */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          shipping.carrierCode === "MR"
                            ? "bg-pink-700/10 border-pink-700/20 text-pink-400 shadow-[0_0_8px_rgba(219,39,119,0.05)]"
                            : shipping.carrierCode === "CC"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                      >
                        {shipping.carrier || "À définir"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            shipping.trackingNumber ? "text-slate-300" : "text-slate-500 italic"
                          }`}
                        >
                          {shipping.trackingNumber || "Non renseigné"}
                        </span>
                        {shipping.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => onCopyTracking(shipping.trackingNumber)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-90 transition-all text-slate-400 hover:text-white cursor-pointer"
                            title="Copier le n° de suivi"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* État Logistique */}
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          shipping.carrierStatus === "DELIVERED"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                            : shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : shipping.carrierStatus === "DISPUTED"
                            ? "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                            : "bg-red-500/15 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse"
                        }`}
                      >
                        {shipping.carrierStatus === "DELIVERED" && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && <Clock className="w-3 h-3 text-amber-400" />}
                        {shipping.carrierStatus === "DISPUTED" && <AlertOctagon className="w-3 h-3 text-red-400" />}
                        {(shipping.carrierStatus === "BLOCKED_IN_HUB" || shipping.carrierStatus === "LOST") && (
                          <ShieldAlert className="w-3 h-3 text-red-400" />
                        )}

                        <span>{shipping.carrierStatusLabel}</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold block">
                        Depuis {shipping.daysSincePurchase} jours
                      </span>
                    </div>
                  </td>

                  {/* Actions de Relance */}
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      {/* Avertir le vendeur */}
                      {shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && (
                        <button
                          type="button"
                          onClick={() => onShippingAction(shipping.invoiceId, "WARN_SELLER")}
                          disabled={actionLoading === `${shipping.invoiceId}-WARN_SELLER`}
                          className="bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 border border-amber-500/20 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)] disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === `${shipping.invoiceId}-WARN_SELLER` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Relancer vendeur</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Repousser validation */}
                      {(shipping.carrierStatus === "BLOCKED_IN_HUB" || shipping.carrierStatus === "LOST") && (
                        <button
                          type="button"
                          onClick={() => onShippingAction(shipping.invoiceId, "POSTPONE_VALIDATION")}
                          disabled={actionLoading === `${shipping.invoiceId}-POSTPONE_VALIDATION`}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-400 border border-cyan-500/20 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === `${shipping.invoiceId}-POSTPONE_VALIDATION` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Repousser validation</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Sans action requise */}
                      {shipping.carrierStatus === "DELIVERED" && (
                        <span className="text-[10px] text-slate-500 font-semibold italic">Aucune action requise</span>
                      )}

                      {shipping.carrierStatus === "IN_TRANSIT" && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> Normal
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
