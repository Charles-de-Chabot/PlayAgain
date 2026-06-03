"use client";

import React, { useRef, useEffect } from "react";
import { Terminal as TermIcon, Cpu, Loader2, Trash2 } from "lucide-react";

export interface SystemTerminalConsoleProps {
  logs: string[];
  cleaning: boolean;
  selectedCount: number;
  onLaunchCleanup: () => void;
}

export default function SystemTerminalConsole({
  logs,
  cleaning,
  selectedCount,
  onLaunchCleanup,
}: SystemTerminalConsoleProps) {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 justify-between h-full text-left">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-sans">
            <TermIcon className="w-4 h-4 text-cyan-400" />
            <span>Console de Traitement Système</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-ping" />
            <span className="text-[9px] font-mono text-cyan-400 font-bold">READY</span>
          </div>
        </div>

        {/* Console logs box */}
        <div className="bg-[#05070E] border border-cyan-500/10 text-cyan-400 font-mono text-[10px] p-5 rounded-2xl h-[280px] overflow-y-auto shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">
              [Système en attente] Cochez les fichiers et cliquez sur "Lancer la purge" pour les supprimer du serveur...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap select-text">
                {log}
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Action footer */}
      <div className="border-t border-white/[0.04] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 leading-normal">
          <Cpu className="w-5 h-5 text-slate-500 shrink-0" />
          <span>La purge est irréversible. Les fichiers physiques seront effacés du Cloud CDN.</span>
        </div>

        <button
          onClick={onLaunchCleanup}
          disabled={cleaning || selectedCount === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(244,63,94,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer shrink-0 border-0"
        >
          {cleaning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Purge en cours...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Lancer la Purge ({selectedCount})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
