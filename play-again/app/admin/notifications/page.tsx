"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  BarChart2, 
  Send, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  Lock,
  ChevronDown,
  Check,
  Users
} from "lucide-react";
import { sendGlobalBroadcast, getAdminBroadcastHistory, closePoll } from "@/app/actions/notification";
import { cn } from "@/lib/utils";

interface BroadcastSummary {
  broadcastId: string;
  type: "POLL" | "ANNOUNCEMENT";
  question?: string;
  message: string;
  options?: string[];
  createdAt: Date | string;
  votes?: Record<string, number>;
  totalVotes?: number;
  notifiedCount: number;
  isClosed?: boolean;
  closedAt?: string;
  redirectUrl?: string;
  coverImageUrl?: string;
  targetType?: "GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED";
}

export default function AdminNotificationsPage() {
  // --- ÉTATS ---
  const [broadcastType, setBroadcastType] = useState<"ANNOUNCEMENT" | "POLL">("ANNOUNCEMENT");
  const [targetType, setTargetType] = useState<"GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED">("GLOBAL");
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  
  // États de Sondage
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["Tennis", "Padel"]);
  
  // États UI / Rendu
  const [activeTab, setActiveTab] = useState<"editor" | "live" | "history">("editor");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<BroadcastSummary[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [closingBroadcastId, setClosingBroadcastId] = useState<string | null>(null);

  // --- CHARGEMENT DE L'HISTORIQUE ---
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getAdminBroadcastHistory();
      setHistory(data as any);
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger l'historique des diffusions.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setTargetDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // --- GESTION DES OPTIONS SONDAGE ---
  const handleAddOption = () => {
    if (pollOptions.length >= 4) {
      showNotification("error", "Un sondage est limité à 4 options maximum.");
      return;
    }
    setPollOptions([...pollOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) {
      showNotification("error", "Un sondage requiert au moins 2 options.");
      return;
    }
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // --- ACTIONS ---
  const handleClosePoll = async (broadcastId: string) => {
    try {
      setClosingBroadcastId(broadcastId);
      const res = await closePoll(broadcastId);
      if (res.success) {
        showNotification("success", res.message || "Sondage clôturé avec succès.");
        fetchHistory();
      } else {
        showNotification("error", res.error || "Impossible de clôturer le sondage.");
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique lors de la clôture.");
    } finally {
      setClosingBroadcastId(null);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (broadcastType === "ANNOUNCEMENT") {
      if (!message.trim()) {
        showNotification("error", "Veuillez saisir un message pour l'annonce globale.");
        return;
      }
    } else {
      if (!pollQuestion.trim()) {
        showNotification("error", "Veuillez saisir la question du sondage.");
        return;
      }
      
      const filledOptions = pollOptions.filter(o => o.trim() !== "");
      if (filledOptions.length < 2) {
        showNotification("error", "Un sondage requiert au moins 2 options valides remplies.");
        return;
      }
    }

    try {
      setLoading(true);
      
      const payloadMessage = broadcastType === "ANNOUNCEMENT" ? message : pollQuestion;
      const metadata: any = {};
      
      if (broadcastType === "ANNOUNCEMENT") {
        if (redirectUrl.trim()) metadata.redirectUrl = redirectUrl.trim();
        if (coverImageUrl.trim()) metadata.productImageUrl = coverImageUrl.trim();
      } else {
        metadata.question = pollQuestion.trim();
        metadata.options = pollOptions.filter(o => o.trim() !== "").map(o => o.trim());
      }

      const res = await sendGlobalBroadcast({
        type: broadcastType,
        message: payloadMessage,
        targetType,
        metadata
      });

      if (!res.success) {
        showNotification("error", res.error || "Une erreur est survenue lors de l'envoi.");
        return;
      }

      showNotification("success", res.message || "Message broadcasté avec succès !");
      
      // Réinitialiser les champs
      setMessage("");
      setRedirectUrl("");
      setCoverImageUrl("");
      setPollQuestion("");
      setPollOptions(["Tennis", "Padel"]);
      
      // Recharger l'historique
      fetchHistory();
      
      // Rediriger vers l'historique si c'est un sondage
      if (broadcastType === "POLL") {
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur réseau ou serveur lors du broadcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative pb-16">
      
      {/* 🔔 Toast notifications */}
      {notification && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-right-5",
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
            SuperAdmin Console
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Notifications & Sondages Globaux
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">
            Diffusez des annonces importantes ou lancez des sondages instantanés auprès de toute la communauté PlayAgain.
          </p>
        </div>

        {/* Toggles de Navigation d'onglet */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
          <button
            onClick={() => setActiveTab("editor")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "editor"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            Créer
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "live"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            Sondages Live
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "history"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            Historique
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        /* ================= ONGLER ÉDITEUR ================= */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* A. Éditeur de messages riches (3/5) */}
          <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
            
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
                    broadcastType === "ANNOUNCEMENT"
                      ? "bg-white/10 text-white font-black"
                      : "text-slate-500 hover:text-slate-350"
                  )}
                >
                  Annonce
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastType("POLL")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer",
                    broadcastType === "POLL"
                      ? "bg-white/10 text-white font-black"
                      : "text-slate-500 hover:text-slate-350"
                  )}
                >
                  Sondage
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* Sélecteur de Destinataires (Cible) personnalisé sans icône */}
              <div className="space-y-1.5 relative select-none" onClick={(e) => e.stopPropagation()}>
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Audience cible (Destinataires)</label>
                
                <button
                  type="button"
                  onClick={() => setTargetDropdownOpen(!targetDropdownOpen)}
                  className={`w-full flex items-center justify-between bg-black/40 border ${
                    targetDropdownOpen ? "border-brand-accent/50 shadow-[0_0_10px_rgba(198,255,52,0.15)] text-white" : "border-white/10 text-slate-350 hover:border-white/20"
                  } rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer transition-all duration-300`}
                >
                  <span>
                    {targetType === "GLOBAL" && "Globale (Tous les utilisateurs actifs)"}
                    {targetType === "SELLERS" && "Vendeurs uniquement (Ayant des fiches de vente)"}
                    {targetType === "BUYERS" && "Acheteurs uniquement (Ayant déjà commandé)"}
                    {targetType === "CERTIFIED" && "Utilisateurs certifiés uniquement"}
                    {targetType === "UNCERTIFIED" && "Utilisateurs non certifiés uniquement"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-550 transition-transform duration-300 ${targetDropdownOpen ? "rotate-180 text-white" : ""}`} />
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
                        { value: "UNCERTIFIED", label: "Utilisateurs non certifiés uniquement" }
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
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium leading-relaxed resize-none"
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                    />
                  </div>

                  {/* Options configurables */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Options du sondage (2 à 4)</label>
                      {pollOptions.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddOption}
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
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            maxLength={35}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(idx)}
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

          {/* B. Live Mobile Preview Container (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
              
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Aperçu Mobile en temps réel</span>
              </h3>

              {/* iPhone Mockup Container */}
              <div className="border-[8px] border-slate-800 rounded-[32px] h-[520px] w-[265px] bg-[#070A13] relative shadow-2xl mx-auto overflow-hidden flex flex-col select-none">
                
                {/* Haut-parleur / Encoche virtuel */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 h-3.5 w-18 bg-slate-850 rounded-full z-20 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                  <div className="w-2 h-2 rounded-full bg-black/60 absolute left-2" />
                  <div className="w-7 h-1 rounded-full bg-black/40 absolute" />
                </div>

                {/* Contenu simulé interne */}
                <div className="flex-1 p-3.5 pt-8 flex flex-col relative bg-[#070A13]">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold px-1.5 mb-5">
                    <span>09:41</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-4 h-2 border border-zinc-400 rounded-sm p-0.5 flex items-center justify-start"><div className="w-full h-full bg-zinc-400 rounded-2xs" /></div>
                    </div>
                  </div>

                  {/* Rendu dynamique du pop-up de notification */}
                  <div className="flex flex-col gap-2 relative z-10 w-full animate-in fade-in duration-300">
                    
                    {/* Header application */}
                    <div className="flex items-center gap-1.5 mb-1 bg-white/5 border border-white/5 p-2 rounded-xl text-left">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-[8px] font-black text-black">
                        PA
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-white leading-none uppercase">PlayAgain</p>
                        <span className="text-[7px] text-slate-500 font-bold uppercase leading-none">A l'instant</span>
                      </div>
                    </div>

                    {/* Pop-up Carte Glassmorphic */}
                    <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-3 text-left shadow-2xl">
                      
                      <div className="flex gap-2.5 items-start">
                        {/* Image ou icône */}
                        {broadcastType === "ANNOUNCEMENT" && coverImageUrl.trim() ? (
                          <img 
                            src={coverImageUrl} 
                            alt="Visual mockup" 
                            className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" 
                          />
                        ) : (
                          <div className={cn(
                            "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-inner bg-white/5 border-white/10 text-zinc-400",
                            broadcastType === "POLL" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {broadcastType === "POLL" ? (
                              <BarChart2 className="w-3.5 h-3.5" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}

                        {/* Texte */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit leading-none",
                            broadcastType === "POLL" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          )}>
                            {broadcastType === "POLL" ? "Sondage" : "Annonce"}
                          </span>
                          
                          <p className="text-[10px] font-bold text-zinc-200 leading-snug break-words mt-1">
                            {broadcastType === "ANNOUNCEMENT" 
                              ? (message.trim() || "Saisissez votre annonce dans le formulaire pour voir le rendu...")
                              : (pollQuestion.trim() || "Saisissez votre question de sondage...")
                            }
                          </p>
                        </div>
                      </div>

                      {/* Options de Sondage simulées */}
                      {broadcastType === "POLL" && (
                        <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-2.5">
                          {pollOptions.map((opt, idx) => (
                            <div 
                              key={idx} 
                              className="w-full p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all text-[9px] font-bold text-zinc-300 text-left flex justify-between"
                            >
                              <span>{opt || `Option ${idx + 1}`}</span>
                              <span className="text-[7px] text-emerald-400 font-extrabold uppercase tracking-wide opacity-40">
                                Voter
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lien de redirection pop-up simulé */}
                      {broadcastType === "ANNOUNCEMENT" && redirectUrl.trim() && (
                        <div className="mt-2.5 border-t border-white/5 pt-2 flex justify-end">
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-brand-primary uppercase tracking-wider">
                            Accéder au lien →
                          </span>
                        </div>
                      )}

                    </div>

                  </div>
                  
                  {/* Home Indicator en bas de l'iPhone */}
                  <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : activeTab === "live" ? (
        /* ================= ONGLER SONDAGES LIVE ================= */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Sondages actifs en cours d'opinion</span>
            </h2>
            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-black text-slate-350 hover:text-white uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98]"
            >
              <RefreshCw className={cn("w-3 h-3 text-emerald-400", historyLoading && "animate-spin")} />
              Rafraîchir
            </button>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-400 font-bold">Extraction des votes actifs...</span>
            </div>
          ) : history.filter(item => item.type === "POLL" && !item.isClosed).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[36px] bg-zinc-950/40 border border-white/5 text-zinc-500 gap-4 text-center select-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-700">
                <Sparkles className="w-8 h-8 opacity-20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">
                  Aucun sondage actif
                </h3>
                <p className="text-xs text-zinc-500 font-bold max-w-sm">
                  Tous les sondages sont clôturés. Utilisez l'onglet "Créer" pour lancer un nouveau sondage d'opinion.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.filter(item => item.type === "POLL" && !item.isClosed).map((item) => (
                <div 
                  key={item.broadcastId}
                  className="relative overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 p-5 md:p-6 backdrop-blur-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5 mb-4">
                      <span className="text-[8px] font-black uppercase tracking-[0.15em] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                        Sondage En Cours
                      </span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {/* Question */}
                    <h3 className="text-sm font-extrabold text-white mb-4 line-clamp-3">
                      {item.question}
                    </h3>

                    {/* Options & Votes stats for POLLS */}
                    {item.options && item.votes && (
                      <div className="space-y-3.5 mb-6">
                        {item.options.map((opt) => {
                          const votesCount = item.votes?.[opt] || 0;
                          const total = item.totalVotes || 0;
                          const percent = total > 0 ? Math.round((votesCount / total) * 100) : 0;
                          
                          return (
                            <div key={opt} className="space-y-1.5">
                              <div className="flex justify-between text-[11px] font-bold text-zinc-350">
                                <span>{opt}</span>
                                <span className="text-zinc-400">
                                  {votesCount} votes <span className="text-emerald-400 font-black">({percent}%)</span>
                                </span>
                              </div>
                              {/* Jauge custom cyber */}
                              <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/5 overflow-hidden relative shadow-inner p-[1px]">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleClosePoll(item.broadcastId)}
                    disabled={closingBroadcastId === item.broadcastId}
                    className="w-full mb-4 py-2.5 px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    {closingBroadcastId === item.broadcastId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    Clôturer le sondage
                  </button>

                  {/* Bottom Stats Badge */}
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-500 border-t border-white/5 pt-4">
                    <span>Total votes : <span className="text-white font-extrabold">{item.totalVotes}</span></span>
                    <span>Audience ciblée : <span className="text-white font-extrabold">{item.notifiedCount} membres</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= ONGLER HISTORIQUE (TABLE DES DIFFUSIONS) ================= */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Tableau historique des sondages clos et annonces émises</span>
            </h2>
            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-black text-slate-350 hover:text-white uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98]"
            >
              <RefreshCw className={cn("w-3 h-3 text-emerald-400", historyLoading && "animate-spin")} />
              Rafraîchir
            </button>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-400 font-bold">Chargement de l'historique...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[36px] bg-zinc-950/40 border border-white/5 text-zinc-500 gap-4 text-center select-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-700">
                <BarChart2 className="w-8 h-8 opacity-20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">
                  Aucun historique disponible
                </h3>
                <p className="text-xs text-zinc-500 font-bold max-w-sm">
                  Aucune annonce ou sondage clôturé n'a été trouvé.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[32px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/2">
                      <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[90px]">Image</th>
                      <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary">Titre de la notification</th>
                      <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[140px]">Type</th>
                      <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[160px]">Date d'émission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => {
                      const isPoll = item.type === "POLL";
                      const isExpanded = expandedRowId === item.broadcastId;
                      const hasImage = !isPoll && !!item.coverImageUrl;

                      return (
                        <React.Fragment key={item.broadcastId}>
                          {/* Row clickable */}
                          <tr 
                            onClick={() => setExpandedRowId(isExpanded ? null : item.broadcastId)}
                            className={cn(
                              "border-b border-white/5 hover:bg-white/3 transition-all cursor-pointer",
                              isExpanded ? "bg-white/4" : "bg-transparent"
                            )}
                          >
                            {/* Colonne 1: Image / Icon */}
                            <td className="px-6 py-4">
                              {hasImage ? (
                                <img 
                                  src={item.coverImageUrl} 
                                  alt="Cover thumbnail" 
                                  className="w-10 h-10 rounded-lg object-cover border border-white/10"
                                />
                              ) : (
                                <div className={cn(
                                  "w-10 h-10 rounded-lg border flex items-center justify-center bg-white/5 border-white/10 text-zinc-400",
                                  isPoll && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                )}>
                                  {isPoll ? (
                                    <BarChart2 className="w-4 h-4" />
                                  ) : (
                                    <Bell className="w-4 h-4" />
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Colonne 2: Titre / Question */}
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-zinc-150 line-clamp-1">
                                {isPoll ? item.question : item.message}
                              </p>
                            </td>

                            {/* Colonne 3: Type Badge */}
                            <td className="px-6 py-4">
                              {isPoll ? (
                                item.isClosed ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md">
                                    <Lock className="w-2.5 h-2.5" />
                                    Sondage Clos
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                                    Sondage Live
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">
                                  <Bell className="w-2.5 h-2.5" />
                                  Annonce
                                </span>
                              )}
                            </td>

                            {/* Colonne 4: Date émission */}
                            <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isExpanded && (
                            <tr className="bg-zinc-950/90">
                              <td colSpan={4} className="px-6 py-6 border-b border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                  
                                  {/* Partie gauche / Visuels */}
                                  <div className="md:col-span-2 space-y-4 text-left">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                      Configuration & Métadonnées
                                    </div>
                                    
                                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3">
                                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                        <span>Type de message :</span>
                                        <span className="text-white font-extrabold uppercase">{isPoll ? "Sondage" : "Annonce"}</span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                        <span>Audience ciblée :</span>
                                        <span className="text-emerald-400 font-extrabold">{item.notifiedCount} membres</span>
                                      </div>

                                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                        <span>Groupe de destinataires :</span>
                                        <span className="text-brand-accent font-extrabold uppercase">
                                          {item.targetType === "GLOBAL" && "🌎 Globale"}
                                          {item.targetType === "SELLERS" && "🏷️ Vendeurs"}
                                          {item.targetType === "BUYERS" && "🛒 Acheteurs"}
                                          {item.targetType === "CERTIFIED" && "🏅 Certifiés"}
                                          {item.targetType === "UNCERTIFIED" && "👤 Non certifiés"}
                                          {!item.targetType && "🌎 Globale"}
                                        </span>
                                      </div>

                                      {isPoll && (
                                        <>
                                          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                            <span>Votes totaux reçus :</span>
                                            <span className="text-cyan-400 font-extrabold">{item.totalVotes} votes</span>
                                          </div>
                                          
                                          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                            <span>Date de clôture :</span>
                                            <span className="text-amber-400 font-extrabold">
                                              {item.isClosed ? (
                                                item.closedAt ? (
                                                  new Date(item.closedAt).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                  })
                                                ) : (
                                                  "Déjà clôturé"
                                                )
                                              ) : (
                                                <span className="text-emerald-400 flex items-center gap-1 uppercase">
                                                  <Sparkles className="w-3 h-3 animate-pulse text-emerald-400" />
                                                  Sondage en cours
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {!isPoll && item.coverImageUrl && (
                                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                                        <img 
                                          src={item.coverImageUrl} 
                                          alt="Visual attachment" 
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Partie droite / Contenu principal et Résultats */}
                                  <div className="md:col-span-3 space-y-4 text-left">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                      {isPoll ? "Statistiques finales du vote" : "Contenu diffusé"}
                                    </div>

                                    <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-4">
                                      <div>
                                        <div className="text-[9px] font-black uppercase text-brand-primary tracking-wider mb-1">
                                          {isPoll ? "Question Posée" : "Message Envoyé"}
                                        </div>
                                        <p className="text-xs font-bold text-zinc-100 leading-relaxed whitespace-pre-wrap">
                                          {isPoll ? item.question : item.message}
                                        </p>
                                      </div>

                                      {/* Rendu des jauges pour les sondages */}
                                      {isPoll && item.options && item.votes && (
                                        <div className="space-y-3.5 pt-3 border-t border-white/5">
                                          {item.options.map((opt) => {
                                            const votesCount = item.votes?.[opt] || 0;
                                            const total = item.totalVotes || 0;
                                            const percent = total > 0 ? Math.round((votesCount / total) * 100) : 0;
                                            
                                            return (
                                              <div key={opt} className="space-y-1.5">
                                                <div className="flex justify-between text-[11px] font-bold text-zinc-350">
                                                  <span>{opt}</span>
                                                  <span className="text-zinc-400">
                                                    {votesCount} votes <span className="text-emerald-400 font-black">({percent}%)</span>
                                                  </span>
                                                </div>
                                                <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/5 overflow-hidden relative shadow-inner p-[1px]">
                                                  <div 
                                                    className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${percent}%` }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Rendu du lien pour les annonces */}
                                      {!isPoll && item.redirectUrl && (
                                        <div className="pt-3 border-t border-white/5">
                                          <a 
                                            href={item.redirectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-accent transition-all"
                                          >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            <span>Lien cible : {item.redirectUrl}</span>
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
