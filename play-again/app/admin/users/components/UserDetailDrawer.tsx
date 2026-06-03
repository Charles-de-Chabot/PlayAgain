"use client";

import React from "react";
import {
  X,
  ShieldAlert,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { type UserAdmin } from "./UserTable";

export interface UserDetailDrawerProps {
  user: UserAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  actionLoading: boolean;
  onToggleActive: (userId: number, currentActiveState: boolean) => Promise<void>;
}

export default function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  actionLoading,
  onToggleActive,
}: UserDetailDrawerProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end text-left">
      {/* Arrière-plan flou d'ombrage */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Corps du Tiroir (Slide-in Right Container) */}
      <div className="w-full max-w-md bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between animate-fade-in-left">
        <div className="space-y-6">
          {/* En-tête Tiroir */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Profil Détaillé Membre
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fiche d'identité d'utilisateur */}
          <div className="flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400 font-mono">
                  {(user.username || user.email).substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold text-white truncate">
                {user.username || "Sans pseudo"}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase mt-0.5">
                ID unique : #{user.id}
              </span>
              <span
                className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border mt-2 ${
                  user.role === "ADMIN"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                }`}
              >
                Rôle : {user.role}
              </span>
            </div>
          </div>

          {/* Informations Générales */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informations Personnelles</h4>

            <div className="space-y-2 text-xs">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="font-mono">{user.email}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{user.phone || "Non renseigné"}</span>
              </div>

              {/* Inscription */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(user.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques d'Activité */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Statistiques</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Articles Mis en Vente
                </span>
                <span className="text-2xl font-black text-white mt-1 block">{user._count.products}</span>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Confiance Profil
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {user.is_certified ? "Certifié" : "Standard"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions de Modération (Pied du Drawer) */}
        <div className="border-t border-white/[0.06] pt-4 mt-6">
          {user.role === "ADMIN" ? (
            <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex gap-3 text-xs text-slate-400 leading-relaxed font-semibold">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span>
                Ce compte est un administrateur système. Ses privilèges de sécurité empêchent la désactivation
                administrative depuis l'interface client.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-500 block leading-tight font-semibold">
                🔑 Actionner le statut d'activité suspend automatiquement toutes ses annonces sportives de vente dans le
                catalogue.
              </span>

              {user.is_active ? (
                <button
                  type="button"
                  onClick={() => onToggleActive(user.id, true)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(220,38,38,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Désactiver (Soft-Delete)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleActive(user.id, false)}
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Réactiver le Compte</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
