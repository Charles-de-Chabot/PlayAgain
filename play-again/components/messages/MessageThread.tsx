"use client";

import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { Message, InvoiceInfo } from "@/hooks/useChat";

export interface MessageThreadProps {
  messages: Message[];
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
}

/**
 * MessageThread renders the chat conversation list with smart scrolling mechanics.
 */
export default function MessageThread({
  messages,
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
}: MessageThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter messages visible only to certain parties (e.g. buyer-only or seller-only custom flow notes)
  const visibleMessages = messages.filter((msg) => {
    const msgMeta = msg.metadata;
    if (msgMeta && "visibleTo" in msgMeta && msgMeta.visibleTo) {
      if (msgMeta.visibleTo === "seller" && isBuyer) return false;
      if (msgMeta.visibleTo === "buyer" && !isBuyer) return false;
    }
    return true;
  });

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-transparent"
    >
      {visibleMessages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          currentUserId={currentUserId}
          isBuyer={isBuyer}
          isReadOnly={isReadOnly}
          invoice={invoice}
          shippingInvoiceId={shippingInvoiceId}
          deliveringInvoiceId={deliveringInvoiceId}
          isReleasingFunds={isReleasingFunds}
          isDisputing={isDisputing}
          verifiedInvoices={verifiedInvoices}
          verificationCodes={verificationCodes}
          setVerificationCodeForInvoice={setVerificationCodeForInvoice}
          verifyingInvoiceId={verifyingInvoiceId}
          verificationErrors={verificationErrors}
          partnerName={partnerName}
          isMounted={isMounted}
          handleVerifySecurityCode={handleVerifySecurityCode}
          handleMarkAsShipped={handleMarkAsShipped}
          handleSimulateDelivery={handleSimulateDelivery}
          handleReleaseFunds={handleReleaseFunds}
          handleDispute={handleDispute}
          handleResolveOffer={handleResolveOffer}
          handleVotePoll={handleVotePoll}
          setActiveLightboxImage={setActiveLightboxImage}
          scrollToBottom={scrollToBottom}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
