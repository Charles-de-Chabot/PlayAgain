"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Supprimer l'article",
  description = "Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.",
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  // Set mounted on client to prevent SSR mismatch with Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950/95 border border-white/10 rounded-3xl w-full max-w-sm p-6 relative shadow-[0_10px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 cursor-default overflow-hidden"
      >
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />

        {/* Visual Top Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-brand-primary via-brand-accent to-brand-primary" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-4">
          {/* Icon wrapper with a premium double-circle ring */}
          <div className="relative mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <Trash2 className="w-7 h-7 stroke-2" />
            <span className="absolute inset-0 rounded-full border border-red-500/10 animate-ping opacity-75" />
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-wider italic">
            {title}
          </h3>

          <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-[280px]">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-6 w-full">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-xs uppercase tracking-widest italic transition-all duration-300 shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.45)] hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            Supprimer
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-extrabold text-xs uppercase tracking-widest italic transition-all duration-300 active:scale-98 cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
