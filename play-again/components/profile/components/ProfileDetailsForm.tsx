"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, AtSign, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ProfileDetailsFormProps {
  initialUser: {
    email: string;
    phone: string | null;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
  };
}

/**
 * ProfileDetailsForm renders contact fields on the left and identity fields on the right.
 * The submit button is placed in the header, with a pulsing violet-and-green glow when fields are modified.
 */
export default function ProfileDetailsForm({ initialUser }: ProfileDetailsFormProps) {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState(initialUser.email);
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [username, setUsername] = useState(initialUser.username || "");
  const [firstname, setFirstname] = useState(initialUser.firstname || "");
  const [lastname, setLastname] = useState(initialUser.lastname || "");

  // Status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if parent updates
  useEffect(() => {
    setEmail(initialUser.email);
    setPhone(initialUser.phone || "");
    setUsername(initialUser.username || "");
    setFirstname(initialUser.firstname || "");
    setLastname(initialUser.lastname || "");
  }, [initialUser]);

  // Check if any field has been modified compared to initial state
  const isDirty =
    email !== initialUser.email ||
    phone !== (initialUser.phone || "") ||
    username !== (initialUser.username || "") ||
    firstname !== (initialUser.firstname || "") ||
    lastname !== (initialUser.lastname || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || null,
          phone: phone.trim() || null,
          username: username.trim() || null,
          firstname: firstname.trim() || null,
          lastname: lastname.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de mettre à jour vos informations.");
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
      className="relative space-y-6 w-full animate-in fade-in duration-300"
    >
      {/* Scope a custom glow-pulse animation stylesheet inside the form */}
      <style>{`
        @keyframes glow-pulse {
          0% {
            box-shadow: 0 0 8px rgba(125,56,255,0.4), 0 0 8px rgba(198,255,52,0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 22px rgba(125,56,255,0.85), 0 0 22px rgba(198,255,52,0.85);
            transform: scale(1.02);
          }
          100% {
            box-shadow: 0 0 8px rgba(125,56,255,0.4), 0 0 8px rgba(198,255,52,0.4);
            transform: scale(1);
          }
        }
        .animate-glow-pulse {
          animation: glow-pulse 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* Form Header with Action Button on the Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-[0_0_15px_rgba(125,56,255,0.1)]">
            <User className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase italic tracking-wider text-white">
              Mon Profil <span className="text-brand-primary">&amp;</span> Contacts
            </h3>
            <p className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest mt-0.5">
              Gérez vos informations de compte.
            </p>
          </div>
        </div>

        {/* Submit button aligned in the header row */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto sm:px-6 py-2.5 rounded-xl bg-linear-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 relative overflow-hidden ${
              isDirty && !loading
                ? "animate-glow-pulse" 
                : "shadow-[0_0_15px_rgba(125,56,255,0.15)] hover:shadow-[0_0_20px_rgba(125,56,255,0.25)]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <span>Sauvegarder</span>
            )}
          </button>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-brand-accent/15 border border-brand-accent/30 rounded-xl flex items-center gap-3 text-brand-accent text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-accent" />
          <p className="font-black uppercase tracking-wider italic">Modifications enregistrées avec succès !</p>
        </div>
      )}

      {/* Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Left Column: Contact details */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary pb-2 border-b border-white/5 mb-1">
            Contact &amp; Identifiants
          </h4>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-555 uppercase tracking-widest pl-1">
              Adresse E-mail *
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 bg-zinc-900/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
              />
              <Mail className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Numéro de téléphone
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 bg-zinc-900/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
              />
              <Phone className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Column: Identity info */}
        <div className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent pb-2 border-b border-white/5 mb-1">
            Identité
          </h4>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
              Nom d'utilisateur (Pseudo)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 bg-zinc-900/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
              />
              <AtSign className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Firstname & Lastname Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Firstname */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                Prénom
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full h-11 bg-zinc-900/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
                <User className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Lastname */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                Nom de famille
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nom"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full h-11 bg-zinc-900/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-zinc-700"
                />
                <User className="w-4 h-4 text-zinc-550 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
