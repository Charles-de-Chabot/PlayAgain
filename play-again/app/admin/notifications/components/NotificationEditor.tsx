"use client";

import React from "react";
import { Sparkles, ChevronDown, Check, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationEditorProps {
  broadcastType: "ANNOUNCEMENT" | "POLL";
  setBroadcastType: (t: "ANNOUNCEMENT" | "POLL") => void;
  targetType: "GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED";
  setTargetType: (t: "GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED") => void;
  targetDropdownOpen: boolean;
  setTargetDropdownOpen: (o: boolean) => void;
  message: string;
  setMessage: (m: string) => void;
  redirectUrl: string;
  setRedirectUrl: (u: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (u: string) => void;
  pollQuestion: string;
  setPollQuestion: (q: string) => void;
  pollOptions: string[];
  onAddOption: () => void;
  onRemoveOption: (i: number) => void;
  onOptionChange: (i: number, v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

/**
 * NotificationEditor provides announcement and poll configuration forms.
 */
export default function NotificationEditor({
  broadcastType,
  setBroadcastType,
  targetType,
  setTargetType,
  targetDropdownOpen,
  setTargetDropdownOpen,
  message,
  setMessage,
  redirectUrl,
  setRedirectUrl,
  coverImageUrl,
  setCoverImageUrl,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  onSubmit,
  loading,
}: NotificationEditorProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Paramètres de diffusion</span>
        </h2>

        {/* Sélecteur de type d'envoi */}
        <div className="flex bg-black/40 border border-white/5 rounded-xl p-0.5 select-none text-[10px]">
          <button
            type="button"
            onClick={() => setBroadcastType("ANNOUNCEMENT")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer",
              broadcastType === "ANNOUNCEMENT" ? "bg-white/10 text-white font-black" : "text-slate-500 hover:text-slate-350"
            )}
          >
            Annonce
          </button>
          <button
            type="button"
            onClick={() => setBroadcastType("POLL")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer",
              broadcastType === "POLL" ? "bg-white/10 text-white font-black" : "text-slate-500 hover:text-slate-350"
            )}
          >
            Sondage
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 text-xs">
        {/* Sélecteur de Destinataires (Cible) personnalisé */}
        <div className="space-y-1.5 relative select-none" onClick={(e) => e.stopPropagation()}>
          <label className="text-[10px] text-slate-500 font-bold uppercase block">Audience cible (Destinataires)</label>

          <button
            type="button"
            onClick={() => setTargetDropdownOpen(!targetDropdownOpen)}
            className={`w-full flex items-center justify-between bg-black/40 border ${
              targetDropdownOpen
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-350 hover:border-white/20"
            } rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer transition-all duration-300`}
          >
            <span>
              {targetType === "GLOBAL" && "Globale (Tous les utilisateurs actifs)"}
              {targetType === "SELLERS" && "Vendeurs uniquement (Ayant des fiches de vente)"}
              {targetType === "BUYERS" && "Acheteurs uniquement (Ayant déjà commandé)"}
              {targetType === "CERTIFIED" && "Utilisateurs certifiés uniquement"}
              {targetType === "UNCERTIFIED" && "Utilisateurs non certifiés uniquement"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                targetDropdownOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu Overlay */}
          {targetDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {[
                  { value: "GLOBAL", label: "Globale (Tous les utilisateurs actifs)" },
                  { value: "SELLERS", label: "Vendeurs uniquement (Ayant des fiches de vente)" },
                  { value: "BUYERS", label: "Acheteurs uniquement (Ayant déjà commandé)" },
                  { value: "CERTIFIED", label: "Utilisateurs certifiés uniquement" },
                  { value: "UNCERTIFIED", label: "Utilisateurs non certifiés uniquement" },
                ].map((option) => {
                  const isSelected = targetType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTargetType(option.value as any);
                        setTargetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-white/3"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {broadcastType === "ANNOUNCEMENT" ? (
          <>
            {/* Corps de l'Annonce */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Texte de l'annonce *</label>
              <textarea
                rows={5}
                placeholder="Ex: PlayAgain se refait une beauté ! Découvrez nos nouveautés..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50 transition-all font-medium leading-relaxed resize-none font-medium leading-relaxed"
              />
              <div className="text-right text-[9px] text-slate-600 font-bold">
                {message.length} / 300 char
              </div>
            </div>

            {/* Lien de redirection URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-slate-500" />
                Lien de redirection (Optionnel)
              </label>
              <input
                type="url"
                placeholder="https://playagain.fr/sell..."
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>

            {/* Image d'illustration URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-slate-500" />
                URL Image de Couverture / Miniature (Optionnelle)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
              />
            </div>
          </>
        ) : (
          <>
            {/* Question du Sondage */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Question du sondage *</label>
              <input
                type="text"
                placeholder="Ex: Quel est votre sport de montagne préféré ?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                maxLength={120}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
              />
            </div>

            {/* Options configurables */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Options du sondage (2 à 4)</label>
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={onAddOption}
                    className="flex items-center gap-1 text-[9px] font-black text-emerald-400 hover:text-emerald-350 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    Ajouter option
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => onOptionChange(idx, e.target.value)}
                      maxLength={35}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onRemoveOption(idx)}
                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
                        title="Supprimer cette option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Bouton de confirmation de diffusion */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-4 px-4 rounded-xl transition-all shadow-[0_4px_18px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer mt-6"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Lancer la diffusion globale</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
