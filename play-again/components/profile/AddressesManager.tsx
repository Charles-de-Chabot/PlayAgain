"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import AddressCard, { type Address } from "./components/AddressCard";
import AddressFormDialog, { type AddressFormData } from "./components/AddressFormDialog";

interface AddressesManagerProps {
  initialAddresses: Address[];
}

/**
 * AddressesManager manages the user's saved shipping addresses.
 * It coordinates selection, setting primary address, creation, and deletion
 * by delegating UI presentation to AddressCard and AddressFormDialog.
 */
export function AddressesManager({ initialAddresses }: AddressesManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  // Navigation states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Loading & error states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronise addresses with props changes
  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  // Handle open Edit form
  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setShowCreateForm(false);
    setErrorMsg(null);
  };

  // Set address as default/primary
  const handleSetDefault = async (addressId: number) => {
    setLoadingAction(`default-${addressId}`);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de modifier l'adresse.");
      }

      // Update state locally
      setAddresses((prev) =>
        prev
          .map((addr) => ({
            ...addr,
            is_default: addr.id === addressId,
          }))
          .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      );
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Create address
  const handleCreateSubmit = async (formData: AddressFormData) => {
    setLoadingAction("create");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_number: formData.streetNumber.trim() || null,
          street_name: formData.streetName.trim(),
          city: formData.city.trim(),
          zip_code: formData.zipCode.trim(),
          country: formData.country.trim(),
          is_default: formData.isDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de sauvegarder l'adresse.");
      }

      // Automatically set list with new address at the top if isDefault is true
      setAddresses((prev) => {
        const nextList = formData.isDefault ? prev.map((addr) => ({ ...addr, is_default: false })) : prev;
        return [data, ...nextList].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      });

      setShowCreateForm(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Edit address
  const handleEditSubmit = async (formData: AddressFormData) => {
    if (!editingAddress) return;

    setLoadingAction("edit");
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_number: formData.streetNumber.trim() || null,
          street_name: formData.streetName.trim(),
          city: formData.city.trim(),
          zip_code: formData.zipCode.trim(),
          country: formData.country.trim(),
          is_default: formData.isDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de modifier l'adresse.");
      }

      // Update state locally
      setAddresses((prev) => {
        let list = prev.map((addr) => (addr.id === editingAddress.id ? data : addr));
        if (formData.isDefault) {
          list = list.map((addr) => (addr.id !== editingAddress.id ? { ...addr, is_default: false } : addr));
        }
        return list.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      });

      setEditingAddress(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la modification.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete address
  const handleDelete = async (addressId: number) => {
    setLoadingAction(`delete-${addressId}`);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de supprimer l'adresse.");
      }

      const deletedAddress = addresses.find((addr) => addr.id === addressId);
      let updatedList = addresses.filter((addr) => addr.id !== addressId);

      // If we deleted the default address, and other addresses remain, one becomes default automatically
      if (deletedAddress?.is_default && updatedList.length > 0) {
        updatedList = updatedList.map((addr, idx) => (idx === 0 ? { ...addr, is_default: true } : addr));
      }

      setAddresses(updatedList);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la suppression.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative z-10 text-left">
      {/* ================= GAUCHE / FORMULAIRES ================= */}
      <div className="w-full lg:w-96 shrink-0 space-y-6">
        {/* Navigation Info */}
        <div className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand-primary blur-[60px] opacity-25 pointer-events-none" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary pb-3 border-b border-white/5 mb-4">
            Mon Tableau d'adresses
          </h3>

          <div className="space-y-3.5 text-xs font-semibold text-zinc-400">
            <p>
              Vous avez <span className="text-white font-bold">{addresses.length}</span> adresse(s) de livraison
              enregistrée(s).
            </p>
            <p className="leading-relaxed">
              L'adresse <span className="text-brand-accent font-bold">principale</span> sera automatiquement sélectionnée
              lors de vos achats pour un tunnel de commande instantané.
            </p>
          </div>

          {!showCreateForm && !editingAddress && (
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingAddress(null);
                setErrorMsg(null);
              }}
              className="mt-6 w-full py-4 rounded-2xl bg-linear-to-r from-brand-primary to-brand-primary/80 hover:opacity-95 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvelle adresse
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-bold">{errorMsg}</p>
          </div>
        )}

        {/* Form Dialog (Add / Edit) */}
        {(showCreateForm || editingAddress) && (
          <AddressFormDialog
            address={editingAddress}
            isLoading={loadingAction === "create" || loadingAction === "edit"}
            onClose={() => {
              setShowCreateForm(false);
              setEditingAddress(null);
              setErrorMsg(null);
            }}
            onSubmit={editingAddress ? handleEditSubmit : handleCreateSubmit}
          />
        )}
      </div>

      {/* ================= DROITE / LISTE DES ADRESSES ================= */}
      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-primary">Vos Carnets</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-none tracking-tight">Adresses Enregistrées</h2>
          </div>
          <p className="text-zinc-400 text-sm font-semibold sm:text-right">
            {addresses.length} {addresses.length > 1 ? "adresses disponibles" : "adresse disponible"}
          </p>
        </div>

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isAnyLoading={loadingAction !== null}
                onSetDefault={handleSetDefault}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                defaultLoadingId={loadingAction}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="w-full rounded-4xl bg-zinc-900/40 backdrop-blur-xl border border-dashed border-white/10 p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-550 group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all duration-500 shadow-2xl relative z-10">
              <Plus className="w-7 h-7" />
            </div>

            <div className="space-y-2 relative z-10 max-w-sm">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Aucune adresse enregistrée</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ajoutez une adresse de livraison maintenant pour accélérer vos futurs achats sur la boutique.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingAddress(null);
                setErrorMsg(null);
              }}
              className="relative z-10 py-3.5 px-6 rounded-2xl bg-linear-to-r from-brand-primary to-brand-accent hover:opacity-95 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_25px_rgba(125,56,255,0.4)] cursor-pointer flex items-center gap-2 group/btn"
            >
              <Plus className="w-4 h-4" /> Ajouter ma première adresse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
