"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, resolveOffer, markAsRead, uploadChatImage } from "@/app/actions/message";

// --- Custom Interfaces (Strictly Typed) ---

export interface Media {
  url: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  state: string;
  is_sold: boolean;
  is_active: boolean;
  media: Media[];
  user_id: number;
}

export interface ImageMetadata {
  type: "IMAGE";
  url: string;
  width: number;
  height: number;
}

export interface OfferMetadata {
  type: "OFFER";
  amount: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface PollMetadata {
  type: "POLL";
  question: string;
  options: string[];
  votes: Record<string, number>;
  voters: Record<string, string>;
}

export interface SystemMetadata {
  type: "SYSTEM";
  offerMessageId?: number;
  offerStatus?: "ACCEPTED" | "DECLINED";
}

export interface ShippingLabelSellerMetadata {
  type: "shipping_label_seller";
  pdfUrl: string;
  visibleTo?: "seller" | "buyer";
}

export interface PurchaseConfirmedBuyerMetadata {
  type: "purchase_confirmed_buyer";
  visibleTo?: "seller" | "buyer";
}

export interface HandDeliveryBuyerMetadata {
  type: "hand_delivery_buyer";
  securityCode: string;
  visibleTo?: "seller" | "buyer";
}

export interface HandDeliverySellerMetadata {
  type: "hand_delivery_seller";
  invoiceId: number;
  visibleTo?: "seller" | "buyer";
}

export type MessageMetadata =
  | ImageMetadata
  | OfferMetadata
  | PollMetadata
  | SystemMetadata
  | ShippingLabelSellerMetadata
  | PurchaseConfirmedBuyerMetadata
  | HandDeliveryBuyerMetadata
  | HandDeliverySellerMetadata;

export interface Message {
  id: number;
  content: string;
  user_id: number;
  created_at: string | Date;
  is_read: boolean;
  metadata: MessageMetadata | null;
}

export interface InvoiceInfo {
  id: number;
  status: string;
  address_id: number | null;
}

export interface UseChatProps {
  /** The ID of the conversation thread */
  conversationId: number;
  /** Initial messages retrieved from SSR */
  initialMessages: Message[];
  /** Initial invoice info retrieved from SSR */
  initialInvoice: InvoiceInfo | null;
  /** Current connected user ID */
  currentUserId: number;
  /** Current connected user role */
  currentUserRole: string;
  /** True if the user is the buyer, false otherwise */
  isBuyer: boolean;
  /** True if the support ticket is resolved/closed */
  isSupportClosed?: boolean;
  /** Product associated with this conversation */
  product: Product | null;
  /** True if it is a helpdesk support thread */
  isSupportThread?: boolean;
}

export interface UseChatReturn {
  messages: Message[];
  invoice: InvoiceInfo | null;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  showActionsMenu: boolean;
  setShowActionsMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showOfferModal: boolean;
  setShowOfferModal: React.Dispatch<React.SetStateAction<boolean>>;
  offerAmount: string;
  setOfferAmount: (amount: string) => void;
  showPollModal: boolean;
  setShowPollModal: React.Dispatch<React.SetStateAction<boolean>>;
  pollQuestion: string;
  setPollQuestion: (question: string) => void;
  pollOptions: string[];
  setPollOptions: React.Dispatch<React.SetStateAction<string[]>>;
  activeLightboxImage: string | null;
  setActiveLightboxImage: (url: string | null) => void;

  verificationCodes: Record<number, string>;
  setVerificationCodeForInvoice: (invoiceId: number, code: string) => void;
  verifyingInvoiceId: number | null;
  verificationErrors: Record<number, string>;
  verifiedInvoices: Record<number, boolean>;
  handleVerifySecurityCode: (invoiceId: number) => Promise<void>;

  shippingInvoiceId: number | null;
  showShipModal: boolean;
  setShowShipModal: React.Dispatch<React.SetStateAction<boolean>>;
  shipInvoiceId: number | null;
  setShipInvoiceId: React.Dispatch<React.SetStateAction<number | null>>;
  shipTrackingInput: string;
  setShipTrackingInput: (tracking: string) => void;
  handleMarkAsShipped: (invoiceId: number) => void;
  submitShipping: () => Promise<void>;

  deliveringInvoiceId: number | null;
  handleSimulateDelivery: (invoiceId: number) => Promise<void>;

  isReleasingFunds: boolean;
  handleReleaseFunds: (invoiceId: number) => Promise<void>;

  isDisputing: boolean;
  showDisputeModal: boolean;
  setShowDisputeModal: React.Dispatch<React.SetStateAction<boolean>>;
  disputeInvoiceId: number | null;
  disputeReason: string;
  setDisputeReason: (reason: string) => void;
  handleDispute: (invoiceId: number) => void;
  submitDispute: () => Promise<void>;

