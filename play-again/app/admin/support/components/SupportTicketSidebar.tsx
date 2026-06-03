"use client";

import React from "react";
import { Loader2, Clock } from "lucide-react";

export interface SupportMessageAdmin {
  id: number;
  ticketId: number;
  senderId: number;
  isAdminReply: boolean;
  content: string;
  createdAt: string;
}

export interface SupportTicketAdmin {
  id: number;
  userId: number;
  subject: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string;
    phone: string | null;
    profile_picture: string | null;
  };
  messages: SupportMessageAdmin[];
}

export interface SupportTicketSidebarProps {
  tickets: SupportTicketAdmin[];
  selectedTicketId?: number;
  loading: boolean;
  onSelectTicket: (ticket: SupportTicketAdmin) => void;
}

export default function SupportTicketSidebar({
  tickets,
  selectedTicketId,
  loading,
  onSelectTicket,
}: SupportTicketSidebarProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 h-full overflow-y-auto text-left">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 font-sans">
        Flux de demandes d'aide
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 flex-1">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-[10px] text-slate-500 font-mono">Scan des tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center p-12 text-slate-500 font-bold text-xs flex-1 flex items-center justify-center">
          Aucun ticket de support dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 relative group text-left ${
                  isSelected ? "bg-white/[0.06] border-white/15" : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                }`}
              >
                {/* User & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white group-hover:text-[#10B981] transition-colors truncate max-w-[70%]">
                    {ticket.user.firstname} {ticket.user.lastname}
                  </span>
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                      ticket.status === "NEW"
                        ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25 animate-pulse"
                        : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                    }`}
                  >
                    {ticket.status === "NEW" ? "Nouveau" : "En cours"}
                  </span>
                </div>

                {/* Subject & snippet */}
                <div className="space-y-1">
                  <p className="text-[11px] font-extrabold text-slate-300 line-clamp-1 leading-snug">
                    Objet : {ticket.subject || "Demande sans objet"}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1 font-medium leading-relaxed">
                    {ticket.content}
                  </p>
                </div>

                {/* Date footer */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-white/[0.03]">
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Créé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
