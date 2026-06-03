"use client";

import React from "react";
import { CreditCard, Activity, Phone, CheckCircle2 } from "lucide-react";
import { type SuspectUser } from "../page";

export interface FraudCollisionListProps {
  activeTab: "stripe" | "ip" | "phone";
  setActiveTab: (tab: "stripe" | "ip" | "phone") => void;
  stripeCollisionsCount: number;
  ipCollisionsCount: number;
  phoneCollisionsCount: number;
  activeList: any[];
  selectedUsers: Record<number, boolean>;
  toggleSelectUser: (id: number) => void;
  selectGroup: (users: SuspectUser[]) => void;
}

export default function FraudCollisionList({
  activeTab,
  setActiveTab,
  stripeCollisionsCount,
  ipCollisionsCount,
  phoneCollisionsCount,
  activeList,
  selectedUsers,
  toggleSelectUser,
  selectGroup,
}: FraudCollisionListProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-xl flex flex-col gap-6 text-left">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] p-1 bg-black/40 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("stripe")}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "stripe" ? "bg-[#635BFF] text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Stripe Connected
          {stripeCollisionsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">
              {stripeCollisionsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ip")}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "ip" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Adresse IP
          {ipCollisionsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">{ipCollisionsCount}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("phone")}
          className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "phone" ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          Téléphone
          {phoneCollisionsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">{phoneCollisionsCount}</span>
          )}
        </button>
      </div>

      {/* Collision list */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {activeList.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-white mb-1">Aucune collision détectée</h3>
            <p className="text-slate-500 text-xs">
              Félicitations, aucun réseau frauduleux n'a pu être identifié pour ce critère.
            </p>
          </div>
        ) : (
          activeList.map((group: any, idx: number) => {
            const identifier = group.stripeConnectId || group.ipAddress || group.phone;
            return (
              <div
                key={`${activeTab}-${idx}`}
                className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 hover:border-white/[0.08] transition-all flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.04]">
                      {identifier}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                      {group.users.length} comptes liés
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectGroup(group.users)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white transition-all underline cursor-pointer"
                  >
                    Tout sélectionner
                  </button>
                </div>

                {/* Users list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.users.map((user: SuspectUser) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedUsers[user.id] ? "bg-red-500/5 border-red-500/30" : "bg-black/30 border-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedUsers[user.id]}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-black/60 text-red-500 focus:ring-red-500 cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{user.username || "Sans nom"}</span>
                          <span className="text-[10px] text-slate-500">
                            ID: {user.id} • {user.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                          user.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {user.is_active ? "ACTIF" : "BANNI"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
