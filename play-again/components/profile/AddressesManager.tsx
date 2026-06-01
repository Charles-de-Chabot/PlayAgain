"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  X, 
  Globe, 
  Building,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

interface AddressesManagerProps {
  initialAddresses: Address[];
}

export function AddressesManager({ initialAddresses }: AddressesManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  
  // Navigation states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form states (Add Form)
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("France");
  const [isDefault, setIsDefault] = useState(true); // By default true as requested

  // Form states (Edit Form)
  const [editStreetNumber, setEditStreetNumber] = useState("");
  const [editStreetName, setEditStreetName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editIsDefault, setEditIsDefault] = useState(false);

  // Synchronise addresses with props changes
  React.useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  // Handle open Edit form
  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setEditStreetNumber(address.street_number || "");
    setEditStreetName(address.street_name);
    setEditZipCode(address.zip_code);
    setEditCity(address.city);
    setEditCountry(address.country);
    setEditIsDefault(address.is_default);
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
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        })).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
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
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName.trim() || !city.trim() || !zipCode.trim() || !country.trim()) {
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
          street_number: streetNumber.trim(),
          street_name: streetName.trim(),
          city: city.trim(),
          zip_code: zipCode.trim(),
          country: country.trim(),
          is_default: isDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de sauvegarder l'adresse.");
      }

      // Automatically set list with new address at the top if is_default is true
      setAddresses(prev => {
        const nextList = isDefault 
          ? prev.map(addr => ({ ...addr, is_default: false })) 
          : prev;
        return [data, ...nextList].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      });

      // Reset form
      setStreetNumber("");
      setStreetName("");
      setCity("");
      setZipCode("");
      setCountry("France");
      setIsDefault(true);
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
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    if (!editStreetName.trim() || !editCity.trim() || !editZipCode.trim() || !editCountry.trim()) {
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
          street_number: editStreetNumber.trim(),
          street_name: editStreetName.trim(),
          city: editCity.trim(),
          zip_code: editZipCode.trim(),
          country: editCountry.trim(),
          is_default: editIsDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de modifier l'adresse.");
      }

      // Update state locally
      setAddresses(prev => {
        let list = prev.map(addr => addr.id === editingAddress.id ? data : addr);
        if (editIsDefault) {
          list = list.map(addr => addr.id !== editingAddress.id ? { ...addr, is_default: false } : addr);
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

      const deletedAddress = addresses.find(addr => addr.id === addressId);
      let updatedList = addresses.filter(addr => addr.id !== addressId);

      // If we deleted the default address, and other addresses remain, one becomes default automatically (handled by API)
      // Let's reflect it in state
      if (deletedAddress?.is_default && updatedList.length > 0) {
        // API will set the most recent to default, let's find it (first in list after sorting)
        updatedList = updatedList.map((addr, idx) => idx === 0 ? { ...addr, is_default: true } : addr);
      }

      setAddresses(updatedList);
      setDeletingId(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue lors de la suppression.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative z-10">
      
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
              Vous avez <span className="text-white font-bold">{addresses.length}</span> adresse(s) de livraison enregistrée(s).
            </p>
            <p className="leading-relaxed">
              L'adresse <span className="text-brand-accent font-bold">principale</span> sera automatiquement sélectionnée lors de vos achats pour un tunnel de commande instantané.
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

        {/* A. FORMULAIRE DE CRÉATION */}
        {showCreateForm && (
          <form 
            onSubmit={handleCreate} 
            className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-brand-primary blur-[40px] opacity-15 pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="text-sm font-black uppercase italic tracking-wider text-white">
                Ajouter une <span className="text-brand-primary">adresse</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)} 
                className="p-1.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">N°</label>
                <input
                  type="text"
                  placeholder="12 bis"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
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
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Ville *</label>
                <input
                  type="text"
                  placeholder="Marseille"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
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
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Pays *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="France"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
                <Globe className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Toggle Principal/Default */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span 
                className={cn(
                  "text-xs font-black transition-all duration-300 uppercase tracking-wide select-none",
                  isDefault ? "text-brand-accent" : "text-zinc-500"
                )}
                style={{
                  textShadow: isDefault ? "0 0 8px rgba(198, 255, 52, 0.2)" : "none"
                }}
              >
                Définir par défaut (principale)
              </span>
              <button
                type="button"
                onClick={() => setIsDefault(!isDefault)}
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

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setErrorMsg(null);
                }}
                disabled={loadingAction === "create"}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loadingAction === "create"}
                className="px-4 py-2 rounded-xl bg-brand-primary text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand-primary/90 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loadingAction === "create" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        )}

        {/* B. FORMULAIRE D'ÉDITION */}
        {editingAddress && (
          <form 
            onSubmit={handleEdit} 
            className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-brand-primary blur-[40px] opacity-15 pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h4 className="text-sm font-black uppercase italic tracking-wider text-white">
                Modifier <span className="text-brand-primary">l'adresse</span>
              </h4>
              <button 
                type="button" 
                onClick={() => setEditingAddress(null)} 
                className="p-1.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">N°</label>
                <input
                  type="text"
                  placeholder="12 bis"
                  value={editStreetNumber}
                  onChange={(e) => setEditStreetNumber(e.target.value)}
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Rue *</label>
                <input
                  type="text"
                  placeholder="Rue des Champions"
                  value={editStreetName}
                  onChange={(e) => setEditStreetName(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Ville *</label>
                <input
                  type="text"
                  placeholder="Lyon"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Code postal *</label>
                <input
                  type="text"
                  placeholder="69002"
                  value={editZipCode}
                  onChange={(e) => setEditZipCode(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Pays *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="France"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  required
                  className="w-full h-11 bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
                <Globe className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Toggle Principal/Default */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span 
                className={cn(
                  "text-xs font-black transition-all duration-300 uppercase tracking-wide select-none",
                  editIsDefault ? "text-brand-accent" : "text-zinc-500"
                )}
                style={{
                  textShadow: editIsDefault ? "0 0 8px rgba(198, 255, 52, 0.2)" : "none"
                }}
              >
                Définir par défaut (principale)
              </span>
              <button
                type="button"
                onClick={() => setEditIsDefault(!editIsDefault)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  editIsDefault ? "bg-brand-accent" : "bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                    editIsDefault ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setErrorMsg(null);
                }}
                disabled={loadingAction === "edit"}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loadingAction === "edit"}
                className="px-4 py-2 rounded-xl bg-brand-primary text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand-primary/90 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loadingAction === "edit" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </button>
            </div>
          </form>
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
            <h2 className="text-3xl font-black text-white leading-none tracking-tight">
              Adresses Enregistrées
            </h2>
          </div>
          <p className="text-zinc-400 text-sm font-semibold sm:text-right">
            {addresses.length} {addresses.length > 1 ? "adresses disponibles" : "adresse disponible"}
          </p>
        </div>

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((address) => {
              const isDefaultAddr = address.is_default;
              const isDefaultLoading = loadingAction === `default-${address.id}`;
              const isDeleteLoading = loadingAction === `delete-${address.id}`;
              const isAnyLoading = loadingAction !== null;

              return (
                <div 
                  key={address.id}
                  className={cn(
                    "bg-zinc-900/40 backdrop-blur-xl border rounded-3xl p-5 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[160px]",
                    isDefaultAddr 
                      ? "border-brand-accent/40 shadow-[0_0_25px_rgba(198,255,52,0.05)]" 
                      : "border-white/5 hover:border-white/10"
                  )}
                >
                  {/* Glowing decorative gradient */}
                  {isDefaultAddr ? (
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-accent blur-[50px] opacity-15 pointer-events-none" />
                  ) : (
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-brand-primary blur-[40px] opacity-5 pointer-events-none" />
                  )}

                  {/* Header de la carte */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        "w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 transition-colors",
                        isDefaultAddr 
                          ? "bg-brand-accent/15 border-brand-accent/30 text-brand-accent" 
                          : "bg-zinc-855/50 border-white/5 text-zinc-500 group-hover:text-zinc-300"
                      )}>
                        {isDefaultAddr ? <Check className="w-4.5 h-4.5" /> : <MapPin className="w-4.5 h-4.5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-sm text-white group-hover:text-white leading-tight">
                            {address.street_number ? `${address.street_number} ` : ""}{address.street_name}
                          </p>
                          {isDefaultAddr && (
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

                  {/* Boutons d'actions */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    
                    {/* Action par défaut */}
                    <div>
                      {!isDefaultAddr && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
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

                    {/* Actions de modification / suppression */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(address)}
                        disabled={isAnyLoading}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                        title="Modifier l'adresse"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {deletingId === address.id ? (
                        <div className="flex items-center gap-1 bg-zinc-950/80 border border-red-500/20 p-1 rounded-xl transition-all">
                          <button
                            onClick={() => handleDelete(address.id)}
                            disabled={isDeleteLoading}
                            className="px-2 py-1 text-[8px] font-black uppercase text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          >
                            {isDeleteLoading ? "..." : "OUI"}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            disabled={isDeleteLoading}
                            className="p-1 text-[8px] font-black text-zinc-500 hover:text-white rounded-lg cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(address.id)}
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
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="w-full rounded-4xl bg-zinc-900/40 backdrop-blur-xl border border-dashed border-white/10 p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
            <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-550 group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all duration-500 shadow-2xl relative z-10">
              <MapPin className="w-7 h-7" />
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
