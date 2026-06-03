"use client";

import React from "react";

export interface PollModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollQuestion: string;
  setPollQuestion: (q: string) => void;
  pollOptions: string[];
  setPollOptions: React.Dispatch<React.SetStateAction<string[]>>;
  onSendPoll: () => void;
  isSending: boolean;
}

/**
 * PollModal component permits administrators to create dynamic polling threads inside the chat.
 */
export function PollModal({
  isOpen,
  onClose,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
  onSendPoll,
  isSending,
}: PollModalProps) {
  if (!isOpen) return null;

  const handleAddOption = () => {
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleOptionChange = (idx: number, value: string) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-black/90 backdrop-blur-lg p-5 shadow-2xl animate-fade-in-up">
        <h3 className="text-base font-black text-white mb-2">Créer un sondage de discussion</h3>
        <p className="text-xs text-white/50 mb-4 font-medium">
          Posez une question et donnez des options de réponses à votre interlocuteur.
        </p>

        {/* Question */}
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-1">
            Votre question
          </label>
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
          <label className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-0.5">
            Options de réponses
          </label>
          {pollOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
            />
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-[10px] font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            + Ajouter une option
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSendPoll}
            disabled={!pollQuestion.trim() || isSending}
            className="flex-1 bg-brand-primary text-white font-bold text-xs py-2.5 rounded-xl hover:bg-brand-primary/80 transition-colors disabled:opacity-50"
          >
            Publier le sondage
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white py-2.5 rounded-xl transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
