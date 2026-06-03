"use client";

import React from "react";
import { FileText } from "lucide-react";
import { type VerificationRequestAdmin } from "../page";

export interface VerificationRequestListProps {
  requests: VerificationRequestAdmin[];
  selectedReq: VerificationRequestAdmin | null;
  onSelectReq: (req: VerificationRequestAdmin) => void;
}

export default function VerificationRequestList({
  requests,
  selectedReq,
  onSelectReq,
}: VerificationRequestListProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[75vh] overflow-y-auto text-left">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 font-sans">
        Dossiers en Attente ({requests.length})
      </h2>

      <div className="space-y-3">
        {requests.map((req) => {
          const isSelected = selectedReq?.id === req.id;
          return (
            <div
              key={req.id}
              onClick={() => onSelectReq(req)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.01] border-white/[0.04] text-slate-300 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs font-extrabold text-white truncate group-hover:text-[#10B981] transition-colors">
                  {req.user.firstname} {req.user.lastname}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  @{req.user.username || "sans-pseudo"}
                </span>
                <span className="text-[9px] text-slate-400 mt-2">
                  Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <FileText
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
