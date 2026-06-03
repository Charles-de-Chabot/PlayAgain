"use client";

import React from "react";
import { Sparkles, RefreshCw, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BroadcastSummary } from "@/hooks/useAdminNotifications";

export interface LivePollsProps {
  history: BroadcastSummary[];
  historyLoading: boolean;
  closingBroadcastId: string | null;
  onClosePoll: (id: string) => void;
  onRefresh: () => void;
}

/**
 * LivePolls displays all active polls and vote metrics.
 */
export default function LivePolls({
  history,
  historyLoading,
  closingBroadcastId,
  onClosePoll,
  onRefresh,
}: LivePollsProps) {
  const activePolls = history.filter((item) => item.type === "POLL" && !item.isClosed);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Sondages actifs en cours d'opinion</span>
        </h2>
        <button
          type="button"
          onClick={onRefresh}
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
      ) : activePolls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[36px] bg-zinc-950/40 border border-white/5 text-zinc-505 gap-4 text-center select-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-750">
            <Sparkles className="w-8 h-8 opacity-20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">Aucun sondage actif</h3>
            <p className="text-xs text-zinc-550 font-bold max-w-sm">
              Tous les sondages sont clôturés. Utilisez l'onglet "Créer" pour lancer un nouveau sondage d'opinion.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePolls.map((item) => (
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
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-sm font-extrabold text-white mb-4 line-clamp-3 text-left">
                  {item.question}
                </h3>

                {/* Options & Votes stats */}
                {item.options && item.votes && (
                  <div className="space-y-3.5 mb-6 text-left">
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
                type="button"
                onClick={() => onClosePoll(item.broadcastId)}
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
                <span>
                  Total votes : <span className="text-white font-extrabold">{item.totalVotes}</span>
                </span>
                <span>
                  Audience ciblée : <span className="text-white font-extrabold">{item.notifiedCount} membres</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
