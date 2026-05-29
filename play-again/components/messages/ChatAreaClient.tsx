"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Send, 
  Image as ImageIcon, 
  Tag, 
  ChevronLeft, 
  Lock, 
  Check, 
  CheckCheck,
  Plus,
  Loader2,
  DollarSign,
  BarChart2,
  User,
  X,
  Package,
  Download,
  ShieldCheck,
  QrCode,
  MapPin,
  AlertCircle
} from "lucide-react";
import { sendMessage, resolveOffer, markAsRead, uploadChatImage } from "@/app/actions/message";

interface User {
  id: number;
  username: string | null;
  profile_picture: string | null;
  firstname: string | null;
  lastname: string | null;
}

interface Media {
  url: string;
}

interface Product {
  id: number;
  title: string;
  price: any;
  state: string;
  is_sold: boolean;
  is_active: boolean;
  media: Media[];
  user_id: number;
}

interface Message {
  id: number;
  content: string;
  user_id: number;
  created_at: any;
  is_read: boolean;
  metadata: any;
}

interface Conversation {
  id: number;
  user_id: number;
  product: Product;
}

interface InvoiceInfo {
  id: number;
  status: string;
  address_id: number | null;
}

interface ChatAreaClientProps {
  initialConversation: Conversation & { messages: Message[] };
  initialInvoice: InvoiceInfo | null;
  currentUserId: number;
  currentUserRole: string;
  partner: User;
  isBuyer: boolean;
}

