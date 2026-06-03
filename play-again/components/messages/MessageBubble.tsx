"use client";

import React from "react";
import {
  Package,
  Download,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  MapPin,
  CheckCheck,
  QrCode,
  DollarSign,
  BarChart2,
  Check as CheckIcon,
  CheckCheck as CheckCheckIcon
} from "lucide-react";
import { Message, InvoiceInfo, OfferMetadata, PollMetadata } from "@/hooks/useChat";

export interface MessageBubbleProps {
  msg: Message;
  currentUserId: number;
  isBuyer: boolean;
  isReadOnly: boolean;
  invoice: InvoiceInfo | null;
  shippingInvoiceId: number | null;
  deliveringInvoiceId: number | null;
  isReleasingFunds: boolean;
  isDisputing: boolean;
  verifiedInvoices: Record<number, boolean>;
  verificationCodes: Record<number, string>;
  setVerificationCodeForInvoice: (invoiceId: number, code: string) => void;
  verifyingInvoiceId: number | null;
  verificationErrors: Record<number, string>;
  partnerName: string;
  isMounted: boolean;
  handleVerifySecurityCode: (invoiceId: number) => Promise<void>;
  handleMarkAsShipped: (invoiceId: number) => void;
  handleSimulateDelivery: (invoiceId: number) => Promise<void>;
  handleReleaseFunds: (invoiceId: number) => Promise<void>;
  handleDispute: (invoiceId: number) => void;
  handleResolveOffer: (messageId: number, status: "ACCEPTED" | "DECLINED") => Promise<void>;
  handleVotePoll: (messageId: number, optionChosen: string) => Promise<void>;
  setActiveLightboxImage: (url: string | null) => void;
  scrollToBottom?: () => void;
}

/**
 * MessageBubble component determines which sub-template to render based on the metadata payload.
 */
