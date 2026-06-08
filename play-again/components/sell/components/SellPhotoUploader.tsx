"use client";

import React, { useRef } from "react";
import { Camera, Plus } from "lucide-react";

export interface PhotoItem {
  id?: number;
  url: string;
  file?: File;
}

export interface SellPhotoUploaderProps {
  photoItems: PhotoItem[];
  setPhotoItems: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
}

export default function SellPhotoUploader({
  photoItems,
  setPhotoItems,
}: SellPhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = (files: File[]) => {
    const newItems = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotoItems((prev) => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addImages(newFiles);
      e.target.value = "";
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      addImages(newFiles);
    }
  };

  const handleRemoveImage = (index: number) => {
    const item = photoItems[index];
    if (item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
    setPhotoItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section
      className="relative z-40 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
          <Camera className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tight">Photos du produit</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all"
        >
          <Plus className="w-8 h-8 text-zinc-700 group-hover:text-brand-accent transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-brand-accent">
            Ajouter
          </span>
        </div>

        {/* Display Previews */}
        {photoItems.map((item, index) => (
          <div key={index} className="aspect-square bg-zinc-950 border border-white/10 overflow-hidden relative group">
            <img src={item.url} alt="Aperçu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer bg-transparent border-0"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {/* Placeholders if less than 3 photos */}
        {Array.from({ length: Math.max(0, 3 - photoItems.length) }).map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-950/30 border border-white/5 border-dashed" />
        ))}
      </div>

      <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
        Ajoutez au moins 1 photo claire de votre article
      </p>
    </section>
  );
}
