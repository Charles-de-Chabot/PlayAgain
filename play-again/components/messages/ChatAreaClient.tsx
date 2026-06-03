"use client";

import React from "react";
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "@/components/messages/chat/ChatHeader";
import MessageThread from "@/components/messages/MessageThread";
import ChatInput from "@/components/messages/ChatInput";
import { OfferModal } from "@/components/messages/chat/modals/OfferModal";
import { PollModal } from "@/components/messages/chat/modals/PollModal";
import { ShipTrackingModal } from "@/components/messages/chat/modals/ShipTrackingModal";
import { DisputeModal } from "@/components/messages/chat/modals/DisputeModal";
import { Lightbox } from "@/components/messages/chat/Lightbox";

// --- Props & Interfaces ---

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
  isSupportThread?: boolean;
}

interface InvoiceInfo {
  id: number;
  status: string;
  address_id: number | null;
}

export interface ChatAreaClientProps {
  initialConversation: Conversation & { messages: Message[] };
  initialInvoice: InvoiceInfo | null;
  currentUserId: number;
  currentUserRole: string;
  partner: User;
  isBuyer: boolean;
  isSupportClosed?: boolean;
}

/**
 * ChatAreaClient is the decoupled high-level controller container for the messaging feature.
 *
 * @param props - SSR initial data and current user contexts.
 */
export default function ChatAreaClient({
  initialConversation,
  initialInvoice,
  currentUserId,
  currentUserRole,
  partner,
  isBuyer,
  isSupportClosed = false,
}: ChatAreaClientProps) {
  // Drive chat logic from hook
  const chat = useChat({
    conversationId: initialConversation.id,
    initialMessages: initialConversation.messages,
    initialInvoice,
    currentUserId,
    currentUserRole,
    isBuyer,
    isSupportClosed,
    product: initialConversation.product,
    isSupportThread: initialConversation.isSupportThread,
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">
      {/* Discussion Header */}
      <ChatHeader
        partner={partner}
        product={initialConversation.product}
        isBuyer={isBuyer}
        isReadOnly={chat.isReadOnly}
        isSupportClosed={isSupportClosed}
        acceptedOffer={!!chat.acceptedOffer}
        currentPrice={chat.currentPrice}
      />

      {/* Message List Area */}
      <MessageThread
        messages={chat.messages}
        currentUserId={currentUserId}
        isBuyer={isBuyer}
        isReadOnly={chat.isReadOnly}
        invoice={chat.invoice}
        shippingInvoiceId={chat.shippingInvoiceId}
        deliveringInvoiceId={chat.deliveringInvoiceId}
        isReleasingFunds={chat.isReleasingFunds}
        isDisputing={chat.isDisputing}
        verifiedInvoices={chat.verifiedInvoices}
        verificationCodes={chat.verificationCodes}
        setVerificationCodeForInvoice={chat.setVerificationCodeForInvoice}
        verifyingInvoiceId={chat.verifyingInvoiceId}
        verificationErrors={chat.verificationErrors}
        partnerName={partner.username || partner.firstname || "Utilisateur"}
        isMounted={chat.isMounted}
        handleVerifySecurityCode={chat.handleVerifySecurityCode}
        handleMarkAsShipped={chat.handleMarkAsShipped}
        handleSimulateDelivery={chat.handleSimulateDelivery}
        handleReleaseFunds={chat.handleReleaseFunds}
        handleDispute={chat.handleDispute}
        handleResolveOffer={chat.handleResolveOffer}
        handleVotePoll={chat.handleVotePoll}
        setActiveLightboxImage={chat.setActiveLightboxImage}
      />

      {/* Input / Action Form */}
      <ChatInput
        inputText={chat.inputText}
        setInputText={chat.setInputText}
        isReadOnly={chat.isReadOnly}
        isSending={chat.isSending}
        showActionsMenu={chat.showActionsMenu}
        setShowActionsMenu={chat.setShowActionsMenu}
        onSendText={chat.handleSendText}
        onImageSelect={chat.handleImageSelect}
        isBuyer={isBuyer}
        isSupportThread={!!initialConversation.isSupportThread}
        currentUserRole={currentUserRole}
        setShowOfferModal={chat.setShowOfferModal}
        setShowPollModal={chat.setShowPollModal}
      />

      {/* Modals & Portals */}
      <OfferModal
        isOpen={chat.showOfferModal}
        onClose={() => {
          chat.setShowOfferModal(false);
          chat.setOfferAmount("");
        }}
        offerAmount={chat.offerAmount}
        setOfferAmount={chat.setOfferAmount}
        onSendOffer={chat.handleSendOffer}
        isSending={chat.isSending}
      />

      <PollModal
        isOpen={chat.showPollModal}
        onClose={() => {
          chat.setShowPollModal(false);
          chat.setPollQuestion("");
          chat.setPollOptions(["", ""]);
        }}
        pollQuestion={chat.pollQuestion}
        setPollQuestion={chat.setPollQuestion}
        pollOptions={chat.pollOptions}
        setPollOptions={chat.setPollOptions}
        onSendPoll={chat.handleSendPoll}
        isSending={chat.isSending}
      />

      <ShipTrackingModal
        isOpen={chat.showShipModal}
        onClose={() => {
          chat.setShowShipModal(false);
          chat.setShipInvoiceId(null);
          chat.setShipTrackingInput("");
        }}
        shipTrackingInput={chat.shipTrackingInput}
        setShipTrackingInput={chat.setShipTrackingInput}
        onSubmit={chat.submitShipping}
        isShippingLoading={chat.shippingInvoiceId !== null}
      />

      <DisputeModal
        isOpen={chat.showDisputeModal}
        onClose={() => chat.setShowDisputeModal(false)}
        disputeReason={chat.disputeReason}
        setDisputeReason={chat.setDisputeReason}
        onSubmit={chat.submitDispute}
        isDisputing={chat.isDisputing}
      />

      <Lightbox
        isOpen={!!chat.activeLightboxImage}
        imageUrl={chat.activeLightboxImage}
        onClose={() => chat.setActiveLightboxImage(null)}
      />
    </div>
  );
}
