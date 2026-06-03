"use client";

import React from "react";
import { Truck, X, Check, Edit2, Send, Clock, Loader2 } from "lucide-react";
import { ShippingItem } from "@/hooks/useShipping";
import ShippingTimeline from "./ShippingTimeline";
import ParticipantCard from "./ParticipantCard";

export interface ShippingDiagnosticDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipping: ShippingItem | null;
  actionLoading: string | null;
  isEditingTracking: boolean;
  setIsEditingTracking: (b: boolean) => void;
  newTracking: string;
  setNewTracking: (t: string) => void;
  isEditingStatus: boolean;
  setIsEditingStatus: (b: boolean) => void;
  newInvoiceStatus: string;
  setNewInvoiceStatus: (s: string) => void;
  onUpdateTracking: () => void;
  onUpdateInvoiceStatus: () => void;
  onShippingAction: (invoiceId: number, action: "WARN_SELLER" | "POSTPONE_VALIDATION") => void;
}

/**
 * ShippingDiagnosticDrawer slides in from the right to edit track numbers,
 * force invoice statuses, view transit timelines, and trigger warning relance messages.
 */
export default function ShippingDiagnosticDrawer({
  isOpen,
  onClose,
  shipping,
  actionLoading,
  isEditingTracking,
  setIsEditingTracking,
  newTracking,
  setNewTracking,
  isEditingStatus,
  setIsEditingStatus,
  newInvoiceStatus,
  setNewInvoiceStatus,
  onUpdateTracking,
  onUpdateInvoiceStatus,
  onShippingAction,
}: ShippingDiagnosticDrawerProps) {
  if (!isOpen || !shipping) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay flouté */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Tiroir */}
      <div className="w-full max-w-lg bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {/* En-tête Tiroir */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Diagnostic Colis #{shipping.invoiceId}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Produit */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
              Article transité
            </span>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {shipping.product?.title || "Produit inconnu"}
                </h4>
                <span className="text-xs font-semibold text-slate-400 block mt-1">
                  Prix produit : {shipping.product?.price} €
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Montant total</span>
                <span className="text-sm font-black text-emerald-400">{shipping.totalPrice} €</span>
              </div>
            </div>
          </div>

          {/* Suivi et transporteur */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left">Suivi Transporteur</h4>

            <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-3 text-left">
              {/* Transporteur */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Transporteur officiel</span>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    shipping.carrierCode === "MR"
                      ? "bg-pink-700/10 border-pink-700/20 text-pink-400"
                      : shipping.carrierCode === "CC"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  {shipping.carrier || "À définir"}
                </span>
              </div>

              {/* Numéro de suivi éditable */}
              <div className="flex justify-between items-center text-xs border-t border-white/[0.04] pt-3">
                <span className="text-slate-400 font-bold">Numéro de suivi</span>
                {isEditingTracking ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTracking}
                      onChange={(e) => setNewTracking(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      placeholder="Ex: MR-12345A ou CC-54321FR"
                    />
                    <button
                      type="button"
                      onClick={onUpdateTracking}
                      disabled={actionLoading === "update-tracking"}
                      className="p-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTracking(false)}
                      className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className={shipping.trackingNumber ? "text-white" : "text-slate-500 italic"}>
                      {shipping.trackingNumber || "Non renseigné"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTracking(true)}
                      className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Statut de Facturation éditable */}
              <div className="flex justify-between items-center text-xs border-t border-white/[0.04] pt-3">
                <span className="text-slate-400 font-bold">État Facture (BDD)</span>
                {isEditingStatus ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newInvoiceStatus}
                      onChange={(e) => setNewInvoiceStatus(e.target.value)}
                      className="bg-black border border-[#2A2E3D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-medium"
                    >
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DISPUTED">DISPUTED</option>
                    </select>
                    <button
                      type="button"
                      onClick={onUpdateInvoiceStatus}
                      disabled={actionLoading === "update-status"}
                      className="p-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingStatus(false)}
                      className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-white font-bold">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {shipping.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingStatus(true)}
                      className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline logistique interactive */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left">Ligne Temporelle Logistique</h4>
            <ShippingTimeline
              carrierStatus={shipping.carrierStatus}
              daysSincePurchase={shipping.daysSincePurchase}
              status={shipping.status}
            />
          </div>

          {/* Coordonnées Vendeur & Acheteur */}
          <div className="grid grid-cols-2 gap-4">
            <ParticipantCard
              label="Expéditeur"
              username={shipping.seller?.username || null}
              email={shipping.seller?.email}
              phone={shipping.seller?.phone}
            />
            <ParticipantCard
              label="Destinataire"
              username={shipping.buyer?.username || null}
              email={shipping.buyer?.email}
              phone={shipping.buyer?.phone}
            />
          </div>
        </div>

        {/* Actions de Modération */}
        <div className="border-t border-white/[0.06] pt-4 mt-6 space-y-3">
          <span className="text-[9px] text-slate-500 font-bold block text-center leading-tight">
            🛡️ L'envoi de relance administrative utilise l'API de notification in-app en temps réel.
          </span>

          {shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && (
            <button
              type="button"
              onClick={() => onShippingAction(shipping.invoiceId, "WARN_SELLER")}
              disabled={actionLoading !== null}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {actionLoading === `${shipping.invoiceId}-WARN_SELLER` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Relancer le Vendeur (Retard de Dépôt)</span>
                </>
              )}
            </button>
          )}

          {(shipping.carrierStatus === "BLOCKED_IN_HUB" || shipping.carrierStatus === "LOST") && (
            <button
              type="button"
              onClick={() => onShippingAction(shipping.invoiceId, "POSTPONE_VALIDATION")}
              disabled={actionLoading !== null}
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              {actionLoading === `${shipping.invoiceId}-POSTPONE_VALIDATION` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Repousser la Validation (Protéger les Fonds)</span>
                </>
              )}
            </button>
          )}

          {shipping.carrierStatus === "DELIVERED" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center p-3 rounded-xl font-bold">
              ✓ Ce colis a été livré. Aucune mesure d'arbitrage logistique n'est requise.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