export default function ChatAreaClient({
  initialConversation,
  initialInvoice,
  currentUserId,
  currentUserRole,
  partner,
  isBuyer,
}: ChatAreaClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialConversation.messages);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(initialInvoice);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // --- Validation de remise en main propre (Main Propre) ---
  const [verificationCodes, setVerificationCodes] = useState<Record<number, string>>({});
  const [verifyingInvoiceId, setVerifyingInvoiceId] = useState<number | null>(null);
  const [verificationErrors, setVerificationErrors] = useState<Record<number, string>>({});
  const [verifiedInvoices, setVerifiedInvoices] = useState<Record<number, boolean>>({});

  const handleVerifySecurityCode = async (invoiceId: number) => {
    const code = verificationCodes[invoiceId];
    if (!code || !code.trim() || verifyingInvoiceId !== null) return;

    setVerifyingInvoiceId(invoiceId);
    setVerificationErrors((prev) => ({ ...prev, [invoiceId]: "" }));

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de validation");
      }

      setVerifiedInvoices((prev) => ({ ...prev, [invoiceId]: true }));
      
      // Récupérer le fil des messages rafraîchi
      const resMsg = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMessages(dataMsg.messages);
        if (dataMsg.invoice) {
          setInvoice(dataMsg.invoice);
        }
      }
    } catch (err: any) {
      setVerificationErrors((prev) => ({ ...prev, [invoiceId]: err.message }));
    } finally {
      setVerifyingInvoiceId(null);
    }
  };

  const [shippingInvoiceId, setShippingInvoiceId] = useState<number | null>(null);

  const handleMarkAsShipped = async (invoiceId: number) => {
    if (shippingInvoiceId !== null) return;
    setShippingInvoiceId(invoiceId);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/ship`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'expédition");
      }

      // Récupérer le fil des messages rafraîchi
      const resMsg = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMessages(dataMsg.messages);
        if (dataMsg.invoice) {
          setInvoice(dataMsg.invoice);
        }
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
    } finally {
      setShippingInvoiceId(null);
    }
  };

  const [isReleasingFunds, setIsReleasingFunds] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  const handleReleaseFunds = async (invoiceId: number) => {
    if (isReleasingFunds) return;
    setIsReleasingFunds(true);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/release`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la libération des fonds");
      }

      // Récupérer le fil des messages rafraîchi
      const resMsg = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMessages(dataMsg.messages);
        if (dataMsg.invoice) {
          setInvoice(dataMsg.invoice);
        }
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
    } finally {
      setIsReleasingFunds(false);
    }
  };

  const handleDispute = async (invoiceId: number) => {
    if (isDisputing) return;
    if (!confirm("Voulez-vous vraiment déclarer un problème concernant ce colis ? Les fonds resteront gelés le temps d'analyser votre demande par notre service client.")) {
      return;
    }
    setIsDisputing(true);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dispute`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'ouverture du litige");
      }

      // Récupérer le fil des messages rafraîchi
      const resMsg = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMessages(dataMsg.messages);
        if (dataMsg.invoice) {
          setInvoice(dataMsg.invoice);
        }
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
    } finally {
      setIsDisputing(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const product = initialConversation.product;
  
  // Le chat est bloqué si :
  // 1. L'annonce est désactivée par le vendeur (et non vendue)
  // 2. OU si le produit est vendu ET la transaction est définitivement terminée (expédiée ou remise validée)
  const isTransactionFinished = (() => {
    if (!product.is_sold || !invoice) return false;
    
    const isShipping = invoice.address_id !== null;
    if (isShipping) {
      // Pour les colis : bloqué dès que c'est expédié, livré ou complété
      return ["SHIPPED", "DELIVERED", "COMPLETED"].includes(invoice.status);
    } else {
      // Pour la remise en main propre : bloqué dès que c'est complété (code saisi)
      return invoice.status === "COMPLETED";
    }
  })();

  const isReadOnly = (!product.is_active && !product.is_sold) || isTransactionFinished;

  const acceptedOffer = messages.find(
    (msg) => msg.metadata && msg.metadata.type === "OFFER" && msg.metadata.status === "ACCEPTED"
  );
  const currentPrice = acceptedOffer ? acceptedOffer.metadata.amount : product.price;

  // Marquage automatique de tous les messages comme lus dès l'ouverture du salon
  useEffect(() => {
    const markInitialAsRead = async () => {
      try {
        await markAsRead(initialConversation.id);
      } catch (err) {
        console.error("Failed to mark messages as read on mount:", err);
      }
    };
    markInitialAsRead();
  }, [initialConversation.id]);

  // 1. Polling intelligent des messages (Toutes les 4 secondes)
  useEffect(() => {
    let intervalId: any;

    const pollMessages = async () => {
      // Ne requête le serveur que si l'onglet est actif
      if (!document.hasFocus()) return;

      try {
        const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length !== messages.length) {
            setMessages(data.messages);
            await markAsRead(initialConversation.id);
          }
          if (data.invoice) {
            setInvoice(data.invoice);
          }
        }
      } catch (err) {
        console.error("❌ [Polling Error]", err);
      }
    };

    intervalId = setInterval(pollMessages, 4000);
    return () => clearInterval(intervalId);
  }, [initialConversation.id, messages.length]);

  // 2. Auto-scroll vers le bas lors de l'arrivée de messages (sans scroller la fenêtre globale)
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Envoi d'un message texte
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || isReadOnly) return;

    const textToSend = inputText;
    setInputText("");
    setIsSending(true);

    // Optimistic Update : Insertion immédiate dans l'UI locale (0ms)
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      content: textToSend,
      user_id: currentUserId,
      created_at: new Date(),
      is_read: false,
      metadata: null,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const realMessage = await sendMessage(initialConversation.id, textToSend);
      // Remplacer le message optimiste par le vrai message confirmé par la BDD
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      );
    } catch (err: any) {
      console.error(err);
      // Supprimer le message optimiste en cas d'erreur serveur
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert(err.message || "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  // 4. Envoi d'une offre de prix
  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0 || isSending || isReadOnly) return;

    setIsSending(true);
    setShowOfferModal(false);
    setOfferAmount("");

    const metadata = {
      type: "OFFER",
      amount: amount,
      status: "PENDING",
    };

    try {
      await sendMessage(
        initialConversation.id,
        `Offre de prix proposée : ${amount} €`,
        metadata
      );
      // Forcer le re-fetch des messages
      const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'envoi de l'offre");
    } finally {
      setIsSending(false);
    }
  };

  // 5. Résolution d'une offre (Accepter / Décliner)
  const handleResolveOffer = async (messageId: number, status: "ACCEPTED" | "DECLINED") => {
    try {
      await resolveOffer(messageId, status);
      // Re-fetch
      const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur");
    }
  };

  // 6. Gestion du téléversement réel d'image
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSending || isReadOnly) return;

    setIsSending(true);
    setShowActionsMenu(false);

    try {
      // 1. Téléversement réel du fichier sur le serveur
      const formData = new FormData();
      formData.append("file", file);
      
      const { url } = await uploadChatImage(formData);

      const metadata = {
        type: "IMAGE",
        url: url,
        width: 800,
        height: 600,
      };

      // 2. Enregistrement en BDD
      await sendMessage(initialConversation.id, "Image partagée", metadata);
      
      // 3. Re-fetch
      const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur de téléversement");
    } finally {
      setIsSending(false);
      // Réinitialiser la valeur de l'input pour permettre le re-téléversement du même fichier
      e.target.value = "";
    }
  };

  // 7. Envoi d'un sondage/questionnaire
  const handleSendPoll = async () => {
    if (!pollQuestion.trim() || isSending || isReadOnly) return;

    const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Veuillez fournir au moins 2 options.");
      return;
    }

    setIsSending(true);
    setShowPollModal(false);
    setPollQuestion("");
    setPollOptions(["", ""]);

    const initialVotes: Record<string, number> = {};
    validOptions.forEach((opt) => {
      initialVotes[opt] = 0;
    });

    const metadata = {
      type: "POLL",
      question: pollQuestion,
      options: validOptions,
      votes: initialVotes,
      voters: {} as Record<string, string>,
    };

    try {
      await sendMessage(initialConversation.id, `Sondage : ${pollQuestion}`, metadata);
      // Re-fetch
      const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur");
    } finally {
      setIsSending(false);
    }
  };

  // Vote dans un sondage
  const handleVotePoll = async (messageId: number, optionChosen: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const metadata = { ...(message.metadata as any) };
    if (!metadata.votes) metadata.votes = {};
    if (!metadata.voters) metadata.voters = {};

    const previousVote = metadata.voters[currentUserId.toString()];
    if (previousVote === optionChosen) return; // Déjà voté pour ça

    // Retirer le vote précédent si existant
    if (previousVote) {
      metadata.votes[previousVote] = Math.max(0, (metadata.votes[previousVote] || 1) - 1);
    }

    // Ajouter le nouveau vote
    metadata.votes[optionChosen] = (metadata.votes[optionChosen] || 0) + 1;
    metadata.voters[currentUserId.toString()] = optionChosen;

    try {
      // Mettre à jour en BDD en ré-enregistrant le message
      await fetch(`/api/conversations/${initialConversation.id}/messages`); // Sync locale
      // Nous mettons à jour le message via une action locale pour l'instant
      // ou en le poussant en base de données.
      await sendMessage(initialConversation.id, `Vote mis à jour dans : ${metadata.question}`, metadata);
      
      // Re-fetch
      const res = await fetch(`/api/conversations/${initialConversation.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const partnerName = partner.username || partner.firstname || "Utilisateur";
  const partnerImage = partner.profile_picture || "/uploads/avatars/default.png";
  const productMedia = product.media[0]?.url;
  const partnerSoldCount = (partner as any).products?.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">
      {/* 1. Bandeau En-tête de Discussion */}
      <header className="p-3.5 border-b border-white/10 bg-brand-black/20 backdrop-blur-md flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/messages"
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          
          {partner.profile_picture ? (
            <img
              src={partner.profile_picture}
              alt={partnerName}
              className="h-11 w-11 rounded-full object-cover border border-white/15"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-zinc-400">
              <User className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1 text-left flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-sm sm:text-base font-black text-white truncate leading-none">{partnerName}</h2>

            {/* Badge Ventes Réussies (Preuve Sociale Compacte) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-accent/30 bg-zinc-950/80 hover:bg-zinc-900/50 transition-all select-none group w-fit cursor-default shrink-0 shadow-[0_0_10px_rgba(198,255,52,0.05)] hover:shadow-[0_0_15px_rgba(198,255,52,0.15)] hover:border-brand-accent/50 duration-300">
              <span className="text-[9px] animate-pulse">⚡</span>
              <span className="text-[8px] font-black uppercase tracking-[0.15em] italic text-brand-accent">
                {partnerSoldCount} {partnerSoldCount > 1 ? "vendus" : "vendu"}
              </span>
            </div>
            
            {/* Séparateur discret */}
            <span className="text-white/20 text-xs select-none hidden sm:inline">•</span>
            
            {/* Infos produit affichées à côté du nom */}
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-white/50 min-w-0 leading-none">
              <span className="font-bold text-brand-accent truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
              <span className="text-white/30">•</span>
              <span>État : <span className="text-white/80 font-bold">{product.state}</span></span>
              <span className="text-white/30">•</span>
              <span>Prix : <span className="font-semibold text-white/80">
                {acceptedOffer ? (
                  <>
                    <span className="line-through text-white/30 mr-1">{product.price} €</span>
                    <span className="text-brand-accent font-black">{currentPrice} €</span>
                  </>
                ) : (
                  <span>{product.price} €</span>
                )}
              </span></span>
            </div>
          </div>
        </div>

        {/* Partie droite (Photo du produit à gauche du bouton Acheter) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {productMedia && (
            <img
              src={productMedia}
              alt={product.title}
              className="h-10 w-10 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
            />
          )}
          {isBuyer && !isReadOnly && (
            <Link
              href={acceptedOffer ? `/product/${product.id}/checkout` : `/product/${product.id}`}
              className="bg-brand-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-brand-primary/80 border border-brand-primary/20 transition-all shadow-md"
            >
              Acheter
            </Link>
          )}
        </div>
      </header>

      {/* Bannière d'avertissement Lecture seule */}
      {isReadOnly && (
        <div className="bg-brand-primary/10 border-b border-brand-primary/20 p-2 text-center text-xs text-white/70 font-semibold flex items-center justify-center gap-2">
          <Lock className="h-3.5 w-3.5 text-brand-primary" />
          {!product.is_active && !product.is_sold 
            ? "Le vendeur a supprimé cette annonce. La discussion est désormais en lecture seule."
            : "La transaction est terminée. La discussion est désormais fermée en lecture seule."
          }
        </div>
      )}

      {/* 2. Fil des Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-transparent">
        {messages.filter((msg) => {
          const msgMeta = msg.metadata as any;
          if (msgMeta && msgMeta.visibleTo) {
            if (msgMeta.visibleTo === "seller" && isBuyer) return false;
            if (msgMeta.visibleTo === "buyer" && !isBuyer) return false;
          }
          return true;
        }).map((msg, index) => {
          const isMe = msg.user_id === currentUserId;
          const msgMeta = msg.metadata as any;
          const showTime = true; // On affiche l'heure pour chaque bulle

          const msgTime = isMounted
            ? new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          // Rendu des messages riches
          if (msgMeta) {
            // 1. Bordereau d'expédition Vendeur (Privé)
            if (msgMeta.type === "shipping_label_seller") {
              const match = msgMeta.pdfUrl?.match(/\/api\/invoices\/(\d+)\/shipping-label/);
              const invoiceId = match ? parseInt(match[1]) : null;
              
              const isShipped = invoice && (invoice.status === "SHIPPED" || invoice.status === "DELIVERED" || invoice.status === "COMPLETED");
              const isShippingLoading = invoiceId !== null && shippingInvoiceId === invoiceId;

              return (
                <div key={msg.id} className="flex justify-start animate-fade-in-up">
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
                          <div className="w-full py-2.5 px-4 bg-brand-accent/15 border border-brand-accent/30 text-brand-accent text-center text-xs font-black rounded-xl flex items-center justify-center gap-1.5">
                            <Check className="h-4 w-4" />
                            Colis marqué comme expédié
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
                <div key={msg.id} className="flex justify-end animate-fade-in-up">
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

                      {/* Si le colis est livré : Offrir à l'acheteur les boutons "Tout est OK" et "Déclarer un problème" */}
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
              return (
                <div key={msg.id} className="flex justify-end animate-fade-in-up">
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
                        {msgMeta.securityCode}
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
              const invoiceId = msgMeta.invoiceId;
              const isVerified = verifiedInvoices[invoiceId] || false;
              const enteredCode = verificationCodes[invoiceId] || "";
              const error = verificationErrors[invoiceId] || "";
              const isLoading = verifyingInvoiceId === invoiceId;

              return (
                <div key={msg.id} className="flex justify-start animate-fade-in-up">
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
                            onChange={(e) => setVerificationCodes(prev => ({ ...prev, [invoiceId]: e.target.value.toUpperCase() }))}
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
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}
                >
                  <div className={`max-w-[280px] sm:max-w-md flex flex-col gap-1`}>
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
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
              const amount = msgMeta.amount;
              const status = msgMeta.status; // PENDING, ACCEPTED, DECLINED

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}
                >
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

                    {/* Boutons d'action pour le vendeur si PENDING */}
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
              const question = msgMeta.question;
              const options = msgMeta.options || [];
              const votes = msgMeta.votes || {};
              const voters = msgMeta.voters || {};
              const hasVoted = voters[currentUserId.toString()] !== undefined;
              const userChoice = voters[currentUserId.toString()];

              const totalVotes = Object.values(votes).reduce((a: any, b: any) => a + b, 0) as number;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}
                >
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
                              // Rendu après vote (Barres de progression animées)
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
                              // Rendu avant vote (Boutons interactifs)
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
                <div key={msg.id} className="flex justify-center animate-fade-in-up">
                  <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/5 text-[11px] text-white/55 font-bold tracking-wide text-center">
                    📢 {msg.content}
                  </div>
                </div>
              );
            }
          }

          // E. Rendu Message Texte Classique
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div className="flex flex-col gap-0.5 max-w-[70%]">
                <div
                  className={`p-3 text-sm rounded-2xl shadow-md ${
                    isMe
                      ? "bg-brand-primary text-white rounded-tr-none font-medium"
                      : "bg-white/10 border border-white/10 text-white rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                </div>
                {showTime && (
                  <div className={`flex items-center gap-1 text-[9px] text-white/40 px-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span>{msgTime}</span>
                    {isMe && (
                      msg.is_read ? (
                        <CheckCheck className="h-3 w-3 text-brand-accent" />
                      ) : (
                        <Check className="h-3 w-3 text-white/30" />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Zone de Saisie & Actions */}
      <footer className="p-3 border-t border-white/10 bg-brand-black/20 backdrop-blur-md flex-shrink-0">
        {/* Menu d'actions secondaires */}
        {showActionsMenu && !isReadOnly && (
          <div className="absolute bottom-16 left-3 bg-brand-black/90 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl backdrop-blur-lg z-20 animate-fade-in-up">
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowActionsMenu(false);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-white transition-colors"
            >
              <ImageIcon className="h-4.5 w-4.5 text-brand-accent" /> Image
            </button>
            {isBuyer && (
              <button
                onClick={() => {
                  setShowOfferModal(true);
                  setShowActionsMenu(false);
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-white transition-colors"
              >
                <Tag className="h-4.5 w-4.5 text-brand-primary" /> Faire une offre
              </button>
            )}
            {currentUserRole === "ADMIN" && (
              <button
                onClick={() => {
                  setShowPollModal(true);
                  setShowActionsMenu(false);
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-white transition-colors"
              >
                <BarChart2 className="h-4.5 w-4.5 text-brand-accent" /> Créer un sondage
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSendText} className="flex items-center gap-2">
          {/* Fichier input masqué */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Bouton Menu d'actions */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors flex-shrink-0"
            >
              <Plus className={`h-5 w-5 transition-transform duration-200 ${showActionsMenu ? "rotate-45 text-brand-accent" : ""}`} />
            </button>
          )}

          {/* Champ de Saisie */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isReadOnly}
            placeholder={isReadOnly ? "Discussion fermée en lecture seule" : "Rédiger un message..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-sm focus:outline-none focus:border-brand-accent text-white placeholder-white/35 disabled:opacity-50 transition-colors"
          />

          {/* Bouton d'Envoi */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending || isReadOnly}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white hover:bg-brand-primary/80 disabled:opacity-40 disabled:hover:bg-brand-primary transition-all flex-shrink-0 border border-brand-primary/20 shadow-md shadow-brand-primary/10"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </button>
        </form>
      </footer>

      {/* 4. MODALE D'OFFRE DE PRIX */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-brand-black/90 backdrop-blur-lg p-5 shadow-2xl animate-fade-in-up">
            <h3 className="text-base font-black text-white mb-2">Faire une offre de prix</h3>
            <p className="text-xs text-white/50 mb-4">
              Proposez un prix d'achat au vendeur. S'il l'accepte, vous pourrez commander l'article directement à ce tarif.
            </p>

            <div className="relative mb-4">
              <span className="absolute left-3 top-2 text-sm text-white/50 font-bold">€</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Montant de votre offre"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-7 pr-4 text-sm text-white focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendOffer}
                disabled={!offerAmount || isSending}
                className="flex-1 bg-brand-accent text-brand-black font-bold text-xs py-2.5 rounded-xl hover:bg-brand-accent/80 transition-colors disabled:opacity-50"
              >
                Envoyer l'offre
              </button>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferAmount("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white py-2.5 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODALE DE CREATION DE SONDAGE */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-black/90 backdrop-blur-lg p-5 shadow-2xl animate-fade-in-up">
            <h3 className="text-base font-black text-white mb-2">Créer un sondage de discussion</h3>
            <p className="text-xs text-white/50 mb-4">Posez une question et donnez des options de réponses à votre interlocuteur.</p>

            {/* Question */}
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-1">Votre question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ex: Êtes-vous disponible ce soir pour une remise en main propre ?"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Options */}
            <div className="mb-4 space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-0.5">Options de réponses</label>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              ))}
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ""])}
                className="text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1"
              >
                + Ajouter une option
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendPoll}
                disabled={!pollQuestion.trim() || isSending}
                className="flex-1 bg-brand-primary text-white font-bold text-xs py-2.5 rounded-xl hover:bg-brand-primary/80 transition-colors disabled:opacity-50"
              >
                Publier le sondage
              </button>
              <button
                onClick={() => {
                  setShowPollModal(false);
                  setPollQuestion("");
                  setPollOptions(["", ""]);
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white py-2.5 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODALE LIGHTBOX PLEIN ÉCRAN POUR LES IMAGES (PORTALISÉE HORS DU FLUX DU LAYOUT) */}
      {isMounted && activeLightboxImage && createPortal(
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-default"
        >
          {/* Bouton de fermeture */}
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-4 right-4 flex items-center justify-center h-12 w-12 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-lg cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Container Image */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-scale-in"
          >
            <img
              src={activeLightboxImage}
              alt="Aperçu plein écran"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
