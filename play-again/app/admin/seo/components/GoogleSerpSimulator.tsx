"use client";

import React from "react";
import { Sparkles, ChevronRight, ExternalLink } from "lucide-react";

export interface GoogleSerpSimulatorProps {
  selectedPage: string;
  title: string;
  description: string;
}

export default function GoogleSerpSimulator({
  selectedPage,
  title,
  description,
}: GoogleSerpSimulatorProps) {
  return (
    <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 text-left">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-3 flex items-center gap-2 font-sans">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <span>Simulateur Google SERP (Desktop)</span>
      </h3>

      {/* Classic dark mode Google search snippet */}
      <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl flex flex-col space-y-3 select-none leading-relaxed text-left">
        {/* Breadcrumb URL */}
        <div className="flex items-center gap-1.5 text-xs text-[#b8b8b8] font-normal truncate">
          <span>https://playagain.fr</span>
          <ChevronRight className="w-3 h-3 text-[#777]" />
          <span className="font-semibold text-slate-400">{selectedPage}</span>
        </div>

        {/* blue hover link */}
        <h4 className="text-lg font-normal text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
          {title || "Saisissez un titre pour visualiser..."}
        </h4>

        {/* grey snippet text */}
        <p className="text-[13px] text-[#bdc1c6] font-normal leading-relaxed line-clamp-2">
          {description ||
            "Saisissez une description attractive pour attirer l'oeil de l'internaute dans les résultats du moteur."}
        </p>
      </div>

      {/* Quick advice */}
      <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl space-y-2.5 text-xs text-slate-400">
        <h4 className="font-extrabold text-white flex items-center gap-1.5">
          <ExternalLink className="w-4 h-4 text-emerald-400" />
          <span>Règles d'indexation optimales</span>
        </h4>
        <ul className="list-disc list-inside space-y-1.5 font-medium leading-relaxed">
          <li>Le titre principal doit contenir les mots-clés stratégiques en début de phrase.</li>
          <li>La description doit inclure un appel à l'action clair (Ex: "Découvrez", "Achetez").</li>
          <li>
            Le taux de clic (CTR) augmente de <span className="text-emerald-400 font-bold">+18%</span> si le prix ou la
            mention "Certifié" apparaît dans le titre.
          </li>
        </ul>
      </div>
    </div>
  );
}
