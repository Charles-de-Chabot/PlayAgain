"use client";

import React, { useRef } from "react";
import { Plus, ImageIcon, Tag, BarChart2, Loader2, Send } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isReadOnly: boolean;
  isSending: boolean;
  showActionsMenu: boolean;
  setShowActionsMenu: React.Dispatch<React.SetStateAction<boolean>>;
  onSendText: (e?: React.FormEvent) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isBuyer: boolean;
  isSupportThread: boolean;
  currentUserRole: string;
  setShowOfferModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPollModal: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * ChatInput component provides a styled text area with multi-action trigger capabilities.
 */
export default function ChatInput({
  inputText,
  setInputText,
  isReadOnly,
  isSending,
  showActionsMenu,
  setShowActionsMenu,
  onSendText,
  onImageSelect,
  isBuyer,
  isSupportThread,
  currentUserRole,
  setShowOfferModal,
  setShowPollModal,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close actions menu on outside click
  const containerRef = useOutsideClick<HTMLDivElement>(() => {
    if (showActionsMenu) {
      setShowActionsMenu(false);
    }
  });

  return (
    <footer className="p-3 border-t border-white/10 bg-brand-black/20 backdrop-blur-md shrink-0 relative">
      <div ref={containerRef}>
        {/* Menu d'actions secondaires */}
        {showActionsMenu && !isReadOnly && (
          <div className="absolute bottom-16 left-3 bg-brand-black/90 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl backdrop-blur-lg z-20 animate-fade-in-up">
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setShowActionsMenu(false);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-white transition-colors"
            >
              <ImageIcon className="h-4.5 w-4.5 text-brand-accent" /> Image
            </button>
            {isBuyer && !isSupportThread && (
              <button
                type="button"
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
                type="button"
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

        <form onSubmit={onSendText} className="flex items-center gap-2">
          {/* Fichier input masqué */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Bouton Menu d'actions */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors shrink-0"
            >
              <Plus
                className={`h-5 w-5 transition-transform duration-200 ${
                  showActionsMenu ? "rotate-45 text-brand-accent" : ""
                }`}
              />
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
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white hover:bg-brand-primary/80 disabled:opacity-40 disabled:hover:bg-brand-primary transition-all shrink-0 border border-brand-primary/20 shadow-md shadow-brand-primary/10"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </button>
        </form>
      </div>
    </footer>
  );
}
