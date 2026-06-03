"use client";

import React, { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import ContactInfoForm from "@/components/profile/components/ContactInfoForm";
import AddressCard, { type Address } from "@/components/profile/components/AddressCard";
import AddressFormDialog, { type AddressFormData } from "@/components/profile/components/AddressFormDialog";

interface UserData {
  email: string;
  phone: string | null;
}

interface ProfileInfosManagerProps {
  initialUser: UserData;
  initialAddresses: Address[];
}

/**
 * ProfileInfosManager is the lightweight orchestrator for the profile infos page.
 * All rendering logic is delegated to:
 *   - ContactInfoForm  (email + phone)
 *   - AddressCard      (individual address tile with isolated delete confirmation)
 *   - AddressFormDialog (unified add / edit form)
 */
export function ProfileInfosManager({ initialUser, initialAddresses }: ProfileInfosManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  // Which panel is active in the left column
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Shared loading key to disable unrelated actions while one is in-flight
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync addresses list when parent refreshes data
  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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
      if (!res.ok) throw new Error(data.error || "Impossible de modifier l'adresse.");

      setAddresses((prev) =>
        prev
          .map((addr) => ({ ...addr, is_default: addr.id === addressId }))
          .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      );
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setShowCreateForm(false);
    setErrorMsg(null);
  };

  const handleDeleteAddress = async (addressId: number) => {
    setLoadingAction(`delete-${addressId}`);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de supprimer l'adresse.");

      setAddresses((prev) => {
        const deleted = prev.find((a) => a.id === addressId);
        let updated = prev.filter((a) => a.id !== addressId);
        if (deleted?.is_default && updated.length > 0) {
          updated = updated.map((a, idx) => (idx === 0 ? { ...a, is_default: true } : a));
        }
        return updated;
      });
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de la suppression.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreateAddress = async (formData: AddressFormData) => {
    if (!formData.streetName.trim() || !formData.city.trim() || !formData.zipCode.trim() || !formData.country.trim()) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoadingAction("create");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_number: formData.streetNumber.trim(),
          street_name: formData.streetName.trim(),
          city: formData.city.trim(),
          zip_code: formData.zipCode.trim(),
          country: formData.country.trim(),
          is_default: formData.isDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de sauvegarder l'adresse.");

      setAddresses((prev) => {
        const base = formData.isDefault ? prev.map((a) => ({ ...a, is_default: false })) : prev;
        return [data, ...base].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      });
      setShowCreateForm(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEditAddress = async (formData: AddressFormData) => {
    if (!editingAddress) return;
    if (!formData.streetName.trim() || !formData.city.trim() || !formData.zipCode.trim() || !formData.country.trim()) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoadingAction("edit");
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street_number: formData.streetNumber.trim(),
          street_name: formData.streetName.trim(),
          city: formData.city.trim(),
          zip_code: formData.zipCode.trim(),
          country: formData.country.trim(),
          is_default: formData.isDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de modifier l'adresse.");

      setAddresses((prev) => {
        let list = prev.map((a) => (a.id === editingAddress.id ? data : a));
        if (formData.isDefault) {
          list = list.map((a) => (a.id !== editingAddress.id ? { ...a, is_default: false } : a));
        }
        return list.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      });
      setEditingAddress(null);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de la modification.");
    } finally {
      setLoadingAction(null);
    }
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setEditingAddress(null);
    setErrorMsg(null);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingAddress(null);
    setErrorMsg(null);
  };

  const isAnyLoading = loadingAction !== null;
  const isFormLoading = loadingAction === "create" || loadingAction === "edit";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative z-10">

      {/* ── LEFT COLUMN : contact form + address form ── */}
      <div className="w-full lg:w-96 shrink-0 space-y-6">

        {/* Contact info form (email + phone) */}
        <ContactInfoForm initialEmail={initialUser.email} initialPhone={initialUser.phone} />

        {/* Global error banner for address operations */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Sidebar info panel OR add/edit form */}
        {!showCreateForm && !editingAddress ? (
          <div className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand-accent blur-[60px] opacity-15 pointer-events-none" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary pb-3 border-b border-white/5 mb-4">
              Carnet d'adresses
            </h3>
            <div className="space-y-3.5 text-xs font-semibold text-zinc-400">
              <p>
                Vous avez <span className="text-white font-bold">{addresses.length}</span> adresse(s) de livraison
                enregistrée(s).
              </p>
              <p className="leading-relaxed">
                L'adresse <span className="text-brand-accent font-bold">principale</span> sera automatiquement
                sélectionnée lors de vos achats pour un tunnel de commande instantané.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 w-full py-4 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-brand-accent" /> Nouvelle adresse
            </button>
          </div>
        ) : (
          <AddressFormDialog
            address={editingAddress}
            isLoading={isFormLoading}
            onClose={closeForm}
            onSubmit={editingAddress ? handleEditAddress : handleCreateAddress}
          />
        )}
      </div>

      {/* ── RIGHT COLUMN : address grid ── */}
      <div className="flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-primary">
                Mes adresses de livraison
              </span>
            </div>
            <h2 className="text-3xl font-black text-white leading-none tracking-tight uppercase italic">
              Adresses Enregistrées
            </h2>
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
                isAnyLoading={isAnyLoading}
                defaultLoadingId={loadingAction}
                onSetDefault={handleSetDefault}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteAddress}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="w-full rounded-4xl bg-zinc-900/40 backdrop-blur-xl border border-dashed border-white/10 p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all duration-500 shadow-2xl relative z-10">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="space-y-2 relative z-10 max-w-sm">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Aucune adresse enregistrée</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ajoutez une adresse de livraison maintenant pour accélérer vos futurs achats sur la boutique.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="relative z-10 py-3.5 px-6 rounded-2xl bg-linear-to-r from-brand-primary to-brand-accent hover:opacity-95 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_25px_rgba(125,56,255,0.4)] cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Ajouter ma première adresse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
