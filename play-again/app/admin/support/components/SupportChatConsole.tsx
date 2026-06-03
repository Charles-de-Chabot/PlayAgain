"use client";

import React, { useRef, useEffect } from "react";
import { User, ShieldCheck, Loader2, Send } from "lucide-react";
import { type SupportTicketAdmin } from "./SupportTicketSidebar";

export interface SupportChatConsoleProps {
  ticket: SupportTicketAdmin;
  replyContent: string;
  onChangeReply: (val: string) => void;
  actionLoading: boolean;
  onSendReply: (e: React.FormEvent) => void;
}

export default function SupportChatConsole({
  ticket,
  replyContent,
  onChangeReply,
  actionLoading,
  onSendReply,
}: SupportChatConsoleProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket, ticket.messages]);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden h-full">
      {/* Corps de la conversation historique */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {/* 1. La question initiale de l'utilisateur */}
        <div className="flex gap-3 items-start max-w-[85%] text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-lg text-xs leading-relaxed">
            <div className="text-[9px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
              <span>Message Initial</span>
              <span>•</span>
              <span>
                {new Date(ticket.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-slate-200 font-medium">{ticket.content}</p>
          </div>
        </div>

        {/* 2. Les réponses consécutives (Admin et autres) */}
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 items-start max-w-[85%] text-left ${msg.isAdminReply ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shrink-0 ${
                msg.isAdminReply
                  ? "bg-[#10B981]/15 border-[#10B981]/20 text-[#10B981]"
                  : "bg-slate-800 border-white/10 text-slate-400"
              }`}
            >
              {msg.isAdminReply ? <ShieldCheck className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
            </div>

            <div
              className={`rounded-2xl p-4 shadow-lg text-xs leading-relaxed ${
                msg.isAdminReply
                  ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-[#10B981]/25 rounded-tr-none text-emerald-100"
                  : "bg-white/5 border border-white/10 rounded-tl-none text-slate-200"
              }`}
            >
              <div className="text-[9px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
                <span>{msg.isAdminReply ? "Support PlayAgain" : "Message"}</span>
                <span>•</span>
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {msg.content.startsWith("📷 Image partagée : ") ? (
                <div className="space-y-2 mt-1">
                  <span className="text-[10px] text-slate-400 block font-bold">📷 Image partagée :</span>
                  <a
                    href={msg.content.replace("📷 Image partagée : ", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-white/10 hover:border-[#10B981]/50 transition-all max-w-[240px] bg-zinc-950 shadow-md group"
                  >
                    <img
                      src={msg.content.replace("📷 Image partagée : ", "")}
                      alt="Partagée"
                      className="w-full h-auto object-cover max-h-48 group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </a>
                </div>
              ) : (
                <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pied de saisie administrative */}
      <form onSubmit={onSendReply} className="p-4 bg-[#0A0D18] border-t border-white/[0.04] flex items-center gap-3">
        <input
          type="text"
          placeholder="Tapez votre réponse d'aide..."
          value={replyContent}
          onChange={(e) => onChangeReply(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 focus:border-[#10B981]/50 focus:outline-none rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={actionLoading || !replyContent.trim()}
          className="p-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer shadow-lg border-0"
        >
          {actionLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
