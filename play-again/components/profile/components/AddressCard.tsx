"use client";

import React, { useState } from "react";
import { Check, MapPin, Edit3, Trash2, Building, Loader2, X } from "lucide-react";
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

export interface AddressCardProps {
  address: Address;
  isAnyLoading: boolean;
  onSetDefault: (id: number) => Promise<void>;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => Promise<void>;
  defaultLoadingId: string | null;
}

/**
 * AddressCard renders an individual address card with:
 * - Default badge and glow effect
 * - Inline delete confirmation (isolated per card to avoid triggering sibling re-renders)
 * - Set-default and edit triggers
 */
export default function AddressCard({
  address,
  isAnyLoading,
  onSetDefault,
  onEdit,
  onDelete,
  defaultLoadingId,
}: AddressCardProps) {
  // Local delete confirmation state — completely isolated from parent
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDefaultLoading = defaultLoadingId === `default-${address.id}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(address.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-zinc-900/40 backdrop-blur-xl border rounded-3xl p-5 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[160px]",
        address.is_default
          ? "border-brand-accent/40 shadow-[0_0_25px_rgba(198,255,52,0.05)]"
          : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Decorative glow */}
      {address.is_default ? (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-accent blur-[50px] opacity-15 pointer-events-none" />
      ) : (
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-primary blur-2xl opacity-5 pointer-events-none" />
      )}

      {/* Card header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 transition-colors",
              address.is_default
                ? "bg-brand-accent/15 border-brand-accent/30 text-brand-accent"
                : "bg-zinc-800/50 border-white/5 text-zinc-500 group-hover:text-zinc-300"
            )}
          >
            {address.is_default ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-sm text-white leading-tight">
                {address.street_number ? `${address.street_number} ` : ""}
                {address.street_name}
              </p>
              {address.is_default && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[8px] font-black uppercase tracking-wider text-brand-accent shadow-[0_0_10px_rgba(198,255,52,0.1)]">
                  Principale
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs font-semibold">
              {address.zip_code} {address.city}
            </p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3 h-3" /> {address.country}
            </p>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        {/* Set as default */}
        <div>
          {!address.is_default && (
            <button
              type="button"
              onClick={() => onSetDefault(address.id)}
              disabled={isAnyLoading}
              className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-brand-accent/10 hover:border-brand-accent/30 hover:text-brand-accent text-[9px] font-black uppercase tracking-wider text-zinc-400 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDefaultLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Calcul...
                </>
              ) : (
                "Définir par défaut"
              )}
            </button>
          )}
        </div>

        {/* Edit + Delete */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            disabled={isAnyLoading}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
            title="Modifier l'adresse"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-red-500/20 p-1 rounded-xl transition-all">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 text-[8px] font-black uppercase text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
              >
                {isDeleting ? "..." : "OUI"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="p-1 text-[8px] font-black text-zinc-500 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={isAnyLoading}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              title="Supprimer l'adresse"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
