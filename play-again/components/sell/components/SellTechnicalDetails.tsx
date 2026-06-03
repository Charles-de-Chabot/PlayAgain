"use client";

import React from "react";
import { Autocomplete } from "@/components/ui/Autocomplete";

export interface SellTechnicalDetailsProps {
  categories: any[];
  brands: any[];
  types: (any & { sizes: any[] })[];
  categoryId: string;
  typeId: string;
  brandId: string;
  sizeId: string;
  quantity: string;
  onSelectCategory: (id: string) => void;
  onSelectType: (id: string) => void;
  onSelectBrand: (id: string) => void;
  onSelectSize: (id: string) => void;
  onQuantityChange: (delta: number) => void;
  onChangeQuantityDirect: (val: string) => void;
}

export default function SellTechnicalDetails({
  categories,
  brands,
  types,
  categoryId,
  typeId,
  brandId,
  sizeId,
  quantity,
  onSelectCategory,
  onSelectType,
  onSelectBrand,
  onSelectSize,
  onQuantityChange,
  onChangeQuantityDirect,
}: SellTechnicalDetailsProps) {
  // Dynamic filtering of types based on category selection
  const filteredTypes = categoryId ? types.filter((t) => t.category_id === parseInt(categoryId)) : types;

  // Dynamic filtering of sizes based on type selection
  const filteredSizes = typeId ? types.find((t) => t.id.toString() === typeId)?.sizes || [] : [];

  return (
    <section className="relative z-30 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left">
      <div className="space-y-8">
        {/* Category / Type / Brand - Grid 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Autocomplete
            label="Catégorie"
            placeholder="Ex: Sports d'hiver"
            items={categories}
            selectedId={categoryId}
            onSelect={onSelectCategory}
          />
          <Autocomplete
            label="Type"
            placeholder={categoryId ? "Ex: Skis Alpins" : "Choisissez une catégorie"}
            items={filteredTypes}
            selectedId={typeId}
            onSelect={onSelectType}
          />
          <Autocomplete
            label="Marque"
            placeholder="Ex: Rossignol"
            items={brands}
            selectedId={brandId}
            onSelect={onSelectBrand}
          />
        </div>

        {/* Size & Quantity - Grid 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Autocomplete
            label="Taille"
            placeholder={typeId ? "Ex: 42, L, 170cm..." : "Choisissez un type"}
            items={filteredSizes}
            selectedId={sizeId}
            onSelect={onSelectSize}
          />
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic font-sans">
              Quantité disponible
            </label>
            <div className="flex bg-zinc-950/50 border border-white/10">
              <button
                type="button"
                onClick={() => onQuantityChange(-1)}
                className="px-6 py-4 hover:bg-white/5 transition-colors text-zinc-500 hover:text-white font-bold cursor-pointer bg-transparent border-0"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onChangeQuantityDirect(e.target.value)}
                className="w-full bg-transparent text-center focus:outline-none font-black text-brand-accent border-0"
              />
              <button
                type="button"
                onClick={() => onQuantityChange(1)}
                className="px-6 py-4 hover:bg-white/5 transition-colors text-zinc-500 hover:text-white font-bold cursor-pointer bg-transparent border-0"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
