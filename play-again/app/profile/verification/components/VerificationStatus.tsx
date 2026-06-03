"use client";

import React from "react";
import { ShieldCheck, Loader2, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";

export interface VerificationStatusProps {
  status: "APPROVED" | "PENDING" | "PROCESSING_AI" | "REJECTED" | "MISSING_ADDRESS";
  rejectionReason: string | null;
  stripeConnectId: string | null;
  onReset: () => void;
}

/**
 * VerificationStatus displays user-friendly panels for finalized KYC states,
 * pending review progress bars, or missing default addresses.
 */
export default function VerificationStatus({
  status,
  rejectionReason,
  stripeConnectId,
  onReset,
}: VerificationStatusProps) {
  // --- RENDU CAS DE SUCCÈS (APPROVED) ---
  if (status === "APPROVED") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-accent/30 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(198,255,52,0.1)] text-center space-y-6">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-brand-accent blur-[60px] opacity-25" />

        <div className="inline-flex w-20 h-20 rounded-full bg-brand-accent/10 border border-brand-accent/30 items-center justify-center text-brand-accent animate-bounce">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic text-white">
            Votre profil est vérifié !
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Félicitations, vous possédez désormais le badge de confiance sur PlayAgain. Vos annonces sont mises en avant et visibles par toute la communauté.
          </p>
        </div>

        {stripeConnectId ? (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/50 border border-brand-accent/20 flex items-center gap-3 justify-center">
            <span className="text-brand-accent text-sm">🟢</span>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-accent italic">
              Compte bancaire certifié Stripe Connect lié
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-3">
            <p className="text-xs text-zinc-400 font-bold">
              Vous êtes vendeur ? Liez un compte Stripe Connect pour débloquer le versement de vos fonds.
            </p>
            <Link
              href="/profile"
              className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
            >
              Aller lier Stripe
            </Link>
          </div>
        )}

        <div className="pt-6">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU CAS EN COURS (PENDING / PROCESSING_AI) ---
  if (status === "PENDING" || status === "PROCESSING_AI") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-primary/30 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(125,56,255,0.1)] text-center space-y-8">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-brand-primary blur-[60px] opacity-20" />

        <div className="inline-flex w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 items-center justify-center text-brand-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">
            Vérification en cours d'analyse
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Nous avons bien reçu vos documents justificatifs. Notre équipe administrative examine vos coordonnées dans les plus brefs délais.
          </p>
        </div>

        {/* Dynamic visual progress stepper */}
        <div className="max-w-md mx-auto grid grid-cols-3 items-center relative gap-2 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary flex items-center justify-center text-brand-primary font-bold text-xs">
              ✓
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 text-center">Soumission</span>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-brand-primary to-zinc-800" />

          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-brand-primary/50 flex items-center justify-center text-brand-primary font-bold text-xs animate-pulse">
              ⚙️
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-white text-center">Analyse</span>
          </div>

          <div className="h-[2px] bg-zinc-800" />

          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-650 font-bold text-xs">
              🛡️
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 text-center">Certification</span>
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU CAS REFUSÉ (REJECTED) ---
  if (status === "REJECTED") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-red-500/20 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)] text-center space-y-6">
        <div className="inline-flex w-16 h-16 rounded-full bg-red-550/10 border border-red-550/30 items-center justify-center text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">
            Demande de vérification refusée
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Malheureusement, votre dossier n'a pas pu être validé en raison de l'incohérence suivante :
          </p>
        </div>

        {/* Motif du rejet administratif */}
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-left space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
            Motif de l'administrateur :
          </span>
          <p className="text-xs font-bold text-red-200">
            {rejectionReason || "Vos documents ou coordonnées ne correspondent pas aux critères de conformité."}
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-black transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer"
          >
            Soumettre une nouvelle demande
          </button>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU CAS ADRESSE MANQUANTE (MISSING_ADDRESS) ---
  return (
    <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-primary/20 backdrop-blur-2xl relative overflow-hidden shadow-2xl text-center space-y-6">
      <div className="inline-flex w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 items-center justify-center text-brand-primary">
        <MapPin className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white">
          Adresse principale manquante
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
          Pour certifier votre profil, vous devez d'abord renseigner une adresse principale (par défaut) dans vos paramètres.
        </p>
      </div>

      <div className="pt-6">
        <Link
          href="/profile/infos"
          className="px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-black transition-all font-black uppercase tracking-widest text-[10px] inline-block shadow-[0_0_20px_rgba(125,56,255,0.3)] hover:shadow-[0_0_25px_rgba(125,56,255,0.5)] duration-300"
        >
          Configurer mon adresse principale
        </Link>
      </div>
    </div>
  );
}
