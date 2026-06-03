"use client";

import React from "react";

export interface Product {
  state: string;
  age?: number | string | null;
  accessory_included: boolean;
  targetGender: string;
  brand?: { label: string } | null;
  category?: { label: string } | null;
  type?: { label: string } | null;
  size?: { label: string } | null;
}

export interface ProductTechnicalSpecsProps {
  product: Product;
}

const GENDER_LABELS: Record<string, string> = {
  MAN: "Homme",
  WOMAN: "Femme",
  UNISEX: "Unisexe / Mixte",
  KIDS: "Enfant",
};

export default function ProductTechnicalSpecs({ product }: ProductTechnicalSpecsProps) {
  return (
    <div className="space-y-6 text-left">
      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
        Spécifications techniques
      </h2>

      <div className="grid grid-cols-2 gap-y-6 gap-x-12">
        <DetailItem label="Marque" value={product.brand?.label || "Non spécifié"} />
        <DetailItem label="Taille" value={product.size?.label || "N/A"} />
        <DetailItem label="Type" value={product.type?.label || "Sport"} />
        <DetailItem label="État" value={product.state.replace("_", " ")} />
        <DetailItem label="Année" value={product.age ? `${product.age}` : "N/A"} />
        <DetailItem label="Accessoires" value={product.accessory_included ? "Inclus" : "Non"} />
        <DetailItem label="Public" value={GENDER_LABELS[product.targetGender] || "Unisexe / Mixte"} />
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-zinc-650 uppercase tracking-widest">{label}</p>
      <p className="text-white font-bold text-sm uppercase tracking-tight">{value}</p>
    </div>
  );
}
