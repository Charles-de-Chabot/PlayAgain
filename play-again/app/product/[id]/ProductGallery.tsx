"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface MediaItem {
  id: number | string;
  url: string;
}

interface ProductGalleryProps {
  media: MediaItem[];
  productTitle: string;
  categoryLabel: string;
}

export function ProductGallery({ media, productTitle, categoryLabel }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentImage = media?.[selectedIndex]?.url || "/images/placeholder-product.png";

  return (
    <div className="space-y-4 w-full">
      {/* Image principale */}
      <div 
        onClick={() => setShowLightbox(true)}
        className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl cursor-pointer group"
      >
        <img 
          src={currentImage} 
          alt={productTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />
        {/* Badge Catégorie */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-brand-primary/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
          {categoryLabel}
        </div>
      </div>

      {/* Thumbnails si plusieurs images */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {media.map((m, i) => {
            const isSelected = i === selectedIndex;
            return (
              <div 
                key={m.id} 
                onClick={() => {
                  if (!isSelected) {
                    setSelectedIndex(i);
                  }
                }}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-brand-primary opacity-100' 
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox plein écran portalisée */}
      {isMounted && showLightbox && createPortal(
        <div 
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-default"
        >
          {/* Bouton de fermeture */}
          <button
            onClick={() => setShowLightbox(false)}
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
              src={currentImage}
              alt={productTitle}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
