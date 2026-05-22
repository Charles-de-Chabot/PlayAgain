import React from "react";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";

export default function MessagesDefaultPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-transparent">
      {/* Cercle d'effet lumineux derrière l'icône */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full scale-125 animate-pulse" />
        <div className="relative flex items-center justify-center h-20 w-20 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <MessageSquare className="h-10 w-10 text-brand-accent" />
        </div>
      </div>

      <h2 className="text-2xl font-black font-sans tracking-wide bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent mb-3">
        Messagerie PlayAgain
      </h2>
      
      <p className="text-sm text-white/50 max-w-md mb-8 leading-relaxed">
        Sélectionnez une discussion dans la liste de gauche pour commencer à communiquer, négocier et finaliser vos transactions d'équipements sportifs d'occasion de manière sécurisée.
      </p>

      {/* Cartes d'arguments clés */}
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        <div className="p-4 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm flex flex-col items-center text-center">
          <Zap className="h-5 w-5 text-brand-accent mb-2" />
          <h3 className="text-xs font-bold text-white mb-1">Négociation Rapide</h3>
          <p className="text-[10px] text-white/40">Faites des offres de prix en un clic et achetez au meilleur tarif.</p>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm flex flex-col items-center text-center">
          <ShieldCheck className="h-5 w-5 text-brand-primary mb-2" />
          <h3 className="text-xs font-bold text-white mb-1">Transactions Sûres</h3>
          <p className="text-[10px] text-white/40">Vos discussions et vos transactions sont protégées de bout en bout.</p>
        </div>
      </div>
    </div>
  );
}
