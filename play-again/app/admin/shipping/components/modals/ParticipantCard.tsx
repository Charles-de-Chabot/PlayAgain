"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";

export interface ParticipantCardProps {
  label: string;
  username: string | null;
  email: string | undefined;
  phone: string | null | undefined;
}

/**
 * ParticipantCard displays detailed name and contact values for buyer or seller.
 */
export default function ParticipantCard({
  label,
  username,
  email,
  phone,
}: ParticipantCardProps) {
  return (
    <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-2 text-left">
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">
        {label}
      </span>
      <span className="text-xs font-bold text-white block">
        {username || "Utilisateur"}
      </span>
      <div className="space-y-1 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Mail className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="truncate">{email || "Non renseigné"}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-600 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
