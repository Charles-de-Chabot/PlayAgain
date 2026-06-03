"use client";

import React, { useState, useEffect } from "react";
import { RotateCw, Sun, Contrast, ZoomIn, ZoomOut } from "lucide-react";
import { type VerificationRequestAdmin } from "../page";

export interface KycDocumentViewerProps {
  selectedReq: VerificationRequestAdmin;
}

export default function KycDocumentViewer({ selectedReq }: KycDocumentViewerProps) {
  const [activeDocUrl, setActiveDocUrl] = useState<string>(selectedReq.idCardPhoto1Url);
  const [rotation, setRotation] = useState(0); // Degrés (0, 90, 180, 270)
  const [zoom, setZoom] = useState(1); // Échelle (1 à 2.5)
  const [brightness, setBrightness] = useState(100); // Pourcentage
  const [contrast, setContrast] = useState(100); // Pourcentage

  // Sync active document when request changes
  useEffect(() => {
    setActiveDocUrl(selectedReq.idCardPhoto1Url);
  }, [selectedReq]);

  // Reset tools when document URL changes
  useEffect(() => {
    resetImageTools();
  }, [activeDocUrl]);

  const resetImageTools = () => {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
  };

  const getDocSource = (url: string) => {
    if (url.startsWith("/")) return url;
    const docType =
      url === selectedReq.idCardPhoto1Url
        ? "id1"
        : url === selectedReq.idCardPhoto2Url
        ? "id2"
        : "selfie";

    return `/api/admin/verifications/${selectedReq.id}/document?type=${docType}`;
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Document Selector Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveDocUrl(selectedReq.idCardPhoto1Url)}
          className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all cursor-pointer ${
            activeDocUrl === selectedReq.idCardPhoto1Url
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          Document Recto / Passeport
        </button>

        {selectedReq.idCardPhoto2Url && (
          <button
            type="button"
            onClick={() => setActiveDocUrl(selectedReq.idCardPhoto2Url!)}
            className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all cursor-pointer ${
              activeDocUrl === selectedReq.idCardPhoto2Url
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            Document Verso (Optionnel)
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveDocUrl(selectedReq.selfieUrl)}
          className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all cursor-pointer ${
            activeDocUrl === selectedReq.selfieUrl
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          }`}
        >
          Selfie de Contrôle "Play Again"
        </button>
      </div>

      {/* Interactive Image Frame */}
      <div className="aspect-[16/9] w-full bg-black/60 border border-white/[0.04] rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-inner">
        {/* Document Image */}
        <div
          className="transition-all duration-300 origin-center ease-out max-h-full max-w-full"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        >
          <img
            src={getDocSource(activeDocUrl)}
            alt="Pièce d'identité"
            className="max-h-[350px] object-contain rounded-lg select-none pointer-events-none"
          />
        </div>

        {/* Floating Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3.5 shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom(Math.max(1, zoom - 0.25))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Rotate CCW */}
          <button
            type="button"
            onClick={() => setRotation((rotation - 90 + 360) % 360)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tourner vers la gauche"
          >
            <RotateCw className="w-4 h-4 scale-x-[-1]" />
          </button>

          {/* Rotate CW */}
          <button
            type="button"
            onClick={() => setRotation((rotation + 90) % 360)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tourner vers la droite"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Brightness */}
          <button
            type="button"
            onClick={() => setBrightness(Math.min(200, brightness + 20))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Augmenter la luminosité"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Contrast */}
          <button
            type="button"
            onClick={() => setContrast(Math.min(200, contrast + 20))}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Renforcer le contraste"
          >
            <Contrast className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10" />

          {/* Reset */}
          <button
            type="button"
            onClick={resetImageTools}
            className="text-[9px] font-black tracking-wider uppercase text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
