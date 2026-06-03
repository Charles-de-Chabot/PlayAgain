"use client";

import React from "react";
import { X, Loader2, Trash2, RefreshCw } from "lucide-react";

export interface SellerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sellerLoading: boolean;
  selectedSeller: any;
  actionLoadingId: number | null;
  onSuspendSeller: (userId: number) => void;
  onReactivateSeller: (userId: number) => void;
}

/**
 * SellerDetailDrawer inspects seller account profiles and lists action controls.
 */
export default function SellerDetailDrawer({
  isOpen,
  onClose,
  sellerLoading,
  selectedSeller,
  actionLoadingId,
  onSuspendSeller,
  onReactivateSeller,
}: SellerDetailDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-45 flex justify-end pointer-events-none">
      {/* Arrière-plan flou d'ombrage optionnel sur mobile */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity pointer-events-auto md:hidden"
      />

      {/* Corps du Tiroir Vendeur */}
      <div className="w-full max-w-md bg-[#090C15]/98 border-l border-white/[0.06] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left md:right-[448px] pointer-events-auto overflow-y-auto backdrop-blur-xl">
        {sellerLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Chargement du profil vendeur...</span>
          </div>
        ) : selectedSeller ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* En-tête Tiroir Vendeur */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-accent">
                  Profil du Vendeur
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fiche d'identité d'utilisateur */}
              <div className="flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden text-left">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedSeller.profile_picture ? (
                    <img src={selectedSeller.profile_picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-400 font-mono">
                      {(selectedSeller.username || selectedSeller.email).substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-white truncate flex items-center gap-1.5">
                    {selectedSeller.username || "Sans pseudo"}
                    {selectedSeller.is_certified && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Certifié" />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase mt-0.5">
                    ID unique : #{selectedSeller.id}
                  </span>
                  <span
                    className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border mt-2 ${
                      selectedSeller.role === "ADMIN"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                    }`}
                  >
                    Rôle : {selectedSeller.role}
                  </span>
                </div>
              </div>

              {/* Informations Générales */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informations Personnelles</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <span className="text-slate-500 font-bold">Nom Complet</span>
                    <span className="text-white font-extrabold">
                      {selectedSeller.firstname || selectedSeller.lastname
                        ? `${selectedSeller.firstname || ""} ${selectedSeller.lastname || ""}`.trim()
                        : "Non renseigné"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <span className="text-slate-500 font-bold">Adresse E-mail</span>
                    <span className="text-white font-mono font-bold select-all">{selectedSeller.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <span className="text-slate-500 font-bold">Téléphone</span>
                    <span className="text-white font-semibold">{selectedSeller.phone || "Non renseigné"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <span className="text-slate-500 font-bold">Inscription</span>
                    <span className="text-slate-400 font-semibold">
                      {new Date(selectedSeller.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <span className="text-slate-500 font-bold">Total Annonces</span>
                    <span className="text-brand-primary font-black font-mono">
                      {selectedSeller._count?.products || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 font-bold">Statut de Compte</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        selectedSeller.is_active
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${selectedSeller.is_active ? "bg-emerald-400" : "bg-red-400"}`}
                      />
                      <span>{selectedSeller.is_active ? "Actif" : "Suspendu"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de modération du vendeur */}
            <div className="border-t border-white/[0.06] pt-4 mt-6">
              {selectedSeller.is_active ? (
                <button
                  type="button"
                  onClick={() => onSuspendSeller(selectedSeller.id)}
                  disabled={actionLoadingId === selectedSeller.id}
                  className="w-full bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-red-950/20"
                >
                  {actionLoadingId === selectedSeller.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Suspendre le Compte Membre</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onReactivateSeller(selectedSeller.id)}
                  disabled={actionLoadingId === selectedSeller.id}
                  className="w-full bg-gradient-to-r from-emerald-650 to-cyan-650 hover:from-emerald-600 hover:to-cyan-600 text-white border border-emerald-500/25 disabled:opacity-50 font-extrabold text-[11px] uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  {actionLoadingId === selectedSeller.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Réactiver le Compte Membre</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            Aucune information disponible.
          </div>
        )}
      </div>
    </div>
  );
}
