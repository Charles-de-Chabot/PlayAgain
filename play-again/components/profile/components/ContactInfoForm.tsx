"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ContactInfoFormProps {
  initialEmail: string;
  initialPhone: string | null;
}

/**
 * ContactInfoForm handles the email and phone update form with
 * isolated loading, success and error states.
 */
export default function ContactInfoForm({ initialEmail, initialPhone }: ContactInfoFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if parent props change (router.refresh)
  useEffect(() => {
    setEmail(initialEmail);
    setPhone(initialPhone || "");
  }, [initialEmail, initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de mettre à jour les informations de contact.");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden space-y-4"
    >
      {/* Neon background effect */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand-primary blur-[50px] opacity-15 pointer-events-none" />

      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <User className="w-4 h-4 text-brand-primary" />
        <h3 className="text-sm font-black uppercase italic tracking-wider text-white">
          Informations <span className="text-brand-primary">de contact</span>
        </h3>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-brand-accent/15 border border-brand-accent/30 rounded-xl flex items-center gap-2.5 text-brand-accent text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-accent" />
          <p className="font-black uppercase tracking-wider italic">Enregistré avec succès !</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            Adresse E-mail *
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
            />
            <Mail className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            Numéro de téléphone
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
            />
            <Phone className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3.5 rounded-2xl bg-linear-to-r from-brand-primary to-brand-primary/80 hover:opacity-95 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mise à jour...
          </>
        ) : (
          "Sauvegarder"
        )}
      </button>
    </form>
  );
}
