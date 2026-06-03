"use client";

import React, { useState, useEffect } from "react";
import { Camera, X, Loader2, ChevronLeft } from "lucide-react";
import { uploadVerificationDocument } from "@/app/actions/verification";

export interface StepSelfieProps {
  selfieUrl: string | null;
  setSelfieUrl: (val: string | null) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * StepSelfie handles handwritten signature/note verification selfie.
 */
export default function StepSelfie({
  selfieUrl,
  setSelfieUrl,
  onPrev,
  onSubmit,
  isSubmitting,
}: StepSelfieProps) {
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Local object URL state for previewing the file
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Clean up object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [selfiePreview]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSelfie(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadVerificationDocument(formData);
      if (result.success && result.url) {
        const localPreviewUrl = URL.createObjectURL(file);
        setSelfieUrl(result.url);
        setSelfiePreview(localPreviewUrl);
      } else {
        alert(result.error || "Échec de l'upload du fichier");
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion lors du téléversement");
    } finally {
      setUploadingSelfie(false);
    }
  };

  const clearFile = () => {
    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
      setSelfiePreview(null);
    }
    setSelfieUrl(null);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
          4. Selfie avec preuve d'inscription
        </h3>
        <p className="text-xs text-zinc-400 font-bold">
          Prenez un selfie en tenant une feuille de papier avec l'inscription manuscrite exacte : "Play Again".
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Guide / Checklist */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-brand-accent block animate-pulse font-black">
            💡 Consignes pour être validé :
          </span>
          <ul className="space-y-2 text-[11px] text-zinc-400 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-brand-accent">✓</span>
              <span>Votre visage doit être entièrement découvert (pas de lunettes de soleil, pas de casquette).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-accent">✓</span>
              <span>Le papier écrit "Play Again" doit être parfaitement lisible, proche de votre visage, sans le cacher.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-accent">✓</span>
              <span>La photo doit être nette et bien éclairée.</span>
            </li>
          </ul>
        </div>

        {/* Selfie Upload box */}
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Votre photo Selfie (Obligatoire)
          </span>

          <div className="relative h-48 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
            {uploadingSelfie ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
              </div>
            ) : selfieUrl ? (
              <div className="relative w-full h-full group">
                <img
                  src={selfiePreview || selfieUrl}
                  alt="Selfie de vérification"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                <Camera className="w-8 h-8 text-zinc-700" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir ou Prendre une photo</p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 disabled:opacity-50 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || uploadingSelfie || !selfieUrl}
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-zinc-900 border border-brand-primary/20 hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] text-[10px] font-black uppercase tracking-widest text-black disabled:text-zinc-650 transition-all duration-500 cursor-pointer font-black"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Soumission...
            </>
          ) : (
            "Envoyer mon dossier"
          )}
        </button>
      </div>
    </div>
  );
}
