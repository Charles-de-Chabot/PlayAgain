"use client";

import React from "react";
import {
  Bell,
  Trash2,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  CreditCard,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import PollInteractive from "./PollInteractive";
import EscrowActions from "./EscrowActions";

export interface NotificationCardProps {
  notif: any;
  isExpanded: boolean;
  onToggleExpand: (id: number, isOpened: boolean) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  votingId: number | null;
  pollResults: Record<
    string,
    { options: string[]; votes: Record<string, number>; totalVotes: number; isClosed: boolean } | null
  >;
  loadingResultsId: string | null;
  onVote: (notifId: number, option: string) => void;
  processingInvoices: Record<number, "releasing" | "disputing" | "done_release" | "done_dispute" | null>;
  onReleaseFunds: (e: React.MouseEvent, notifId: number, invoiceId: number) => void;
  onDispute: (e: React.MouseEvent, notifId: number, invoiceId: number) => void;
}

// Configuration visuelle par type de notification
const getTypeConfig = (type: string) => {
  switch (type) {
    case "MESSAGE":
      return {
        icon: MessageSquare,
        color: "text-brand-primary",
        bg: "bg-brand-primary/10 border-brand-primary/20",
        label: "Message",
        accentColor: "rgba(125, 56, 255, 0.4)",
      };
    case "TRANSACTION":
      return {
        icon: CreditCard,
        color: "text-brand-accent",
        bg: "bg-brand-accent/10 border-brand-accent/20",
        label: "Transaction",
        accentColor: "rgba(198, 255, 52, 0.4)",
      };
    case "AI_MATCH":
      return {
        icon: Sparkles,
        color: "text-[#5ce1e6]",
        bg: "bg-[#5ce1e6]/10 border-[#5ce1e6]/20",
        label: "Match IA",
        accentColor: "rgba(92, 225, 230, 0.4)",
      };
    case "ANNOUNCEMENT":
      return {
        icon: Bell,
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        label: "Annonce",
        accentColor: "rgba(245, 158, 11, 0.4)",
      };
    case "POLL":
      return {
        icon: BarChart2,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        label: "Sondage",
        accentColor: "rgba(16, 185, 129, 0.4)",
      };
    case "SYSTEM":
    default:
      return {
        icon: Settings,
        color: "text-zinc-400",
        bg: "bg-zinc-800/50 border-zinc-700/50",
        label: "Système",
        accentColor: "rgba(255, 255, 255, 0.1)",
      };
  }
};

/**
 * NotificationCard manages card highlights, badge colors,
 * and lazy components loading when expanded.
 */
export default function NotificationCard({
  notif,
  isExpanded,
  onToggleExpand,
  onDelete,
  votingId,
  pollResults,
  loadingResultsId,
  onVote,
  processingInvoices,
  onReleaseFunds,
  onDispute,
}: NotificationCardProps) {
  const config = getTypeConfig(notif.type);
  const TypeIcon = config.icon;

  // Safeguard parsing since metadata could be string or object
  const metadata = typeof notif.metadata === "string" ? JSON.parse(notif.metadata) : notif.metadata || {};

  return (
    <div
      id={`notif-card-${notif.id}`}
      onClick={() => onToggleExpand(notif.id, notif.is_opened)}
      className={cn(
        "relative overflow-hidden rounded-[28px] border bg-zinc-950/80 backdrop-blur-2xl transition-all duration-300 cursor-pointer text-left flex flex-col group",
        notif.is_opened ? "border-white/10" : "border-brand-primary/45 shadow-[0_0_20px_rgba(125,56,255,0.07)]",
        isExpanded
          ? "border-brand-primary shadow-[0_0_30px_rgba(125,56,255,0.15)] scale-[1.01]"
          : "hover:border-white/20 hover:scale-[1.005]"
      )}
      style={{
        boxShadow: isExpanded ? `0 0 30px ${config.accentColor}` : undefined,
      }}
    >
      {/* Background glow on expanded card */}
      {isExpanded && (
        <div
          className="absolute -top-12 -left-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-20 transition-all duration-500"
          style={{
            backgroundColor: config.color.includes("brand-primary")
              ? "#7D38FF"
              : config.color.includes("brand-accent")
              ? "#C6FF34"
              : "#5ce1e6",
          }}
        />
      )}

      {/* Unread badge indicator */}
      {!notif.is_opened && (
        <span className="absolute left-3 top-7 w-2 h-2 bg-brand-accent rounded-full shadow-[0_0_8px_#C6FF34] animate-badge-pulse z-20" />
      )}

      {/* Card Content Row */}
      <div className="flex gap-4 p-5 md:p-6 items-start justify-between relative z-10 w-full">
        <div className="flex gap-4 items-start flex-1 min-w-0">
          {/* Avatar or Icon container */}
          <div className="shrink-0 relative">
            {metadata.productImageUrl ? (
              <img
                src={metadata.productImageUrl}
                alt="Produit lié"
                className={cn(
                  "w-12 h-12 rounded-2xl object-cover border border-white/15 shadow-md transition-all shrink-0 self-center",
                  notif.is_opened ? "opacity-60" : "opacity-100"
                )}
              />
            ) : metadata.senderAvatarUrl ? (
              <img
                src={metadata.senderAvatarUrl}
                alt="Expéditeur"
                className={cn(
                  "w-12 h-12 rounded-full object-cover border border-white/15 shadow-md transition-all shrink-0 self-center",
                  notif.is_opened ? "opacity-60" : "opacity-100"
                )}
              />
            ) : (
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all shadow-inner",
                  config.bg,
                  notif.is_opened ? "opacity-50" : "opacity-100"
                )}
              >
                <TypeIcon className={cn("w-5 h-5", config.color)} />
              </div>
            )}
          </div>

          {/* Text descriptions */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5 self-center">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border", config.bg, config.color)}>
                {config.label}
              </span>

              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider" suppressHydrationWarning>
                {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p
              className={cn(
                "text-xs md:text-sm font-bold leading-relaxed pr-4 select-text transition-all",
                notif.is_opened ? "text-zinc-400" : "text-zinc-100",
                !isExpanded && "line-clamp-2 md:line-clamp-1"
              )}
            >
              {notif.message}
            </p>
          </div>
        </div>

        {/* Right operations */}
        <div className="flex items-center gap-3 shrink-0 self-center">
          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => onDelete(e, notif.id)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300 focus:outline-none cursor-pointer"
            title="Supprimer la notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expanded State Indicator */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-450 group-hover:text-white transition-all duration-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Accordion Expand contents */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-white/2 relative z-10 w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-6 md:p-8 space-y-5">
            {/* Full message panel */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-550">
                Message de la notification
              </h4>
              <p className="text-xs text-zinc-305 font-bold leading-relaxed bg-black/35 p-4 rounded-2xl border border-white/5 select-text whitespace-pre-wrap shadow-inner">
                {notif.message}
              </p>
            </div>

            {/* Poll Interactive Panel */}
            {notif.type === "POLL" && (
              <PollInteractive
                notifId={notif.id}
                metadata={metadata}
                votingId={votingId}
                pollResults={pollResults}
                loadingResultsId={loadingResultsId}
                onVote={onVote}
              />
            )}

            {/* Escrow/Shipping Delivery confirmation */}
            {metadata.isDelivery && metadata.invoiceId && (
              <EscrowActions
                notifId={notif.id}
                invoiceId={metadata.invoiceId}
                processingInvoices={processingInvoices}
                onReleaseFunds={onReleaseFunds}
                onDispute={onDispute}
              />
            )}

            {/* Redirection actions link */}
            {metadata.redirectUrl && (
              <div className="flex flex-wrap gap-4 pt-1 items-center justify-between border-t border-white/5 pt-4">
                {metadata.messageSnippet && (
                  <div className="space-y-1 max-w-md">
                    <h5 className="text-[9px] font-black uppercase tracking-wider text-zinc-550">Aperçu</h5>
                    <p className="text-xs text-zinc-400 font-semibold italic">"{metadata.messageSnippet}"</p>
                  </div>
                )}

                <Link
                  href={metadata.redirectUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_4px_15px_rgba(125,56,255,0.3)] hover:scale-[1.02] cursor-pointer ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Accéder au lien</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