export default function MessageBubble({
  msg,
  currentUserId,
  isBuyer,
  isReadOnly,
  invoice,
  shippingInvoiceId,
  deliveringInvoiceId,
  isReleasingFunds,
  isDisputing,
  verifiedInvoices,
  verificationCodes,
  setVerificationCodeForInvoice,
  verifyingInvoiceId,
  verificationErrors,
  partnerName,
  isMounted,
  handleVerifySecurityCode,
  handleMarkAsShipped,
  handleSimulateDelivery,
  handleReleaseFunds,
  handleDispute,
  handleResolveOffer,
  handleVotePoll,
  setActiveLightboxImage,
  scrollToBottom,
}: MessageBubbleProps) {
  const isMe = msg.user_id === currentUserId;
  const msgMeta = msg.metadata;

  const msgTime = isMounted
    ? new Date(msg.created_at).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (msgMeta) {
    // 1. Bordereau d'expédition Vendeur (Privé)
    if (msgMeta.type === "shipping_label_seller") {
      const match = msgMeta.pdfUrl?.match(/\/api\/invoices\/(\d+)\/shipping-label/);
      const invoiceId = match ? parseInt(match[1]) : null;
      
      const isShipped = invoice && (invoice.status === "SHIPPED" || invoice.status === "DELIVERED" || invoice.status === "COMPLETED");
      const isShippingLoading = invoiceId !== null && shippingInvoiceId === invoiceId;

      return (
        <div className="flex justify-start animate-fade-in-up">
          <div className="p-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 backdrop-blur-md shadow-xl flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2 text-brand-primary">
              <div className="p-2 rounded-xl bg-brand-primary/10">
                <Package className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase">Expédition Requise</span>
            </div>
            
            <p className="text-xs text-white/80 leading-relaxed">{msg.content}</p>
            
            <div className="flex flex-col gap-2 w-full">
              <a
                href={msgMeta.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-brand-primary/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Télécharger le Bordereau (PDF)
              </a>

              {invoiceId !== null && (
                isShipped ? (
                  <div className="space-y-2 w-full">
                    <div className="w-full py-2.5 px-4 bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-center text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" />
                      Colis marqué comme expédié
                    </div>
                    {invoice && invoice.status === "SHIPPED" && (
                      <button
                        onClick={() => handleSimulateDelivery(invoiceId)}
                        disabled={deliveringInvoiceId !== null}
                        className="w-full py-2.5 px-4 bg-cyan-500 hover:brightness-110 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {deliveringInvoiceId !== null ? (
                          <Loader2 className="h-4 w-4 animate-spin text-black" />
                        ) : (
                          <>
                            <Package className="h-4 w-4" />
                            Simuler la livraison (Test)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleMarkAsShipped(invoiceId)}
                    disabled={isShippingLoading}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isShippingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      "Marquer le colis comme expédié"
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. Achat Confirmé Acheteur (Privé)
    if (msgMeta.type === "purchase_confirmed_buyer") {
      const currentStatus = invoice?.status || "PAID";
      const isDelivered = currentStatus === "DELIVERED";
      const isCompleted = currentStatus === "COMPLETED";
      const isDisputed = currentStatus === "DISPUTED";
      const isShipped = currentStatus === "SHIPPED";

      return (
        <div className="flex justify-end animate-fade-in-up">
          <div className="p-5 rounded-2xl border border-brand-accent/30 bg-brand-accent/5 backdrop-blur-md shadow-xl flex flex-col gap-3 max-w-sm text-right w-full">
            <div className="flex items-center gap-2 text-brand-accent justify-end">
              <span className="text-xs font-black tracking-widest uppercase">Paiement Sécurisé</span>
              <div className="p-2 rounded-xl bg-brand-accent/10">
                <ShieldCheck className="h-5 w-5 text-brand-accent" />
              </div>
            </div>
            
            <p className="text-xs text-white/80 leading-relaxed">{msg.content}</p>
            
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="flex items-center gap-1.5 justify-end text-[10px] text-zinc-400 font-bold">
                <span className={`h-2 w-2 rounded-full ${
                  isCompleted ? "bg-brand-accent" :
                  isDisputed ? "bg-red-500 animate-pulse" :
                  isDelivered ? "bg-cyan-400 animate-pulse" :
                  isShipped ? "bg-violet-400 animate-pulse" :
                  "bg-brand-accent animate-pulse"
                }`} />
                Statut : {
                  isCompleted ? "Transaction terminée" :
                  isDisputed ? "Litige en cours" :
                  isDelivered ? "Colis livré (48h)" :
                  isShipped ? "Colis en cours de livraison" : "En attente d'expédition"
                }
              </div>

              {isDelivered && invoice && (
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <button
                    onClick={() => handleReleaseFunds(invoice.id)}
                    disabled={isReleasingFunds}
                    className="w-full py-2.5 px-4 bg-brand-accent hover:bg-brand-accent/90 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isReleasingFunds ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Tout est OK
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDispute(invoice.id)}
                    disabled={isDisputing}
                    className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isDisputing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Déclarer un problème
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3. Remise en Main Propre Acheteur (Privé + Code de Sécurité)
    if (msgMeta.type === "hand_delivery_buyer") {
      const securityCode = "securityCode" in msgMeta ? msgMeta.securityCode : "";
      return (
        <div className="flex justify-end animate-fade-in-up">
          <div className="p-5 rounded-2xl border border-brand-accent/30 bg-zinc-950/80 backdrop-blur-md shadow-xl flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2 text-brand-accent justify-end">
              <span className="text-xs font-black tracking-widest uppercase">Remise en main propre</span>
              <div className="p-2 rounded-xl bg-brand-accent/10">
                <MapPin className="h-5 w-5 text-brand-accent" />
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed text-right">{msg.content}</p>
            
            <div className="p-4 rounded-xl bg-black border border-white/5 flex flex-col items-center justify-center gap-1.5">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Code de validation</span>
              <span className="text-3xl font-black text-brand-accent font-mono tracking-widest select-all drop-shadow-[0_0_10px_rgba(198,255,52,0.4)]">
                {securityCode}
              </span>
              <span className="text-[9px] text-zinc-500 font-bold text-center mt-1">
                À présenter de vive voix au vendeur au moment de la rencontre.
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 4. Remise en Main Propre Vendeur (Privé + Saisie du Code de Validation)
    if (msgMeta.type === "hand_delivery_seller") {
      const invoiceId = "invoiceId" in msgMeta ? msgMeta.invoiceId : 0;
      const isVerified = verifiedInvoices[invoiceId] || false;
      const enteredCode = verificationCodes[invoiceId] || "";
      const error = verificationErrors[invoiceId] || "";
      const isLoading = verifyingInvoiceId === invoiceId;

      return (
        <div className="flex justify-start animate-fade-in-up">
          <div className="p-5 rounded-2xl border border-brand-primary/20 bg-zinc-950/80 backdrop-blur-md shadow-xl flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2 text-brand-primary">
              <div className="p-2 rounded-xl bg-brand-primary/10">
                <QrCode className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase">Rencontre & Validation</span>
            </div>
            
            <p className="text-xs text-white/80 leading-relaxed">{msg.content}</p>

            {isVerified ? (
              <div className="p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex flex-col items-center justify-center gap-1 text-center w-full">
                <CheckCheck className="h-6 w-6 text-brand-accent" />
                <span className="text-xs font-black text-brand-accent uppercase tracking-wider">Remise Validée !</span>
                <span className="text-[10px] text-zinc-400 font-bold mt-1">
                  Les fonds ont été libérés avec succès.
                </span>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    value={enteredCode}
                    onChange={(e) => setVerificationCodeForInvoice(invoiceId, e.target.value.toUpperCase())}
                    placeholder="PA-XXXXXX"
                    disabled={isLoading}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 text-center font-mono font-black text-sm text-white focus:outline-none focus:border-brand-primary transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleVerifySecurityCode(invoiceId)}
                    disabled={isLoading || !enteredCode.trim()}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Valider"
                    )}
                  </button>
                </div>

                {error && (
                  <div className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // A. Type IMAGE
    if (msgMeta.type === "IMAGE") {
      return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
          <div className="max-w-[280px] sm:max-w-md flex flex-col gap-1">
            <div 
              onClick={() => setActiveLightboxImage(msgMeta.url)}
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl group cursor-pointer"
            >
              <img
                src={msgMeta.url}
                alt="Image partagée"
                className="w-full h-auto object-cover max-h-[300px] hover:scale-[1.02] transition-transform duration-300"
                onLoad={scrollToBottom}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-[9px] text-white/80">{msgTime}</span>
              </div>
            </div>
            <span className="text-[9px] text-white/40 self-end px-1">{msgTime}</span>
          </div>
        </div>
      );
    }

    // B. Type OFFER (Offre de prix)
    if (msgMeta.type === "OFFER") {
      const offer = msgMeta as OfferMetadata;
      const amount = offer.amount;
      const status = offer.status;

      return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl flex flex-col gap-3 min-w-[220px] max-w-sm ${
              status === "ACCEPTED"
                ? "bg-brand-accent/15 border-brand-accent/30 text-white"
                : status === "DECLINED"
                ? "bg-white/5 border-white/10 text-white/60"
                : "bg-brand-primary/10 border-brand-primary/20 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-white/40">
                Offre de Prix
              </span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                  status === "ACCEPTED"
                    ? "bg-brand-accent text-brand-black"
                    : status === "DECLINED"
                    ? "bg-white/10 text-white/40"
                    : "bg-brand-primary text-white"
                }`}
              >
                {status === "ACCEPTED"
                  ? "Acceptée"
                  : status === "DECLINED"
                  ? "Déclinée"
                  : "En attente"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-brand-accent" />
              <span className="text-3xl font-black">{amount} €</span>
            </div>

            <p className="text-xs text-white/70">
              {isMe
                ? `Vous avez proposé cette offre de ${amount} €.`
                : `${partnerName} vous propose d'acheter cet article à ${amount} €.`}
            </p>

            {!isMe && !isBuyer && status === "PENDING" && !isReadOnly && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleResolveOffer(msg.id, "ACCEPTED")}
                  className="flex-1 text-xs font-bold bg-brand-accent text-brand-black py-2 rounded-xl hover:bg-brand-accent/80 transition-colors"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleResolveOffer(msg.id, "DECLINED")}
                  className="flex-1 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl transition-colors"
                >
                  Décliner
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // C. Type POLL (Sondage)
    if (msgMeta.type === "POLL") {
      const poll = msgMeta as PollMetadata;
      const question = poll.question;
      const options = poll.options || [];
      const votes = poll.votes || {};
      const voters = poll.voters || {};
      const hasVoted = voters[currentUserId.toString()] !== undefined;
      const userChoice = voters[currentUserId.toString()];

      const totalVotes = Object.values(votes).reduce((a: number, b: number) => a + b, 0);

      return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl flex flex-col gap-3 min-w-[260px] max-w-sm">
            <div className="flex items-center gap-1.5 text-white/40">
              <BarChart2 className="h-4 w-4 text-brand-accent" />
              <span className="text-[10px] font-black tracking-widest uppercase">Sondage</span>
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">{question}</h3>

            <div className="space-y-2 mt-1">
              {options.map((opt: string) => {
                const optVotes = votes[opt] || 0;
                const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                const isChosen = userChoice === opt;

                return (
                  <div key={opt} className="relative">
                    {hasVoted ? (
                      <div className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 overflow-hidden flex items-center justify-between text-xs relative group">
                        <div
                          className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${
                            isChosen ? "bg-brand-primary/30" : "bg-white/5"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                        <span className={`relative font-semibold truncate z-10 ${isChosen ? "text-brand-accent font-bold" : "text-white"}`}>
                          {opt} {isChosen && "• (Votre choix)"}
                        </span>
                        <span className="relative font-bold text-white/50 z-10">{percent}% ({optVotes})</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVotePoll(msg.id, opt)}
                        disabled={isReadOnly}
                        className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/2 hover:bg-white/8 hover:border-brand-primary text-xs text-white font-semibold transition-all"
                      >
                        {opt}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // D. Type SYSTEM
    if (msgMeta.type === "SYSTEM") {
      return (
        <div className="flex justify-center animate-fade-in-up">
          <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/5 text-[11px] text-white/55 font-bold tracking-wide text-center">
            📢 {msg.content}
          </div>
        </div>
      );
    }
  }

  // E. Rendu Message Texte Classique
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div className="flex flex-col gap-0.5 max-w-[70%]">
        <div
          className={`p-3 text-sm rounded-2xl shadow-md ${
            isMe
              ? "bg-brand-primary text-white rounded-tr-none font-medium"
              : "bg-white/10 border border-white/10 text-white rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{msg.content}</p>
        </div>
        <div className={`flex items-center gap-1 text-[9px] text-white/40 px-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
          <span>{msgTime}</span>
          {isMe && (
            msg.is_read ? (
              <CheckCheckIcon className="h-3 w-3 text-brand-accent" />
            ) : (
              <CheckIcon className="h-3 w-3 text-white/30" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
