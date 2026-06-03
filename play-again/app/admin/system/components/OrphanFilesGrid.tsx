"use client";

import React from "react";
import { HardDrive, Check, ShieldCheck } from "lucide-react";

export interface OrphanFile {
  url: string;
  size: number;
}

export interface OrphanFilesGridProps {
  orphans: OrphanFile[];
  selectedUrls: string[];
  onToggleSelectOrphan: (url: string) => void;
  onToggleSelectAll: () => void;
  formatBytes: (bytes: number) => string;
}

// Resolves assumed purpose of an image based on upload folder to guide the admin
const getOrphanPurpose = (url: string) => {
  if (url.includes("/uploads/products/")) {
    return {
      label: "Photo de Produit",
      desc: "Ancienne annonce de produit supprimée.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      folder: "products",
    };
  }
  if (url.includes("/uploads/profile/") || url.includes("/uploads/avatars/")) {
    return {
      label: "Avatar / Profil",
      desc: "Ancienne photo de profil utilisateur.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      folder: "profile",
    };
  }
  if (url.includes("/uploads/chat/")) {
    return {
      label: "Messagerie (Chat)",
      desc: "Pièce jointe de chat supprimée.",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      folder: "chat",
    };
  }
  if (url.includes("/uploads/verifications/")) {
    return {
      label: "Vérification (ID)",
      desc: "Pièce d'identité ou selfie de certification.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      folder: "verifications",
    };
  }
  return {
    label: "Fichier Système",
    desc: "Fichier orphelin non classifié.",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    folder: "uploads",
  };
};

export default function OrphanFilesGrid({
  orphans,
  selectedUrls,
  onToggleSelectOrphan,
  onToggleSelectAll,
  formatBytes,
}: OrphanFilesGridProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
          <HardDrive className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Aperçu des Fichiers Orphelins ({orphans.length})</span>
        </h3>

        {orphans.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onToggleSelectAll}
              className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none"
            >
              {selectedUrls.length === orphans.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
              {formatBytes(orphans.filter((o) => selectedUrls.includes(o.url)).reduce((sum, o) => sum + o.size, 0))}{" "}
              Récupérables
            </span>
          </div>
        )}
      </div>

      {orphans.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent">
          {orphans.map((orphan, i) => {
            const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(orphan.url);
            const isSelected = selectedUrls.includes(orphan.url);
            const purpose = getOrphanPurpose(orphan.url);
            return (
              <div
                key={i}
                onClick={() => onToggleSelectOrphan(orphan.url)}
                className={`relative p-2.5 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 rounded-2xl cursor-pointer select-none overflow-hidden border ${
                  isSelected
                    ? "border-rose-500/50 bg-rose-500/[0.04] shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20"
                    : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] opacity-60 hover:opacity-100"
                }`}
              >
                {/* Checkbox circular badge */}
                <div
                  className={`absolute top-2.5 right-2.5 z-10 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isSelected ? "bg-rose-500 border-rose-400 text-white shadow" : "bg-black/60 border-white/20 text-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                </div>

                <div className="w-full aspect-square rounded-lg bg-black/45 border border-white/[0.05] overflow-hidden flex items-center justify-center relative shadow-inner">
                  {isImage ? (
                    <img
                      src={orphan.url}
                      alt="Orphelin"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isSelected ? "scale-102" : "group-hover:scale-105"
                      }`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.parentElement?.querySelector(".fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  <div className={`fallback ${isImage ? "hidden" : ""} text-slate-600 flex flex-col items-center justify-center`}>
                    <HardDrive
                      className={`w-6 h-6 transition-colors ${isSelected ? "text-rose-400" : "group-hover:text-rose-400"}`}
                    />
                  </div>

                  {/* Hover Information overlay */}
                  <div className="absolute inset-0 bg-black/92 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center gap-1.5 backdrop-blur-[2px] select-none">
                    <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${purpose.color}`}>
                      {purpose.label}
                    </span>
                    <span className="text-[7.5px] font-medium text-slate-300 leading-tight">{purpose.desc}</span>
                    <div className="text-[6.5px] font-mono text-slate-500 border-t border-white/[0.08] pt-1 mt-1 w-full break-all">
                      Dossier: <span className="text-slate-300 font-bold">{purpose.folder}/</span>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col min-w-0">
                  <span
                    className={`text-[9px] font-mono truncate w-full transition-colors ${
                      isSelected ? "text-rose-200 font-semibold" : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {orphan.url.split("/").pop()}
                  </span>
                  <span className={`text-[8px] font-bold ${isSelected ? "text-rose-400" : "text-slate-500"}`}>
                    {formatBytes(orphan.size)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Stockage Sain & Optimisé</h4>
            <p className="text-slate-400 text-[10px] max-w-sm">
              Félicitations, aucun fichier média orphelin n'a été détecté. Votre serveur est parfaitement propre !
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
