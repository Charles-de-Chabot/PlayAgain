"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface StorageIndicatorsProps {
  stats: {
    totalStorageUsedBytes: number;
    orphansCount: number;
    orphansStorageSizeDeltaBytes: number;
    dbMediaCount: number;
  };
  loading: boolean;
  onRefresh: () => void;
  formatBytes: (bytes: number) => string;
}

export default function StorageIndicators({
  stats,
  loading,
  onRefresh,
  formatBytes,
}: StorageIndicatorsProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 items-center text-center">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 w-full font-sans">
        Indicateurs de Stockage
      </h2>

      {/* SVG GAUGE 1 : Stockage Total Occupé */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-36 h-36 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#06B6D4"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="264"
              strokeDashoffset="75" // Remplissage dynamique à ~70%
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-black text-white">{formatBytes(stats.totalStorageUsedBytes)}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Stocké</span>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Volume Total Médias</span>
      </div>

      {/* SVG GAUGE 2 : Volume d'Orphelins (Perte) */}
      <div className="flex flex-col items-center space-y-2 border-t border-white/[0.04] pt-6 w-full">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-36 h-36 relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none bg-transparent border-0"
          title="Cliquez pour rafraîchir les fichiers orphelins"
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={stats.orphansCount > 0 ? "#F43F5E" : "#10B981"}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="264"
              strokeDashoffset={stats.orphansCount > 0 ? "230" : "264"} // Décalage dynamique proportionnel
              className="transition-all duration-1000 group-hover:stroke-rose-400"
            />
          </svg>
          <div className="absolute flex flex-col items-center select-none">
            {loading ? (
              <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
            ) : (
              <>
                <span className="text-sm font-black text-white group-hover:text-rose-400 transition-colors duration-300">
                  {stats.orphansCount}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-rose-500 transition-colors duration-300">
                  Fichiers
                </span>
              </>
            )}
          </div>
        </button>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Images Orphelines</span>
        {stats.orphansCount > 0 && (
          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
            {formatBytes(stats.orphansStorageSizeDeltaBytes)} Récupérables
          </span>
        )}
      </div>
    </div>
  );
}
