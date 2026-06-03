"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { uploadVerificationDocument } from "@/app/actions/verification";

export interface StepDocumentsProps {
  idCard1Url: string | null;
  setIdCard1Url: (val: string | null) => void;
  idCard2Url: string | null;
  setIdCard2Url: (val: string | null) => void;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * StepDocuments handles upload for ID Cards or passport images.
 */
export default function StepDocuments({
  idCard1Url,
  setIdCard1Url,
  idCard2Url,
  setIdCard2Url,
  onNext,
  onPrev,
}: StepDocumentsProps) {
  const [uploadingId1, setUploadingId1] = useState(false);
  const [uploadingId2, setUploadingId2] = useState(false);

  // Local object URL states for previewing files
  const [idCard1Preview, setIdCard1Preview] = useState<string | null>(null);
  const [idCard2Preview, setIdCard2Preview] = useState<string | null>(null);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (idCard1Preview) URL.revokeObjectURL(idCard1Preview);
      if (idCard2Preview) URL.revokeObjectURL(idCard2Preview);
    };
  }, [idCard1Preview, idCard2Preview]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id1" | "id2"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "id1") setUploadingId1(true);
    if (type === "id2") setUploadingId2(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadVerificationDocument(formData);
      if (result.success && result.url) {
        const localPreviewUrl = URL.createObjectURL(file);
        if (type === "id1") {
          setIdCard1Url(result.url);
          setIdCard1Preview(localPreviewUrl);
        } else {
          setIdCard2Url(result.url);
          setIdCard2Preview(localPreviewUrl);
        }
      } else {
        alert(result.error || "Échec de l'upload du fichier");
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion lors du téléversement");
    } finally {
      if (type === "id1") setUploadingId1(false);
      if (type === "id2") setUploadingId2(false);
    }
  };

  const clearFile = (type: "id1" | "id2") => {
    if (type === "id1") {
      if (idCard1Preview) {
        URL.revokeObjectURL(idCard1Preview);
        setIdCard1Preview(null);
      }
      setIdCard1Url(null);
    } else {
      if (idCard2Preview) {
        URL.revokeObjectURL(idCard2Preview);
        setIdCard2Preview(null);
      }
      setIdCard2Url(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
          3. Pièce d'identité (Recto / Verso)
        </h3>
        <p className="text-xs text-zinc-400 font-bold">
          Téléchargez une photo lisible de votre pièce d'identité (Passeport, CNI, ou Permis de conduire). Vous pouvez envoyer jusqu'à 2 photos maximum (ex: Recto + Verso).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zone Photo 1 (Obligatoire) */}
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Photo 1 : Recto ou Page principale (Obligatoire)
          </span>

          <div className="relative h-44 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
            {uploadingId1 ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
              </div>
            ) : idCard1Url ? (
              <div className="relative w-full h-full group">
                <img
                  src={idCard1Preview || idCard1Url}
                  alt="Identité Recto"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => clearFile("id1")}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                <UploadCloud className="w-8 h-8 text-zinc-700" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir une image</p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "id1")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Zone Photo 2 (Optionnelle) */}
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block font-black">
            Photo 2 : Verso s'il existe (Optionnel)
          </span>

          <div className="relative h-44 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
            {uploadingId2 ? (
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
              </div>
            ) : idCard2Url ? (
              <div className="relative w-full h-full group">
                <img
                  src={idCard2Preview || idCard2Url}
                  alt="Identité Verso"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => clearFile("id2")}
                  className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                <UploadCloud className="w-8 h-8 text-zinc-700" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir une image (Verso)</p>
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "id2")}
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 text-[9px] font-black uppercase tracking-widest text-brand-accent transition-all duration-300 shadow-[0_0_15px_rgba(198,255,52,0.03)] cursor-pointer"
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