  isMounted: boolean;
  isReadOnly: boolean;
  acceptedOffer: Message | undefined;
  currentPrice: number;
  handleSendText: (e?: React.FormEvent) => Promise<void>;
  handleSendOffer: () => Promise<void>;
  handleResolveOffer: (messageId: number, status: "ACCEPTED" | "DECLINED") => Promise<void>;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSendPoll: () => Promise<void>;
  handleVotePoll: (messageId: number, optionChosen: string) => Promise<void>;
}

/**
 * Custom hook to encapsulate the message fetching, polling, input handling, image uploads,
 * offer negotiations, shipping logs, hand-delivery codes, and mediation dispute submissions.
 *
 * @param props - Configurations for the current chat session.
 * @returns An object with state variables and operation handlers.
 */
export function useChat({
  conversationId,
  initialMessages,
  initialInvoice,
  currentUserId,
  currentUserRole,
  isBuyer,
  isSupportClosed = false,
  product,
  isSupportThread = false,
}: UseChatProps): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(initialInvoice);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // --- Hand Delivery (Main Propre) ---
  const [verificationCodes, setVerificationCodes] = useState<Record<number, string>>({});
  const [verifyingInvoiceId, setVerifyingInvoiceId] = useState<number | null>(null);
  const [verificationErrors, setVerificationErrors] = useState<Record<number, string>>({});
  const [verifiedInvoices, setVerifiedInvoices] = useState<Record<number, boolean>>({});

