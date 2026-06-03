"use client";

import React from "react";
import { Tags, GitMerge } from "lucide-react";
import { Brand } from "@/hooks/useTaxonomy";

export interface UserAddedBrandsListProps {
  userAddedBrands: Brand[];
  setMergeSourceId: (id: string) => void;
  setMergeSearchSource: (label: string) => void;
  handleValidateUserBrand: (brand: Brand) => void;
  actionLoading: boolean;
}

/**
 * UserAddedBrandsList renders provisional brand entries created by platform users.
 */
export default function UserAddedBrandsList({
  userAddedBrands,
  setMergeSourceId,
  setMergeSearchSource,
  handleValidateUserBrand,
  actionLoading,
}: UserAddedBrandsListProps) {
  return (
    <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-5 relative">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Marques ajoutées par les utilisateurs
          </h3>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-extrabold">
          {userAddedBrands.length} inédite(s)
        </span>
      </div>

      {userAddedBrands.length === 0 ? (
        <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl text-center text-slate-500 font-bold text-xs">
          Aucune marque inédite ajoutée par les utilisateurs.
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {userAddedBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 p-4 rounded-2xl flex flex-col gap-3 transition-all relative group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                  À valider / fusionner
                </span>
                <span className="text-[9px] text-slate-500 font-bold font-mono">ID: #{brand.id}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-white bg-black/30 p-2.5 rounded-xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-slate-300 font-extrabold uppercase tracking-wider">{brand.label}</span>
                  <span className="text-[9px] text-slate-500 font-semibold">{brand.productCount} annonce(s)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMergeSourceId(brand.id.toString());
                    setMergeSearchSource(brand.label);
                  }}
                  className="flex-1 bg-white/5 hover:bg-emerald-500/10 text-white hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 text-[10px] font-extrabold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Fusionner</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleValidateUserBrand(brand)}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold py-2 px-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
