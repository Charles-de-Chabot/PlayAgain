"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function StripeRedirector({ url }: { url: string }) {
  useEffect(() => {
    // Redirection top-level pour éviter les problèmes de CORS avec le router Next.js
    window.location.href = url;
  }, [url]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-brand-primary blur-[150px] opacity-30" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-brand-accent blur-[150px] opacity-20" />

      <div className="relative z-10 text-center space-y-6 max-w-sm px-6 p-8 rounded-3xl bg-zinc-950/80 border border-brand-primary/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(125,56,255,0.15)] animate-pulse-stripe">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(125,56,255,0.2)]">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-black uppercase tracking-wider text-white italic">
            Connexion sécurisée
          </h2>
          <p className="text-xs text-zinc-400 font-bold leading-relaxed">
            Redirection vers Stripe Connect pour configurer votre IBAN. Veuillez patienter un instant...
          </p>
        </div>
      </div>
    </main>
  );
}
