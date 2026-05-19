"use client";

import { useState } from "react";

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

  const currentImage = media?.[selectedIndex]?.url || "/images/placeholder-product.png";

  return (
    <div className="space-y-4 w-full">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
        <img 
          src={currentImage} 
          alt={productTitle}
          className="w-full h-full object-cover transition-all duration-300"
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
    </div>
  );
}
