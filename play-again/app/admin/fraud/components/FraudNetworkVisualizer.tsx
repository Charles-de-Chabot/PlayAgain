"use client";

import React, { useState } from "react";
import { Network, CheckCircle2 } from "lucide-react";
import { type SuspectUser } from "../page";

export interface FraudNetworkVisualizerProps {
  activeList: any[];
}

export default function FraudNetworkVisualizer({ activeList }: FraudNetworkVisualizerProps) {
  const [hoveredUser, setHoveredUser] = useState<{
    user: SuspectUser;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="bg-[#070A13] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-2xl text-left">
      {/* Radar Cyber Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Fraud Network Visualizer
          </span>
        </div>
        <span className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
          Radar Actif
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="h-64 flex items-center justify-center relative z-10 bg-black/40 rounded-2xl border border-white/[0.04]">
        {activeList.length === 0 ? (
          <div className="text-center p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
            <p className="text-slate-400 text-xs font-semibold">
              Aucune liaison suspecte identifiée pour cet onglet.
            </p>
          </div>
        ) : (
          <svg className="w-full h-full" viewBox="0 0 600 300">
            {/* Draw lines first */}
            {activeList.slice(0, 3).map((group, groupIdx) => {
              const centerX = 150 + groupIdx * 150;
              const centerY = 150;
              return group.users.map((_: any, idx: number) => {
                const angle = (idx * 2 * Math.PI) / group.users.length;
                const targetX = centerX + Math.cos(angle) * 60;
                const targetY = centerY + Math.sin(angle) * 60;

                return (
                  <line
                    key={`line-${groupIdx}-${idx}`}
                    x1={centerX}
                    y1={centerY}
                    x2={targetX}
                    y2={targetY}
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-[pulse_2s_infinite]"
                  />
                );
              });
            })}

            {/* Draw nodes */}
            {activeList.slice(0, 3).map((group, groupIdx) => {
              const centerX = 150 + groupIdx * 150;
              const centerY = 150;

              return (
                <g key={`nodes-${groupIdx}`}>
                  {/* Central Node */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="12"
                    fill="#1E293B"
                    stroke="#635BFF"
                    strokeWidth="2"
                    className="shadow-2xl"
                  />
                  <text
                    x={centerX}
                    y={centerY + 4}
                    fill="#fff"
                    fontSize="8"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    C
                  </text>

                  {/* Satellite Nodes */}
                  {group.users.map((user: SuspectUser, idx: number) => {
                    const angle = (idx * 2 * Math.PI) / group.users.length;
                    const targetX = centerX + Math.cos(angle) * 60;
                    const targetY = centerY + Math.sin(angle) * 60;

                    return (
                      <g
                        key={`node-${groupIdx}-${idx}`}
                        className="cursor-pointer font-sans"
                        onMouseEnter={() => setHoveredUser({ user, x: targetX, y: targetY })}
                        onMouseLeave={() => setHoveredUser(null)}
                      >
                        <circle
                          cx={targetX}
                          cy={targetY}
                          r="9"
                          fill={user.is_active ? "#1A0B0E" : "#27272A"}
                          stroke={user.is_active ? "#EF4444" : "#52525B"}
                          strokeWidth="2"
                          style={{
                            filter: user.is_active ? "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.6))" : "none",
                          }}
                        />
                        <text x={targetX} y={targetY + 3} fill="#fff" fontSize="7" textAnchor="middle">
                          U
                        </text>
                        <text
                          x={targetX}
                          y={targetY + 22}
                          fill="#94A3B8"
                          fontSize="7"
                          textAnchor="middle"
                          fontWeight="semibold"
                        >
                          ID: {user.id}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredUser && (
          <div
            className="absolute pointer-events-none z-50 bg-[#0E1322]/95 backdrop-blur-md border border-red-500/30 rounded-xl p-2.5 shadow-[0_0_15px_rgba(239,68,68,0.25)] flex flex-col gap-0.5 text-left select-none transition-all duration-150"
            style={{
              left: `${(hoveredUser.x / 600) * 100}%`,
              top: `${(hoveredUser.y / 300) * 100}%`,
              transform: "translate(-50%, -125%)",
            }}
          >
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-400">
              Signalement Suspect
            </span>
            <span className="text-[10px] font-bold text-white truncate max-w-[150px]">
              {hoveredUser.user.username || "Utilisateur sans nom"}
            </span>
            <span className="text-[8px] text-slate-400 truncate max-w-[150px]">
              Email: {hoveredUser.user.email}
            </span>
            <span className="text-[8px] text-slate-500 font-mono font-bold">ID: {hoveredUser.user.id}</span>
          </div>
        )}
      </div>
    </div>
  );
}
