"use client";

import React from "react";
import { BarChart2, RefreshCw, Loader2, Lock, Sparkles, Bell, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BroadcastSummary } from "@/hooks/useAdminNotifications";

export interface BroadcastHistoryProps {
  history: BroadcastSummary[];
  historyLoading: boolean;
  expandedRowId: string | null;
  setExpandedRowId: (id: string | null) => void;
  onRefresh: () => void;
}

/**
 * BroadcastHistory renders a tabular log of past transmissions and closed polls.
 */
export default function BroadcastHistory({
  history,
  historyLoading,
  expandedRowId,
  setExpandedRowId,
  onRefresh,
}: BroadcastHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span>Tableau historique des sondages clos et annonces émises</span>
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={historyLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-black text-slate-355 hover:text-white uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98]"
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
        <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[36px] bg-zinc-950/40 border border-white/5 text-zinc-505 gap-4 text-center select-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-750">
            <BarChart2 className="w-8 h-8 opacity-20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">
              Aucun historique disponible
            </h3>
            <p className="text-xs text-zinc-550 font-bold max-w-sm">
              Aucune annonce ou sondage clôturé n'a été trouvé.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[32px]">
          <div className="overflow-x-auto font-medium">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[90px]">Image</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary">Titre de la notification</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[140px]">Type</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-brand-primary w-[160px]">Date d'émission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                          "hover:bg-white/3 transition-all cursor-pointer",
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
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg border flex items-center justify-center bg-white/5 border-white/10 text-zinc-400",
                                isPoll && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              )}
                            >
                              {isPoll ? <BarChart2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            </div>
                          )}
                        </td>

                        {/* Colonne 2: Titre / Question */}
                        <td className="px-6 py-4 text-left">
                          <p className="text-xs font-bold text-zinc-150 line-clamp-1">
                            {isPoll ? item.question : item.message}
                          </p>
                        </td>

                        {/* Colonne 3: Type Badge */}
                        <td className="px-6 py-4">
                          {isPoll ? (
                            item.isClosed ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-zinc-805 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md">
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
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr className="bg-zinc-950/90">
                          <td
                            colSpan={4}
                            className="px-6 py-6 border-b border-white/5 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              {/* Partie gauche / Visuels */}
                              <div className="md:col-span-2 space-y-4 text-left">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  Configuration &amp; Métadonnées
                                </div>

                                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                    <span>Type de message :</span>
                                    <span className="text-white font-extrabold uppercase">
                                      {isPoll ? "Sondage" : "Annonce"}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                    <span>Audience ciblée :</span>
                                    <span className="text-emerald-400 font-extrabold">
                                      {item.notifiedCount} membres
                                    </span>
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
                                        <span className="text-cyan-400 font-extrabold">
                                          {item.totalVotes} votes
                                        </span>
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
                                                minute: "2-digit",
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
                                                {votesCount} votes{" "}
                                                <span className="text-emerald-400 font-black">({percent}%)</span>
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
  );
}
