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
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InvoiceItem {
  id: number;
  unit_price: string | number;
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
    <div className="relative space-y-8 max-w-2xl mx-auto">
      <style>{`
        @media print {
          @page {
            margin: 0.4cm !important;
            size: portrait;
          }
          /* Rendre la page blanche et le texte noir à l'impression */
          html, body, main, div, p, span, h1, h2, h3, select, button {
            background-color: #ffffff !important;
            background-image: none !important;
            color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
            backdrop-filter: none !important;
          }
          /* Cacher les éléments inutiles et supprimer les paddings du haut à l'impression */
          header, footer, .print\\:hidden, #__next-prerender-indicator {
            display: none !important;
          }
          .pt-24, .md\\:pt-32, .pt-32 {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          /* Mettre en valeur la facture avec un contour propre */
          .bg-zinc-900\\/40 {
            background-color: #ffffff !important;
            border: 2px solid #000000 !important;
            border-radius: 1.5rem !important;
          }
          /* Rendre les séparations nettes à l'impression */
          .border-white\\/10, .border-dashed, .border-t, .border-b {
            border-color: #000000 !important;
          }
          /* Adapter les textes secondaires pour une lecture optimale */
          .text-zinc-400, .text-zinc-500, .text-zinc-300 {
            color: #27272a !important;
          }
          /* Badge de validation en noir et blanc contrasté */
          .bg-emerald-500\\/10 {
            background-color: #ffffff !important;
            border: 1px solid #166534 !important;
            color: #166534 !important;
          }
          /* Encart de livraison ou de code de sécurité */
          .bg-brand-accent\\/5, .bg-white\\/5, .bg-black\\/50 {
            background-color: #f4f4f5 !important;
            border: 1px solid #000000 !important;
            color: #000000 !important;
          }
          /* Ajustements pour tenir rigoureusement sur une page unique et centrer horizontalement */
          .relative.space-y-8 {
            margin: 0 auto !important;
            max-width: 600px !important; /* Largeur premium aérée pour du A4 */
            width: 100% !important;
            page-break-inside: avoid !important;
            float: none !important;
          }
          /* Forcer le centrage par le parent */
          .max-w-3xl {
            max-width: 100% !important;
            margin: 0 auto !important;
            display: flex !important;
            justify-content: center !important;
          }
          /* Réduire fortement les espacements verticaux à l'impression */
          .space-y-8 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.4rem !important;
          }
          .space-y-6 > :not([hidden]) ~ :not([hidden]),
          .space-y-4 > :not([hidden]) ~ :not([hidden]),
          .space-y-3 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.35rem !important;
          }
          .p-6, .md\\:p-8 {
            padding: 0.75rem !important;
          }
          .pb-5 {
            padding-bottom: 0.3rem !important;
          }
          .pt-5 {
            padding-top: 0.3rem !important;
          }
          .pt-4 {
            padding-top: 0.2rem !important;
          }
          .pb-6 {
            padding-bottom: 0.3rem !important;
          }
          .mb-6 {
            margin-bottom: 0.4rem !important;
          }
          .mb-8 {
            margin-bottom: 0.4rem !important;
          }
          .h-8 {
            height: 1.2rem !important;
          }
          /* Mentions légales ultra-compactes à l'impression */
          .px-8.py-4.space-y-1\\.5 {
            padding: 0.15rem 0.5rem !important;
            margin: 0 !important;
          }
          .text-\\[8px\\] {
            font-size: 5.5px !important;
            line-height: 1.1 !important;
          }
          .text-xs {
            font-size: 0.7rem !important;
            line-height: 1.2 !important;
          }
          .text-sm {
            font-size: 0.75rem !important;
            line-height: 1.25 !important;
          }
          /* --- Touches de couleurs signatures (Vert/Violet) du site --- */
          /* Titre "Play Again" et marques en Violet signature */
          h2.text-brand-primary, .text-brand-primary {
            color: #7d38ff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Badge de validation en Vert émeraude propre */
          .bg-emerald-500\\/10 {
            background-color: #f0fdf4 !important;
            border: 1.5px solid #10b981 !important;
            color: #10b981 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Encart de protection de paiement (accent lime/jaune et orange doux) */
          .bg-brand-accent\\/5 {
            background-color: #fefce8 !important;
            border: 1.5px solid #d97706 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .text-brand-accent {
            color: #d97706 !important;
          }
          /* Ligne décorative supérieure : Dégradé néon emblématique du site */
          .bg-linear-to-r {
            background: linear-gradient(90deg, #7d38ff, #ccff00) !important;
            height: 3px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Code-barres à l'impression */
          .print-barcode-bar {
            background-color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      {/* 1. Entête de Confirmation & Statut (Masqué à l'impression pour économiser l'encre et l'espace) */}
      <div className="text-center space-y-4 print:hidden">
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
            <div className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-1.5 print:bg-transparent print:border-brand-primary/40">
              <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.25em]">Ticket Officiel</span>
            </div>
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
            <div className="text-right font-bold text-white font-mono" suppressHydrationWarning>
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
                  {Number(invoice.items[0]?.unit_price || productItem.price).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {/* Récapitulatif Financier */}
          <div className="space-y-2.5 text-xs border-b border-white/5 pb-5">
            <div className="flex justify-between text-zinc-400">
              <span className="font-semibold">Sous-total</span>
              <span className="font-bold text-white font-mono">{Number(invoice.items[0]?.unit_price || productItem?.price || 0).toFixed(2)} €</span>
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
              Transaction Validée
            </div>
          </div>

          {/* Code barre numérique déco pour esthétique "Ticket Premium" */}
          <div className="pt-5 border-t border-white/5 flex flex-col items-center gap-1.5 opacity-60 print:opacity-100 print:border-black">
            <div className="flex gap-[2.5px] h-8 items-center justify-center">
              {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 1, 2, 1, 3, 2, 1, 4].map((w, idx) => (
                <div key={idx} className="h-full bg-white print-barcode-bar" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[8px] font-mono tracking-[0.25em] text-zinc-500 print:text-zinc-700 uppercase">
              *PA-INV-{invoice.id.toString().padStart(6, '0')}*
            </span>
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

        {/* Mentions Légales C2C (Essentiel à l'impression et discret) */}
        <div className="border-t border-dashed border-white/5 print:border-black/10 px-8 py-4 space-y-1.5 text-[8px] text-zinc-500 leading-normal print:text-zinc-600">
          <p>
            <strong>Statut de la transaction :</strong> Vente de gré à gré entre particuliers (C2C). 
            Conformément à la législation en vigueur, la TVA n'est pas applicable sur le prix de vente de l'équipement de sport (Article 293 B du CGI).
          </p>
          <p>
            <strong>Rôle de la plateforme :</strong> PlayAgain agit exclusivement en qualité d'intermédiaire technique de mise en relation. La commission perçue correspond aux frais de service pour la sécurisation des transactions, l'hébergement de l'offre et l'accès à la garantie de protection acheteur.
          </p>
          <p>
            <strong>Droit de rétractation :</strong> Le droit de rétractation légal prévu en matière de vente à distance ne s'applique pas aux transactions conclues entre particuliers (Article L. 221-18 du Code de la consommation). L'acheteur dispose de la garantie de conformité PlayAgain pour signaler tout problème sous 48 heures après livraison.
          </p>
        </div>

        {/* Pied de page personnalisé pour le PDF (masqué à l'écran, visible au téléchargement) */}
        <div className="hidden print:flex justify-between items-center text-[7px] font-mono text-zinc-500 uppercase tracking-[0.2em] px-8 pb-5 pt-3 border-t border-dashed border-black">
          <span suppressHydrationWarning>Facture émise le {invoiceDate}</span>
          <span className="text-brand-primary">playagain.fr</span>
        </div>
      </div>

      {/* 4. Actions retour / Téléchargement / Boutique */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex-1 h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-primary/50 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/60 hover:text-white"
        >
          <Download className="w-4 h-4 text-brand-primary" />
          Télécharger la facture (PDF)
        </button>
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
