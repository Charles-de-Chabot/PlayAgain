"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface LightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

/**
 * Lightbox component displays images in a fullscreen modal utilizing React Portal.
 */
export function Lightbox({ isOpen, imageUrl, onClose }: LightboxProps) {
  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-default"
    >
      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
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
          src={imageUrl}
          alt="Aperçu plein écran"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl"
        />
      </div>
    </div>,
    document.body
  );
}
