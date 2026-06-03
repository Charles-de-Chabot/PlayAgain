"use client";

import React from "react";
import { Plus, MapPin, Check } from "lucide-react";

export interface Address {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
}

export interface CheckoutAddressSelectorProps {
  addresses: Address[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number) => void;
  showNewAddressForm: boolean;
  setShowNewAddressForm: (val: boolean) => void;
  newStreetNumber: string;
  setNewStreetNumber: (val: string) => void;
  newStreetName: string;
  setNewStreetName: (val: string) => void;
  newCity: string;
  setNewCity: (val: string) => void;
  newZipCode: string;
  setNewZipCode: (val: string) => void;
  newCountry: string;
  setNewCountry: (val: string) => void;
  saveAddressToProfile: boolean;
  setSaveAddressToProfile: (val: boolean) => void;
}

/**
 * CheckoutAddressSelector manages existing saved shipping addresses list
 * and collects details for a new checkout address.
 */
export default function CheckoutAddressSelector({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  showNewAddressForm,
  setShowNewAddressForm,
  newStreetNumber,
  setNewStreetNumber,
  newStreetName,
  setNewStreetName,
  newCity,
  setNewCity,
  newZipCode,
  setNewZipCode,
  newCountry,
  setNewCountry,
  saveAddressToProfile,
  setSaveAddressToProfile,
}: CheckoutAddressSelectorProps) {
  return (
    <div className="space-y-4 text-left animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">3. Adresse d'expédition</h3>
        {addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowNewAddressForm(!showNewAddressForm)}
            className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showNewAddressForm ? "Utiliser mes adresses" : "Nouvelle adresse"}</span>
          </button>
        )}
      </div>

      {showNewAddressForm ? (
        // Formulaire nouvelle adresse
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">N°</label>
              <input
                type="text"
                placeholder="12"
                value={newStreetNumber}
                onChange={(e) => setNewStreetNumber(e.target.value)}
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-750"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rue *</label>
              <input
                type="text"
                placeholder="Rue des Sports"
                value={newStreetName}
                onChange={(e) => setNewStreetName(e.target.value)}
                required
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-750"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ville *</label>
              <input
                type="text"
                placeholder="Paris"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                required
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-750"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Code Postal *</label>
              <input
                type="text"
                placeholder="75001"
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                required
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-750"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pays *</label>
            <input
              type="text"
              placeholder="France"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              required
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-750"
            />
          </div>

          {/* Toggle to save address to profile */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span
              className={`text-xs font-black transition-all duration-300 uppercase tracking-wide select-none ${
                saveAddressToProfile
                  ? "text-brand-primary drop-shadow-[0_0_6px_rgba(125,56,255,0.4)]"
                  : "text-zinc-500"
              }`}
              style={{
                textShadow: saveAddressToProfile ? "0 0 8px rgba(125, 56, 255, 0.4)" : "none",
              }}
            >
              Sauvegarder cette adresse pour mes futurs achats
            </span>

            <button
              type="button"
              onClick={() => setSaveAddressToProfile(!saveAddressToProfile)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none ${
                saveAddressToProfile ? "bg-brand-primary" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  saveAddressToProfile ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        // Liste d'adresses
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <button
              key={address.id}
              type="button"
              onClick={() => setSelectedAddressId(address.id)}
              className={`p-4 rounded-xl border text-left flex gap-3 transition-all relative cursor-pointer ${
                selectedAddressId === address.id
                  ? "bg-zinc-900/60 border-brand-primary/50"
                  : "bg-zinc-900/10 border-white/5 hover:border-white/10"
              }`}
            >
              <MapPin
                className={`w-5 h-5 shrink-0 ${
                  selectedAddressId === address.id ? "text-brand-primary" : "text-zinc-500"
                }`}
              />
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">
                  {address.street_number ? `${address.street_number} ` : ""}
                  {address.street_name}
                </p>
                <p className="text-zinc-400 mt-0.5">
                  {address.zip_code} {address.city}
                </p>
                <p className="text-zinc-500 mt-0.5">{address.country}</p>
              </div>
              {selectedAddressId === address.id && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white fill-current" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
