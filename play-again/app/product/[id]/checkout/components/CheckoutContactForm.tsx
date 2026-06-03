"use client";

import React from "react";

export interface CheckoutContactFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  saveContactToProfile: boolean;
  setSaveContactToProfile: (val: boolean) => void;
}

/**
 * CheckoutContactForm collects buyer name, email, and phone,
 * and handles custom profiling database saves.
 */
export default function CheckoutContactForm({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  saveContactToProfile,
  setSaveContactToProfile,
}: CheckoutContactFormProps) {
  return (
    <div className="space-y-4 text-left">
      <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">2. Informations de contact</h3>

      <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4 backdrop-blur-md">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nom complet *</label>
          <input
            type="text"
            placeholder="Jean Dupont"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail *</label>
            <input
              type="email"
              placeholder="jean.dupont@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Téléphone *</label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder-zinc-700"
            />
          </div>
        </div>

        {/* Toggle to save to user profile */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span
            className={`text-xs font-black transition-all duration-300 uppercase tracking-wide select-none ${
              saveContactToProfile
                ? "text-brand-primary drop-shadow-[0_0_6px_rgba(125,56,255,0.4)]"
                : "text-zinc-500"
            }`}
            style={{
              textShadow: saveContactToProfile ? "0 0 8px rgba(125, 56, 255, 0.4)" : "none",
            }}
          >
            Enregistrer ces informations dans mon profil
          </span>
          <button
            type="button"
            onClick={() => setSaveContactToProfile(!saveContactToProfile)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              saveContactToProfile ? "bg-brand-primary" : "bg-zinc-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                saveContactToProfile ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
