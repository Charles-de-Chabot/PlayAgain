"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ShoppingBag, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  FileText,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InvoiceItem {
  id: number;
  product: {
    title: string;
    price: string | number;
    brand?: { label: string };
    media: Array<{ url: string }>;
  };
}

interface Invoice {
  id: number;
  total_price: string | number;
  commission: string | number;
  shipping_fee: string | number;
  invoice_date: string;
  buyer_security_code: string | null;
  address?: {
    street_number: string | null;
    street_name: string;
    city: string;
    zip_code: string;
    country: string;
  } | null;
  items: InvoiceItem[];
}

interface SuccessClientProps {
  invoice: Invoice;
}

export function SuccessClient({ invoice }: SuccessClientProps) {
  const [copied, setCopied] = useState(false);

  const copySecurityCode = () => {
    if (invoice.buyer_security_code) {
      navigator.clipboard.writeText(invoice.buyer_security_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const productItem = invoice.items[0]?.product;
  const isHandDelivery = invoice.buyer_security_code !== null;

  return (
    <div className="relative space-y-8 max-w-lg mx-auto">
      
      {/* 1. Entête de Confirmation & Statut */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-accent mb-2 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">
          Paiement sécurisé
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
          Achat Réussi !
        </h1>
        
      </div>

      {/* 2. Facture Numérique Premium (Glassmorphic Dark Coupon) */}
      <div className="relative rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Ligne Néon supérieure déco */}
        <div className="h-[3px] w-full bg-linear-to-r from-brand-primary to-brand-accent" />
        
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Logo & Identité Plateforme */}
          <div className="text-center pb-5 border-b border-white/5 space-y-1">
            <h2 className="text-2xl font-black tracking-widest text-brand-primary uppercase drop-shadow-[0_0_15px_rgba(125,56,255,0.4)]">
              Play Again
            </h2>
            <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">
              Le temple du sport d'occasion
            </p>
          </div>

          {/* Métadonnées Facture */}
          <div className="grid grid-cols-2 gap-y-2.5 text-xs border-b border-dashed border-white/10 pb-5">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <FileText className="w-4 h-4 text-brand-primary" />
              <span>N° Commande</span>
            </div>
            <div className="text-right font-black text-white font-mono">
              PA-INV-{invoice.id.toString().padStart(6, '0')}
            </div>

            <div className="flex items-center gap-2 text-zinc-400 font-semibold">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span>Date d'achat</span>
            </div>
            <div className="text-right font-bold text-white font-mono">
              {invoiceDate}
            </div>
          </div>

          {/* Détails du Produit Acheté */}
          {productItem && (
            <div className="pb-5 border-b border-dashed border-white/10 space-y-3">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Article
              </span>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  {productItem.brand && (
                    <span className="text-[8px] font-black text-brand-primary uppercase tracking-wider">
                      {productItem.brand.label}
                    </span>
                  )}
                  <p className="font-extrabold text-sm text-white truncate uppercase tracking-tight">
                    {productItem.title}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                    Quantité : 1
                  </p>
                </div>
                <span className="font-black text-sm text-white shrink-0 font-mono">
                  {Number(productItem.price).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {/* Récapitulatif Financier */}
          <div className="space-y-2.5 text-xs border-b border-white/5 pb-5">
            <div className="flex justify-between text-zinc-400">
              <span className="font-semibold">Sous-total</span>
              <span className="font-bold text-white font-mono">{Number(productItem?.price || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span className="font-semibold">Protection Acheteur</span>
              <span className="font-bold text-white font-mono">{Number(invoice.commission).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span className="font-semibold">Frais d'envoi</span>
              <span className="font-bold text-brand-accent font-mono">
                {Number(invoice.shipping_fee) === 0 ? "OFFERT" : `${Number(invoice.shipping_fee).toFixed(2)} €`}
              </span>
            </div>
          </div>

          {/* Montant Total Final */}
          <div className="flex justify-between items-baseline pt-2">
            <span className="font-black text-sm uppercase tracking-wider text-white">Total Payé</span>
            <span className="font-black text-2xl text-brand-accent font-mono drop-shadow-[0_0_12px_rgba(198,255,52,0.3)]">
              {Number(invoice.total_price).toFixed(2)} €
            </span>
          </div>

          {/* Badge de Validation Séquestre */}
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] tracking-widest uppercase">
              <Check className="w-3.5 h-3.5 shrink-0" />
              Séquestre PlayAgain Validé
            </div>
          </div>
        </div>

        {/* 3. Section Sécurité / Livraison selon le type */}
        <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 space-y-4">
          
          {isHandDelivery ? (
            // Mode Remise en main propre (Code Unique)
            <div className="p-5 rounded-2xl bg-brand-accent/5 border border-brand-accent/15 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <ShieldCheck className="w-12 h-12 text-brand-accent" />
              </div>
              <div className="flex items-center gap-2 text-brand-accent">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Protection en main propre</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Voici votre code de sécurité unique. Transmettez-le de vive voix au vendeur lors de votre rencontre physique, uniquement après avoir vérifié et récupéré l'article de sport :
                </p>
              </div>
              <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-3">
                <p className="text-2xl md:text-3xl font-mono font-black text-brand-accent tracking-widest">
                  {invoice.buyer_security_code}
                </p>
                <button
                  onClick={copySecurityCode}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-accent" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            // Mode Expédition standard (Adresse d'expédition)
            invoice.address && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-brand-primary">
                  <MapPin className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Adresse de livraison</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                  <p className="font-extrabold text-white">
                    {invoice.address.street_number ? `${invoice.address.street_number} ` : ""}{invoice.address.street_name}
                  </p>
                  <p className="font-medium">{invoice.address.zip_code} {invoice.address.city}</p>
                  <p className="text-zinc-500 uppercase tracking-widest text-[8px] font-bold mt-1">
                    {invoice.address.country}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* 4. Actions retour / Messagerie / Boutique */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        <Link href="/messages" className="flex-1">
          <Button className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-primary/50 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
            Accéder à la messagerie
          </Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <ShoppingBag className="w-4 h-4" />
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </div>
  );
}
