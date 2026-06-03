"use client";

import React from "react";
import { Lock, Sparkles, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PollInteractiveProps {
  notifId: number;
  metadata: any;
  votingId: number | null;
  pollResults: Record<
    string,
    { options: string[]; votes: Record<string, number>; totalVotes: number; isClosed: boolean } | null
  >;
  loadingResultsId: string | null;
  onVote: (notifId: number, option: string) => void;
}

/**
 * PollInteractive allows client users to submit poll choice selections
 * and displays percentages dynamically.
 */
export default function PollInteractive({
  notifId,
  metadata,
  votingId,
  pollResults,
  loadingResultsId,
  onVote,
}: PollInteractiveProps) {
  const meta = typeof metadata === "string" ? JSON.parse(metadata) : metadata || {};
  const broadcastId = meta.broadcastId;
  const currentResults = broadcastId ? pollResults[broadcastId] : null;
  const isPollClosed = !!meta.isClosed || !!currentResults?.isClosed;
  const hasVoted = !!meta.userVote;

  return (
    <div className="space-y-4 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
          <span>📊 Sondage : {meta.question || "Votre avis nous intéresse"}</span>
        </h4>
        {isPollClosed ? (
          <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit shadow-inner">
            <Lock className="w-2.5 h-2.5" />
            Clôturé
          </span>
        ) : (
          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit animate-pulse">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            En Cours
          </span>
        )}
      </div>

      {isPollClosed || hasVoted ? (
        <div className="space-y-4">
          <div className="text-xs text-zinc-400 font-bold leading-relaxed mb-2">
            {isPollClosed ? (
              hasVoted ? (
                <p>
                  Ce sondage est clôturé. Merci pour votre vote ! Vous aviez choisi :{" "}
                  <span className="text-emerald-400 font-extrabold uppercase tracking-wider">{meta.userVote}</span>
                </p>
              ) : (
                <p className="text-zinc-550">Ce sondage est désormais clôturé. Les votes ne sont plus acceptés.</p>
              )
            ) : (
              <p>
                Votre vote a bien été pris en compte ! Choix :{" "}
                <span className="text-emerald-400 font-extrabold uppercase tracking-wider">{meta.userVote}</span>
              </p>
            )}
          </div>

          {loadingResultsId === broadcastId ? (
            <div className="flex items-center justify-center py-6 gap-2 bg-white/[0.01] border border-white/5 rounded-xl">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">
                Calcul des résultats en base...
              </span>
            </div>
          ) : currentResults ? (
            <div className="grid grid-cols-1 gap-3">
              {currentResults.options.map((opt: string) => {
                const votesCount = currentResults.votes[opt] || 0;
                const totalVotes = currentResults.totalVotes || 0;
                const percent = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                const isUserChoice = meta.userVote === opt;

                return (
                  <div key={opt} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-350">
                      <span className={cn(isUserChoice && "text-emerald-400 font-extrabold flex items-center gap-1")}>
                        {isUserChoice && <Check className="w-3 h-3 text-emerald-400 stroke-3 shrink-0" />}
                        {opt}
                      </span>
                      <span className="text-zinc-450 font-medium">
                        {votesCount} votes <span className="text-emerald-400 font-bold">({percent}%)</span>
                      </span>
                    </div>
                    {/* Horizontal cyber progress gauge */}
                    <div className="w-full h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden relative shadow-inner p-[1px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                          isUserChoice ? "bg-gradient-to-r from-emerald-600 to-cyan-500" : "bg-zinc-705"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="text-[9px] text-zinc-650 font-bold uppercase text-right tracking-wider pt-1">
                Total participation : {currentResults.totalVotes} réponses
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-zinc-550 italic font-bold">Aucun résultat cumulé disponible.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {votingId === notifId ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="text-xs text-zinc-500 font-bold">Enregistrement de votre vote...</span>
            </div>
          ) : (
            meta.options?.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onVote(notifId, opt);
                }}
                className="p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/5 text-zinc-300 hover:text-white text-xs font-bold transition-all text-left flex items-center justify-between active:scale-[0.99] cursor-pointer group"
              >
                <span>{opt}</span>
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-emerald-400 uppercase tracking-widest transition-all">
                  Voter →
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
