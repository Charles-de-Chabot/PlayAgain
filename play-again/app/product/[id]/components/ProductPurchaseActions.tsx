import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompareButtonWrapper } from "@/components/product/CompareButtonWrapper";

export interface Product {
  id: number;
  price: string | number;
  is_sold: boolean;
  user_id: number;
}

export interface UserInvoice {
  id: number;
}

export interface ProductPurchaseActionsProps {
  product: any;
  userInvoice: UserInvoice | null;
  isOwner: boolean;
}

/**
 * ProductPurchaseActions manages purchase buttons, sold status indicators,
 * instant seller messaging triggers (via server action redirects), and reassurance cards.
 */
export default function ProductPurchaseActions({
  product,
  userInvoice,
  isOwner,
}: ProductPurchaseActionsProps) {
  return (
    <div className="space-y-4 pt-4 text-left">
      {userInvoice ? (
        // L'utilisateur connecté est l'acheteur
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold text-center">
            🎉 Achat Réussi ! Vous avez acheté cet article.
          </div>
          <Link href={`/product/${product.id}/checkout/success?invoice_id=${userInvoice.id}`} className="block w-full">
            <Button className="w-full h-14 rounded-2xl bg-brand-accent hover:brightness-110 text-black text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer">
              📄 Voir ma facture
            </Button>
          </Link>
        </div>
      ) : product.is_sold ? (
        // Le produit est vendu (à quelqu'un d'autre)
        <Button
          disabled
          className="w-full h-16 rounded-3xl bg-zinc-800 text-zinc-500 text-lg font-black uppercase tracking-[0.2em] cursor-not-allowed"
        >
          Article Vendu
        </Button>
      ) : (
        // Le produit est en vente
        <>
          {!isOwner && (
            <Link href={`/product/${product.id}/checkout`} className="block w-full">
              <Button className="w-full h-16 rounded-3xl bg-brand-primary hover:bg-brand-primary/90 text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 transition-all active:scale-95 cursor-pointer">
                Acheter maintenant
              </Button>
            </Link>
          )}
        </>
      )}

      {/* Bouton de contact vendeur */}
      {!isOwner && !userInvoice && !product.is_sold && (
        <form
          action={async () => {
            "use server";
            const { getOrCreateConversation } = await import("@/app/actions/message");
            const { redirect } = await import("next/navigation");
            let conversationId;
            try {
              const res = await getOrCreateConversation(product.id);
              conversationId = res.conversationId;
            } catch (err) {
              console.error(err);
              return;
            }
            if (conversationId) {
              redirect(`/messages/${conversationId}`);
            }
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-accent/50 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            💬 Contacter le vendeur
          </Button>
        </form>
      )}

      {/* Si l'utilisateur a déjà acheté le produit, on lui permet d'accéder directement au chat avec le vendeur */}
      {userInvoice && (
        <form
          action={async () => {
            "use server";
            const { getOrCreateConversation } = await import("@/app/actions/message");
            const { redirect } = await import("next/navigation");
            let conversationId;
            try {
              const res = await getOrCreateConversation(product.id);
              conversationId = res.conversationId;
            } catch (err) {
              console.error(err);
              return;
            }
            if (conversationId) {
              redirect(`/messages/${conversationId}`);
            }
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-accent/50 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 animate-pulse cursor-pointer"
          >
            💬 Discuter avec le vendeur
          </Button>
        </form>
      )}

      <CompareButtonWrapper product={product} />

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Truck className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Envoi Rapide</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-brand-accent/20 flex flex-col items-center justify-center text-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-accent" />
          <span className="text-[9px] font-black text-brand-accent uppercase tracking-tighter">48h retour</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Shield className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Tiers Confiance</span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 font-bold text-center leading-relaxed flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
        Protection de 48h après livraison en cas de non-conformité.
      </p>
    </div>
  );
}
