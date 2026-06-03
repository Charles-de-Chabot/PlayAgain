"use client";

import React, { useState, useEffect } from "react";
import { Globe, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Address {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface AddressFormData {
  streetNumber: string;
  streetName: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressFormDialogProps {
  /** When provided, form is in edit mode and fields are pre-filled */
  address?: Address | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
}

const INPUT_CLASS =
  "w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700";

/**
 * AddressFormDialog is a unified add/edit address form.
 * In edit mode it pre-fills values from the `address` prop.
 * The form drives its own field state, but delegates the async submit to the parent.
 */
export default function AddressFormDialog({
  address,
  isLoading,
  onClose,
  onSubmit,
}: AddressFormDialogProps) {
  const isEditing = !!address;

  const [streetNumber, setStreetNumber] = useState(address?.street_number ?? "");
  const [streetName, setStreetName] = useState(address?.street_name ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [zipCode, setZipCode] = useState(address?.zip_code ?? "");
  const [country, setCountry] = useState(address?.country ?? "France");
  const [isDefault, setIsDefault] = useState(address?.is_default ?? true);

  // Re-sync when the address prop changes (switching from one edit to another)
  useEffect(() => {
    setStreetNumber(address?.street_number ?? "");
    setStreetName(address?.street_name ?? "");
    setCity(address?.city ?? "");
    setZipCode(address?.zip_code ?? "");
    setCountry(address?.country ?? "France");
    setIsDefault(address?.is_default ?? true);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ streetNumber, streetName, city, zipCode, country, isDefault });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4 relative overflow-hidden animate-fade-in"
    >
      <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-brand-primary blur-2xl opacity-15 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h4 className="text-xs font-black uppercase italic tracking-wider text-white">
          {isEditing ? (
            <>
              Modifier <span className="text-brand-primary">l'adresse</span>
            </>
          ) : (
            <>
              Ajouter une <span className="text-brand-primary">adresse</span>
            </>
          )}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Street number + name */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">N°</label>
          <input
            type="text"
            placeholder="12 bis"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Rue *</label>
          <input
            type="text"
            placeholder="Rue Olympique"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* City + Zip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Ville *</label>
          <input
            type="text"
            placeholder="Marseille"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Code postal *</label>
          <input
            type="text"
            placeholder="13008"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Country */}
      <div className="space-y-1">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Pays *</label>
        <div className="relative">
          <input
            type="text"
            placeholder="France"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className={cn(INPUT_CLASS, "pl-9")}
          />
          <Globe className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Toggle Default */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span
          className={cn(
            "text-xs font-black transition-all duration-300 uppercase tracking-wide select-none",
            isDefault ? "text-brand-accent" : "text-zinc-500"
          )}
          style={{ textShadow: isDefault ? "0 0 8px rgba(198, 255, 52, 0.2)" : "none" }}
        >
          Définir par défaut (principale)
        </span>
        <button
          type="button"
          onClick={() => setIsDefault((p) => !p)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            isDefault ? "bg-brand-accent" : "bg-zinc-800"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
              isDefault ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-brand-primary text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand-primary/90 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isEditing ? "Enregistrement..." : "Création..."}
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </form>
  );
}
