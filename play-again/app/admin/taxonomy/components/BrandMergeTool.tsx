"use client";

import React, { useState } from "react";
import { GitMerge, Loader2 } from "lucide-react";
import { Brand } from "@/hooks/useTaxonomy";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface BrandMergeToolProps {
  mergeSourceId: string;
  setMergeSourceId: (id: string) => void;
  mergeTargetId: string;
  setMergeTargetId: (id: string) => void;
  mergeSearchSource: string;
  setMergeSearchSource: (label: string) => void;
  mergeSearchTarget: string;
  setMergeSearchTarget: (label: string) => void;
  mergeSourceSuggestions: Brand[];
  mergeTargetSuggestions: Brand[];
  actionLoading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

/**
 * BrandMergeTool allows merging a provisional/duplicate brand into a clean official target brand.
 */
export default function BrandMergeTool({
  mergeSourceId,
  setMergeSourceId,
  mergeTargetId,
  setMergeTargetId,
  mergeSearchSource,
  setMergeSearchSource,
  mergeSearchTarget,
  setMergeSearchTarget,
  mergeSourceSuggestions,
  mergeTargetSuggestions,
  actionLoading,
  onSubmit,
}: BrandMergeToolProps) {
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const sourceRef = useOutsideClick<HTMLDivElement>(() => setShowSourceDropdown(false));
  const targetRef = useOutsideClick<HTMLDivElement>(() => setShowTargetDropdown(false));

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
        <GitMerge className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xs font-black text-white uppercase tracking-wider">
          Outil de Fusion-Marque (Merge Tool)
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 text-xs">
        {/* Source provisoire */}
        <div className="space-y-1.5 relative" ref={sourceRef}>
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Marque doublon / provisoire à fusionner
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher marque à supprimer..."
              value={mergeSearchSource}
              onChange={(e) => {
                setMergeSearchSource(e.target.value);
                setMergeSourceId("");
                setShowSourceDropdown(true);
              }}
              onFocus={() => setShowSourceDropdown(true)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
            />
            {mergeSourceId && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase">
                Sélectionné
              </span>
            )}
          </div>

          {/* Suggestions d'autocomplétion */}
          {showSourceDropdown && mergeSourceSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5">
              {mergeSourceSuggestions.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setMergeSourceId(b.id.toString());
                    setMergeSearchSource(b.label);
                    setShowSourceDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                >
                  <span>{b.label}</span>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">{b.productCount} annonces</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Flèche de fusion */}
        <div className="flex justify-center my-1 select-none">
          <div className="p-2 rounded-full bg-black/60 border border-white/5 text-slate-500">
            <GitMerge className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Cible officielle */}
        <div className="space-y-1.5 relative" ref={targetRef}>
          <label className="text-[10px] text-slate-500 font-bold uppercase">
            Marque cible officielle (conserver)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher marque officielle..."
              value={mergeSearchTarget}
              onChange={(e) => {
                setMergeSearchTarget(e.target.value);
                setMergeTargetId("");
                setShowTargetDropdown(true);
              }}
              onFocus={() => setShowTargetDropdown(true)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
            />
            {mergeTargetId && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase">
                Sélectionné
              </span>
            )}
          </div>

          {/* Suggestions d'autocomplétion */}
          {showTargetDropdown && mergeTargetSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-[#111625] border border-white/10 rounded-xl mt-1 shadow-2xl overflow-hidden divide-y divide-white/5">
              {mergeTargetSuggestions.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setMergeTargetId(b.id.toString());
                    setMergeSearchTarget(b.label);
                    setShowTargetDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between"
                >
                  <span>{b.label}</span>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">{b.productCount} annonces</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={actionLoading || !mergeSourceId || !mergeTargetId}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <GitMerge className="w-4 h-4" />
              <span>Fusionner et corriger les annonces</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
