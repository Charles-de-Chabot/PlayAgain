"use client";

import React, { useState } from "react";
import { Plus, Percent, DollarSign, Calendar, Ticket, Loader2 } from "lucide-react";

export interface PromoCodeFormProps {
  categoriesList: any[];
  actionLoading: boolean;
  onCreateCoupon: (couponData: {
    code: string;
    discountPercent: string;
    minBasketAmount: string;
    expiresAt: string;
    categoryId: string;
    typeId: string;
  }) => Promise<boolean>;
}

export default function PromoCodeForm({
  categoriesList,
  actionLoading,
  onCreateCoupon,
}: PromoCodeFormProps) {
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [minBasketAmount, setMinBasketAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountPercent || !minBasketAmount || !expiresAt) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const success = await onCreateCoupon({
      code: code.trim(),
      discountPercent,
      minBasketAmount,
      expiresAt,
      categoryId: selectedCategory,
      typeId: selectedType,
    });

    if (success) {
      setCode("");
      setDiscountPercent("");
      setMinBasketAmount("");
      setExpiresAt("");
      setSelectedCategory("");
      setSelectedType("");
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 text-left">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 flex items-center gap-2 font-sans">
        <Plus className="w-4 h-4 text-emerald-400" />
        <span>Nouveau Code Promo</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Code */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Nom du Code</label>
          <input
            type="text"
            placeholder="Ex: TENNIS2026, HOLIDAYS..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono font-bold"
          />
        </div>

        {/* Pourcentage de réduction */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Pourcentage de Réduction</label>
          <div className="relative flex items-center">
            <Percent className="absolute left-3.5 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min="1"
              max="100"
              placeholder="Ex: 10"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
            />
          </div>
        </div>

        {/* Montant minimum d'achat */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Panier Minimum (€)</label>
          <div className="relative flex items-center">
            <DollarSign className="absolute left-3.5 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 50.00"
              value={minBasketAmount}
              onChange={(e) => setMinBasketAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
            />
          </div>
        </div>

        {/* Date d'expiration */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Date d'Expiration</label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch (err) {}
              }}
              onFocus={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch (err) {}
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
            />
            <style>{`
              input[type="date"]::-webkit-calendar-picker-indicator {
                filter: invert(1);
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
              }
              input[type="date"]::-webkit-calendar-picker-indicator:hover {
                opacity: 1;
              }
            `}</style>
          </div>
        </div>

        {/* Restriction Catégorie */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Restriction Catégorie (Optionnel)</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedType(""); // reset type on category change
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
          >
            <option value="">Toutes les catégories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Restriction Type de Produit (Affiché seulement si catégorie sélectionnée) */}
        {selectedCategory && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Restriction Type (Optionnel)</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
            >
              <option value="">Tous les types d'articles</option>
              {(categoriesList.find((cat) => cat.id === parseInt(selectedCategory))?.types || []).map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bouton de Soumission */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2 border-0"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Ticket className="w-4 h-4" />
              <span>Enregistrer le code</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
