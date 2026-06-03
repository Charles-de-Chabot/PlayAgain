"use client";

import React from "react";
import { Loader2, Check, User } from "lucide-react";
import { type SupportTicketAdmin } from "./SupportTicketSidebar";

export interface SupportUserMetaHeaderProps {
  ticket: SupportTicketAdmin;
  resolveLoading: boolean;
  onResolve: (ticketId: number) => void;
}

export default function SupportUserMetaHeader({
  ticket,
  resolveLoading,
  onResolve,
}: SupportUserMetaHeaderProps) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Upper Chat Header */}
      <div className="p-4 bg-white/[0.01] border-b border-white/[0.04] flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {ticket.user.profile_picture ? (
              <img src={ticket.user.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-400 font-mono">
                {(ticket.user.username || ticket.user.email).substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
              {ticket.user.firstname} {ticket.user.lastname}
              <span className="text-[9px] font-mono font-bold text-slate-500">(@{ticket.user.username})</span>
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              Sujet : <span className="text-slate-300 font-bold">{ticket.subject || "Support Général"}</span>
            </span>
          </div>
        </div>

        {/* Resolve action */}
        <button
          onClick={() => onResolve(ticket.id)}
          disabled={resolveLoading}
          className="p-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white border border-white/5 active:scale-95 transition-all rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md border-0"
        >
          {resolveLoading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Clore & Résoudre</span>
            </>
          )}
        </button>
      </div>

      {/* User Metadata / Contact Info Bar */}
      <div className="px-6 py-3 bg-[#0A0D18]/80 border-b border-white/4 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <div className="flex items-center gap-2 text-slate-400 min-w-0">
          <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">E-mail:</span>
          <a
            href={`mailto:${ticket.user.email}`}
            className="text-[#10B981] hover:underline text-[11px] font-bold truncate"
          >
            {ticket.user.email}
          </a>
        </div>
        <div className="flex items-center gap-2 text-slate-400 min-w-0">
          <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">Téléphone:</span>
          <span className="text-slate-200 text-[11px] font-bold truncate">
            {ticket.user.phone || "Non renseigné"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 min-w-0 md:justify-end">
          <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">ID Utilisateur:</span>
          <span className="text-slate-200 text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
            #{ticket.user.id}
          </span>
        </div>
      </div>
    </div>
  );
}
