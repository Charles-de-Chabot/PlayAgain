"use client";

import React from "react";
import { X } from "lucide-react";

export interface ImageLightboxProps {
  selectedImage: string | null;
  onClose: () => void;
}

/**
 * ImageLightbox renders a centered zoom view over a semi-transparent black overlay.
 */
export default function ImageLightbox({ selectedImage, onClose }: ImageLightboxProps) {
  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all shadow-md cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/15 shadow-2xl relative">
        <img src={selectedImage} alt="Zoom produit" className="max-w-full max-h-[85vh] object-contain" />
      </div>
    </div>
  );
}