  // --- Logistics / Shipping ---
  const [shippingInvoiceId, setShippingInvoiceId] = useState<number | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipInvoiceId, setShipInvoiceId] = useState<number | null>(null);
  const [shipTrackingInput, setShipTrackingInput] = useState("");

  const [deliveringInvoiceId, setDeliveringInvoiceId] = useState<number | null>(null);

  // --- Financial Release / Disputes ---
  const [isReleasingFunds, setIsReleasingFunds] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInvoiceId, setDisputeInvoiceId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setVerificationCodeForInvoice = useCallback((invoiceId: number, code: string) => {
    setVerificationCodes((prev) => ({ ...prev, [invoiceId]: code }));
  }, []);

  // Compute read-only status and offer prices
  const isTransactionFinished = (() => {
    if (!invoice) return false;
    const isShipping = invoice.address_id !== null;
    if (isShipping) {
      return ["SHIPPED", "DELIVERED", "COMPLETED"].includes(invoice.status);
    } else {
      return invoice.status === "COMPLETED";
    }
  })();

  const isReadOnly =
    isSupportClosed ||
    (product ? (!product.is_active && !product.is_sold) || isTransactionFinished : false) ||
    isTransactionFinished;

  const acceptedOffer = messages.find(
    (msg) =>
      msg.metadata &&
      msg.metadata.type === "OFFER" &&
      msg.metadata.status === "ACCEPTED"
  );

  const currentPrice = acceptedOffer
    ? (acceptedOffer.metadata as OfferMetadata).amount
    : product
    ? product.price
    : 0;

  // Mark all messages as read on mount
  useEffect(() => {
    const markInitialAsRead = async () => {
      try {
        await markAsRead(conversationId);
      } catch (err) {
        console.error("Failed to mark messages as read on mount:", err);
      }
    };
    markInitialAsRead();
  }, [conversationId]);

  // Polling messages every 4 seconds
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const pollMessages = async () => {
      if (!document.hasFocus()) return;

      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length !== messages.length) {
            setMessages(data.messages);
            await markAsRead(conversationId);
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
  }, [conversationId, messages.length]);

  // Verify hand delivery code
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

      // Refresh message thread
      const resMsg = await fetch(`/api/conversations/${conversationId}/messages`);
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

  const handleMarkAsShipped = useCallback((invoiceId: number) => {
    setShipInvoiceId(invoiceId);
    setShipTrackingInput("");
    setShowShipModal(true);
  }, []);

  // Submit shipping tracking
  const submitShipping = async () => {
    if (shipInvoiceId === null || shippingInvoiceId !== null) return;
    if (!shipTrackingInput.trim()) {
      alert("Le numéro de suivi est requis pour marquer le colis comme expédié.");
      return;
    }

    setShippingInvoiceId(shipInvoiceId);
    const trackingNumber = shipTrackingInput.trim();

    try {
      const res = await fetch(`/api/invoices/${shipInvoiceId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'expédition");
      }

      setShowShipModal(false);
      setShipInvoiceId(null);
      setShipTrackingInput("");

      // Refresh message thread
      const resMsg = await fetch(
        `/api/conversations/${conversationId}/messages?t=${Date.now()}`
      );
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

  // Simulate delivery (Admin testing tool)
  const handleSimulateDelivery = async (invoiceId: number) => {
    if (deliveringInvoiceId !== null) return;
    setDeliveringInvoiceId(invoiceId);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/deliver`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la livraison");
      }

      // Refresh message thread
      const resMsg = await fetch(`/api/conversations/${conversationId}/messages`);
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
      setDeliveringInvoiceId(null);
    }
  };

  // Release funds to seller
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

      // Refresh message thread
      const resMsg = await fetch(`/api/conversations/${conversationId}/messages`);
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

  // Trigger dispute modal
  const handleDispute = useCallback((invoiceId: number) => {
    if (isDisputing) return;
    setDisputeInvoiceId(invoiceId);
    setDisputeReason("");
    setShowDisputeModal(true);
  }, [isDisputing]);

  // Submit dispute description
  const submitDispute = async () => {
    if (!disputeInvoiceId) return;
    if (!disputeReason.trim()) {
      alert("Vous devez décrire le problème pour pouvoir déclarer un litige.");
      return;
    }

    const invoiceId = disputeInvoiceId;
    const reason = disputeReason.trim();

    setShowDisputeModal(false);
    setIsDisputing(true);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'ouverture du litige");
      }

      alert(
        "Votre litige a bien été déclaré. Vous allez être redirigé vers votre fil de discussion avec notre Service Après-Vente."
      );
      window.location.href = `/messages/${data.conversationId}`;
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
      setIsDisputing(false);
    }
  };

  // Send textual message
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || isReadOnly) return;

    const textToSend = inputText;
    setInputText("");
    setIsSending(true);

    // Optimistic Update
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
      const realMessage = (await sendMessage(conversationId, textToSend)) as Message;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      );
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      alert(err.message || "Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  // Send a pricing offer
  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0 || isSending || isReadOnly) return;

    setIsSending(true);
    setShowOfferModal(false);
    setOfferAmount("");

    const metadata: OfferMetadata = {
      type: "OFFER",
      amount: amount,
      status: "PENDING",
    };

    try {
      await sendMessage(
        conversationId,
        `Offre de prix proposée : ${amount} €`,
        metadata
      );
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
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

  // Resolve pricing offer (Accept/Decline)
  const handleResolveOffer = async (messageId: number, status: "ACCEPTED" | "DECLINED") => {
    try {
      await resolveOffer(messageId, status);
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur");
    }
  };

  // Handle uploading and sharing images in chat
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSending || isReadOnly) return;

    setIsSending(true);
    setShowActionsMenu(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { url } = await uploadChatImage(formData);

      const metadata: ImageMetadata = {
        type: "IMAGE",
        url: url,
        width: 800,
        height: 600,
      };

      await sendMessage(conversationId, "Image partagé", metadata);

      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err: any) {
      alert(err.message || "Erreur de téléversement");
    } finally {
      setIsSending(false);
      e.target.value = "";
    }
  };

  // Send a Poll / Survey
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

    const metadata: PollMetadata = {
      type: "POLL",
      question: pollQuestion,
      options: validOptions,
      votes: initialVotes,
      voters: {},
    };

    try {
      await sendMessage(conversationId, `Sondage : ${pollQuestion}`, metadata);
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
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

  // Vote in a Poll / Survey
  const handleVotePoll = async (messageId: number, optionChosen: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const metadata = { ...(message.metadata as PollMetadata) };
    if (!metadata.votes) metadata.votes = {};
    if (!metadata.voters) metadata.voters = {};

    const previousVote = metadata.voters[currentUserId.toString()];
    if (previousVote === optionChosen) return;

    if (previousVote) {
      metadata.votes[previousVote] = Math.max(0, (metadata.votes[previousVote] || 1) - 1);
    }

    metadata.votes[optionChosen] = (metadata.votes[optionChosen] || 0) + 1;
    metadata.voters[currentUserId.toString()] = optionChosen;

    try {
      await fetch(`/api/conversations/${conversationId}/messages`);
      await sendMessage(
        conversationId,
        `Vote mis à jour dans : ${metadata.question}`,
        metadata
      );

      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    messages,
    invoice,
    inputText,
    setInputText,
    isSending,
    showActionsMenu,
    setShowActionsMenu,
    showOfferModal,
    setShowOfferModal,
    offerAmount,
    setOfferAmount,
    showPollModal,
    setShowPollModal,
    pollQuestion,
    setPollQuestion,
    pollOptions,
    setPollOptions,
    activeLightboxImage,
    setActiveLightboxImage,
    verificationCodes,
    setVerificationCodeForInvoice,
    verifyingInvoiceId,
    verificationErrors,
    verifiedInvoices,
    handleVerifySecurityCode,
    shippingInvoiceId,
    showShipModal,
    setShowShipModal,
    shipInvoiceId,
    setShipInvoiceId,
    shipTrackingInput,
    setShipTrackingInput,
    handleMarkAsShipped,
    submitShipping,
    deliveringInvoiceId,
    handleSimulateDelivery,
    isReleasingFunds,
    handleReleaseFunds,
    isDisputing,
    showDisputeModal,
    setShowDisputeModal,
    disputeInvoiceId,
    disputeReason,
    setDisputeReason,
    handleDispute,
    submitDispute,
    isMounted,
    isReadOnly,
    acceptedOffer,
    currentPrice,
    handleSendText,
    handleSendOffer,
    handleResolveOffer,
    handleImageSelect,
    handleSendPoll,
    handleVotePoll,
  };
}
