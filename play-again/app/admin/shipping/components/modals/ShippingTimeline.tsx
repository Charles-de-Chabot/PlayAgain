"use client";

import React from "react";

export interface ShippingTimelineProps {
  carrierStatus: string;
  daysSincePurchase: number;
  status: string;
}

/**
 * ShippingTimeline renders a 5-step horizontal/vertical tracking path
 * indicating the current stage of shipment and flag logs.
 */
export default function ShippingTimeline({
  carrierStatus,
  daysSincePurchase,
  status,
}: ShippingTimelineProps) {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10 text-left">
      {/* Étape 1 : Paiement */}
      <div className="relative">
        <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0C101D] flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <div>
          <span className="text-xs font-bold text-white block">Commande payée &amp; validée</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Prise en compte par le système</span>
        </div>
      </div>

      {/* Étape 2 : Étiquette imprimée */}
      <div className="relative">
        <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0C101D] flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <div>
          <span className="text-xs font-bold text-white block">Bordereau de transport généré</span>
          <span className="text-[10px] text-slate-500 font-semibold block">Étiquette prête pour l'expédition</span>
        </div>
      </div>

      {/* Étape 3 : Dépôt Colis */}
      <div className="relative">
        <span
          className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
            carrierStatus === "LABEL_PRINTED_NOT_SHIPPED"
              ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              : status !== "PAID"
              ? "bg-emerald-500"
              : "bg-slate-700"
          }`}
        />
        <div>
          <span className="text-xs font-bold text-white block">Dépôt du colis en point relais / agence</span>
          {carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" ? (
            <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
              ⚠️ Anomalie : Vendeur n'a pas déposé le colis depuis {daysSincePurchase} jours.
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-semibold block">
              Effectué avec succès par le vendeur
            </span>
          )}
        </div>
      </div>

      {/* Étape 4 : Transit Hub */}
      <div className="relative">
        <span
          className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
            carrierStatus === "BLOCKED_IN_HUB" || carrierStatus === "LOST"
              ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              : status === "DELIVERED" || status === "COMPLETED"
              ? "bg-emerald-500"
              : status === "SHIPPED"
              ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
              : "bg-slate-700"
          }`}
        />
        <div>
          <span className="text-xs font-bold text-white block">Transit en plate-forme logistique</span>
          {carrierStatus === "BLOCKED_IN_HUB" || carrierStatus === "LOST" ? (
            <span className="text-[10px] text-red-400 font-bold block mt-0.5">
              ❌ Bloqué / Suspect : Colis immobile en agence de transit depuis {daysSincePurchase} jours.
            </span>
          ) : status === "SHIPPED" ? (
            <span className="text-[10px] text-cyan-400 font-semibold block">En cours d'acheminement</span>
          ) : (
            <span className="text-[10px] text-slate-500 font-semibold block">Acheminement plateforme</span>
          )}
        </div>
      </div>

      {/* Étape 5 : Livraison finale */}
      <div className="relative">
        <span
          className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
            carrierStatus === "DELIVERED" ? "bg-emerald-500" : "bg-slate-700"
          }`}
        />
        <div>
          <span className="text-xs font-bold text-white block">Livraison et validation de commande</span>
          {carrierStatus === "DELIVERED" ? (
            <span className="text-[10px] text-emerald-400 font-bold block">Colis livré et validé</span>
          ) : (
            <span className="text-[10px] text-slate-500 font-semibold block">En attente de réception</span>
          )}
        </div>
      </div>
    </div>
  );
}
