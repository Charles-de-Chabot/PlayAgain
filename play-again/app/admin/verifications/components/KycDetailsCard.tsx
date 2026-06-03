"use client";

import React from "react";
import { ShieldCheck, FileText, Mail, Phone, MapPin } from "lucide-react";
import { type VerificationRequestAdmin } from "../page";

export interface KycDetailsCardProps {
  selectedReq: VerificationRequestAdmin;
}

export default function KycDetailsCard({ selectedReq }: KycDetailsCardProps) {
  return (
    <div className="p-6 bg-white/[0.01] border-b border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-left">
      {/* Profile declared details */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Identité Déclarée (Profil)</span>
        </h3>
        <div className="space-y-2 text-slate-300">
          <p>
            Nom complet :{" "}
            <span className="text-white font-extrabold">
              {selectedReq.user.firstname} {selectedReq.user.lastname}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />{" "}
            <span className="truncate">{selectedReq.user.email}</span>
          </p>
        </div>
      </div>

      {/* KYC submitted details */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5 font-sans">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Saisie Formulaire KYC</span>
        </h3>
        <div className="space-y-2 text-slate-300">
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {selectedReq.submittedPhone}
          </p>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <span>
              {selectedReq.submittedStreetNumber || ""} {selectedReq.submittedStreetName},
              <br />
              {selectedReq.submittedZip} {selectedReq.submittedCity}, {selectedReq.submittedCountry}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
