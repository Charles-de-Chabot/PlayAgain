"use client";

import React, { useEffect } from "react";
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
  
  // --- Animation de Confettis Canvas ---
  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const confettiCount = 100;
    const confettiColors = ["#7D38FF", "#C6FF34", "#00FFFF", "#FF00FF", "#FFFF00"];
    const particles = Array.from({ length: confettiCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speed: Math.random() * 3.5 + 2.5,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speed;
        p.rotation += p.rotationSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [copied, setCopied] = React.useState(false);

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
    <div className="relative space-y-10 max-w-xl mx-auto">
      {/* Canvas Confetti en arrière-plan de l'interface */}
      <canvas 
        id="confetti-canvas" 
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* 1. Écran de validation & Logo Succès */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#C6FF34] mb-2 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] block">Paiement confirmé</span>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
          Merci pour votre achat !
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
          Votre transaction a été validée avec succès. L'argent est maintenant bloqué en toute sécurité sur notre compte de séquestre.
        </p>
      </div>

      {/* 2. Reçu de commande Rétro / Arcade */}
      <div className="relative rounded-3xl bg-zinc-900/60 border border-white/10 backdrop-blur-lg shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Effet CRT rétro */}
        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-white/2 to-transparent bg-size-[100%_4px] opacity-10" />
        
        {/* Reçu intérieur blanc cassé style papier thermique */}
        <div className="p-6 md:p-8 bg-[#F4F4F6] text-black rounded-2xl m-3 relative font-mono shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]">
          
          {/* Bordure crantée style ticket de caisse en haut */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_top,transparent_60%,#F4F4F6_60%)] bg-repeat-x bg-[length:12px_8px] -translate-y-2" />
          
          <div className="text-center space-y-1 pb-6 border-b border-black/10">
            <h2 className="font-black text-xl tracking-widest text-[#7D38FF]">PLAY AGAIN</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Le temple du sport d'occasion</p>
          </div>

          {/* Métadonnées facture */}
          <div className="grid grid-cols-2 gap-y-2 text-[10px] text-zinc-600 border-b border-dashed border-black/15 py-4">
            <div className="flex items-center gap-1.5 font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>N° Facture :</span>
            </div>
            <div className="text-right font-black text-black">PA-INV-{invoice.id.toString().padStart(6, '0')}</div>

            <div className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date :</span>
            </div>
            <div className="text-right font-black text-black">{invoiceDate}</div>
          </div>

          {/* Détail Article */}
          {productItem && (
            <div className="py-5 border-b border-dashed border-black/15 space-y-3">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Articles achetés</span>
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  {productItem.brand && (
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">
                      {productItem.brand.label}
                    </span>
                  )}
                  <p className="font-black text-xs text-black truncate uppercase tracking-tight">{productItem.title}</p>
                  <p className="text-[9px] text-zinc-500 font-bold mt-0.5">Quantité : 1</p>
                </div>
                <span className="font-black text-xs text-black shrink-0">
                  {Number(productItem.price).toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          {/* Ventilation Financière */}
          <div className="py-4 border-b border-black/10 space-y-2 text-[10px] text-zinc-600">
            <div className="flex justify-between">
              <span className="font-medium">Sous-total</span>
              <span className="font-bold text-black">{Number(productItem?.price || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Protection Acheteur</span>
              <span className="font-bold text-black">{Number(invoice.commission).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Frais de port</span>
              <span className="font-bold text-black">
                {Number(invoice.shipping_fee) === 0 ? "OFFERT" : `${Number(invoice.shipping_fee).toFixed(2)} €`}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-4 pb-2 flex justify-between items-baseline">
            <span className="font-black text-xs uppercase tracking-wider text-black">Total Payé</span>
            <span className="font-black text-2xl text-black">
              {Number(invoice.total_price).toFixed(2)} €
            </span>
          </div>

          <div className="text-center pt-2 pb-4">
            <div className="inline-block px-3 py-1 rounded-sm border-2 border-[#7D38FF] text-[#7D38FF] font-black text-[10px] tracking-widest uppercase rotate-[-2deg]">
              SÉQUESTRE PAYÉ ✓
            </div>
          </div>
        </div>

        {/* 3. Section Sécurité / Livraison selon le type */}
        <div className="p-6 pt-2 border-t border-white/5 space-y-4">
          
          {isHandDelivery ? (
            // A. Affichage code de sécurité (Remise en main propre)
            <div className="p-5 rounded-2xl bg-brand-accent/5 border border-brand-accent/20 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <ShieldCheck className="w-12 h-12 text-brand-accent" />
              </div>
              <div className="flex items-center gap-2 text-brand-accent">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Sécurité Remise en main propre</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 font-bold leading-snug">
                  Voici votre code de sécurité unique. Transmettez-le de vive voix au vendeur lors de la rencontre physique une fois que vous avez récupéré l'article :
                </p>
              </div>
              <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3">
                <p className="text-2xl md:text-3xl font-mono font-black text-brand-accent tracking-widest">
                  {invoice.buyer_security_code}
                </p>
                <button
                  onClick={copySecurityCode}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-accent" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            // B. Affichage adresse d'expédition (Colis)
            invoice.address && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 text-brand-primary">
                  <MapPin className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Adresse d'expédition</span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1">
                  <p className="font-bold text-white leading-tight">
                    {invoice.address.street_number ? `${invoice.address.street_number} ` : ""}{invoice.address.street_name}
                  </p>
                  <p>{invoice.address.zip_code} {invoice.address.city}</p>
                  <p className="text-zinc-500 uppercase tracking-widest text-[8px] mt-1">{invoice.address.country}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* 4. Actions retour / chat */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-20">
        <Link href="/messages" className="flex-1">
          <Button className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-primary/50 text-white text-sm font-black uppercase tracking-[0.1em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-primary" />
            Accéder à la messagerie
          </Button>
        </Link>
        <Link href="/shop" className="flex-1">
          <Button className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-[0.1em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </div>
  );
}
