"use client";

import React from "react";
import { Smartphone, Bell, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LivePreviewProps {
  broadcastType: "ANNOUNCEMENT" | "POLL";
  message: string;
  coverImageUrl: string;
  pollQuestion: string;
  pollOptions: string[];
  redirectUrl: string;
}

/**
 * LivePreview simulates an iOS device layout rendering notification components dynamically.
 */
export default function LivePreview({
  broadcastType,
  message,
  coverImageUrl,
  pollQuestion,
  pollOptions,
  redirectUrl,
}: LivePreviewProps) {
  return (
    <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-3 flex items-center gap-2 text-left">
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
              <div className="w-4 h-2 border border-zinc-400 rounded-sm p-0.5 flex items-center justify-start">
                <div className="w-full h-full bg-zinc-400 rounded-2xs" />
              </div>
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
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-inner bg-white/5 border-white/10 text-zinc-400",
                      broadcastType === "POLL" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {broadcastType === "POLL" ? (
                      <BarChart2 className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}

                {/* Texte */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span
                    className={cn(
                      "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit leading-none",
                      broadcastType === "POLL"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}
                  >
                    {broadcastType === "POLL" ? "Sondage" : "Annonce"}
                  </span>

                  <p className="text-[10px] font-bold text-zinc-200 leading-snug break-words mt-1">
                    {broadcastType === "ANNOUNCEMENT"
                      ? message.trim() || "Saisissez votre annonce dans le formulaire pour voir le rendu..."
                      : pollQuestion.trim() || "Saisissez votre question de sondage..."}
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
  );
}
