"use client";

import { useState } from "react";
import { CreditCard, Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StripePayoutButtonProps {
  stripeConnectId: string | null;
  shouldPulse?: boolean;
}

export function StripePayoutButton({ stripeConnectId, shouldPulse }: StripePayoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasStripeAccount = !!stripeConnectId;

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);

    const endpoint = hasStripeAccount ? "/api/stripe/login-link" : "/api/stripe/onboarding";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error} (Détails: ${data.details})`
          : (data.error || "Une erreur est survenue.");
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("L'URL de redirection Stripe est manquante.");
      }
    } catch (err: any) {
      console.error("Erreur lors de l'appel API Stripe :", err);
      setError(err.message || "Erreur de connexion avec le serveur.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative z-10 px-1 mt-2">
      {hasStripeAccount ? (
        <button
          onClick={handleAction}
          disabled={isLoading}
          className={cn(
            "w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between px-5 cursor-pointer border",
            "bg-zinc-900/60 border-brand-accent/20 text-brand-accent hover:bg-brand-accent/15 hover:border-brand-accent/40 hover:shadow-[0_0_20px_rgba(198,255,52,0.15)]",
            isLoading && "opacity-75 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-[0_0_10px_rgba(198,255,52,0.1)]">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-bold text-sm text-zinc-200">Ma Carte</span>
              <span className="text-[9px] text-brand-accent/70 font-black tracking-widest lowercase italic">Compte Stripe Express lié</span>
            </div>
          </div>
        </button>
      ) : (
        <div className="relative group w-full">
          <button
            onClick={handleAction}
            disabled={isLoading}
            className={cn(
              "w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-between px-5 cursor-pointer border",
              "bg-zinc-900/60 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/15 hover:border-brand-primary/40 hover:shadow-[0_0_20px_rgba(125,56,255,0.15)]",
              isLoading && "opacity-75 cursor-not-allowed",
              shouldPulse && "animate-pulse-stripe border-brand-primary/60 shadow-[0_0_25px_rgba(125,56,255,0.4)] ring-2 ring-brand-primary/10"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-[0_0_10px_rgba(125,56,255,0.1)]">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-sm text-zinc-200">Activer mon compte bancaire</span>
                <span className="text-[9px] text-brand-primary/70 font-black tracking-widest lowercase italic">Configurer mon IBAN</span>
              </div>
            </div>
          </button>

          {/* Info-bulle premium en Glassmorphism */}
          {shouldPulse && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-3.5 rounded-2xl bg-zinc-950/95 border border-brand-primary/30 backdrop-blur-md shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
              <div className="relative text-left space-y-1">
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest block">Statut de vos annonces</span>
                <p className="text-[10px] text-zinc-350 leading-relaxed font-bold">
                  Vos articles mis en vente ne seront pas diffusés sur la boutique tant que vous n'aurez pas ajouté votre compte bancaire (IBAN).
                </p>
                {/* Flèche de l'info-bulle */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 border-r border-b border-brand-primary/30 rotate-45 mt-1" />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center animate-pulse">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
