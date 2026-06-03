"use client";

import React, { useState, useEffect } from "react";
import { Settings, Globe, ChevronDown, Check, Loader2 } from "lucide-react";

export interface SeoBaliseFormProps {
  selectedPage: string;
  onChangePage: (page: string) => void;
  title: string;
  onChangeTitle: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  keywords: string;
  onChangeKeywords: (val: string) => void;
  actionLoading: boolean;
  onSaveSeo: (e: React.FormEvent) => void;
}

export default function SeoBaliseForm({
  selectedPage,
  onChangePage,
  title,
  onChangeTitle,
  description,
  onChangeDescription,
  keywords,
  onChangeKeywords,
  actionLoading,
  onSaveSeo,
}: SeoBaliseFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const options = [
    { value: "home", label: "Page d'Accueil (Home)" },
    { value: "tennis", label: "Catégorie Tennis" },
    { value: "padel", label: "Catégorie Padel" },
    { value: "golf", label: "Catégorie Golf" },
  ];

  return (
    <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Balises SEO HTML</span>
        </h2>

        {/* Target page picker dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between bg-black/40 border ${
              isDropdownOpen
                ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white"
                : "border-white/10 text-slate-300 hover:border-white/20"
            } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300 min-w-[200px] border-0`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {selectedPage === "home" && "Page d'Accueil (Home)"}
                {selectedPage === "tennis" && "Catégorie Tennis"}
                {selectedPage === "padel" && "Catégorie Padel"}
                {selectedPage === "golf" && "Catégorie Golf"}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : ""}`}
            />
          </button>

          {/* Dropdown Menu options */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-full min-w-[200px] bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
              <div className="p-1 space-y-0.5">
                {options.map((option) => {
                  const isSelected = selectedPage === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChangePage(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30 border-0"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className={`w-3.5 h-3.5 ${isSelected ? "text-brand-primary" : "text-slate-500"}`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSaveSeo} className="space-y-4 text-xs">
        {/* Title Tag */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Balise Title (&lt;title&gt;)</label>
            <span className={`text-[9px] font-mono font-bold ${title.length > 60 ? "text-amber-400" : "text-emerald-400"}`}>
              {title.length} / 60 char (Recommandé)
            </span>
          </div>
          <input
            type="text"
            placeholder="Saisissez le titre SEO de la page..."
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            maxLength={75}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>

        {/* Meta Description snippet */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Meta Description (Snippet)</label>
            <span className={`text-[9px] font-mono font-bold ${description.length > 160 ? "text-amber-400" : "text-emerald-400"}`}>
              {description.length} / 160 char (Recommandé)
            </span>
          </div>
          <textarea
            rows={4}
            placeholder="Saisissez la description du site pour les moteurs..."
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            maxLength={200}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium leading-relaxed resize-none"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Keywords (Séparés par des virgules)</label>
          <input
            type="text"
            placeholder="Ex: sport, tennis, occasion..."
            value={keywords}
            onChange={(e) => onChangeKeywords(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2 border-0"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span>Mettre à jour l'index SEO</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
