"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationTab {
  id: string;
  label: string;
  count: number;
}

export interface NotificationFilterBarProps {
  setSearchQuery: (q: string) => void;
  sortBy: "desc" | "asc";
  setSortBy: (s: "desc" | "asc") => void;
  filterType: string;
  setFilterType: (t: string) => void;
  tabs: NotificationTab[];
  setExpandedId: (id: number | null) => void;
}

/**
 * NotificationFilterBar manages the search input, sorting, and tab filters.
 * Incorporates local query debouncing to isolate parent list updates.
 */
export default function NotificationFilterBar({
  setSearchQuery,
  sortBy,
  setSortBy,
  filterType,
  setFilterType,
  tabs,
  setExpandedId,
}: NotificationFilterBarProps) {
  const [localQuery, setLocalQuery] = useState("");

  // Debounce the search input updates to prevent list re-calculation on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  return (
    <div className="space-y-6 mb-8 text-left">
      {/* Search & Sort actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-primary transition-colors">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans les notifications..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-500 font-bold text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          />
        </div>

        <button
          type="button"
          onClick={() => setSortBy(sortBy === "desc" ? "asc" : "desc")}
          className="flex items-center justify-center gap-3 px-5 py-4 w-full sm:w-auto rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          title={sortBy === "desc" ? "Plus récentes d'abord" : "Plus anciennes d'abord"}
        >
          <ArrowUpDown className="w-4 h-4 text-brand-primary" />
          <span>Tri : {sortBy === "desc" ? "Récentes" : "Anciennes"}</span>
        </button>
      </div>

      {/* Tabs navigation list */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setFilterType(tab.id);
              setExpandedId(null); // Close the active notification card on filter switch
            }}
            className={cn(
              "px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer border flex items-center gap-2",
              filterType === tab.id
                ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_20px_rgba(125,56,255,0.45)] hover:brightness-110"
                : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/10 hover:bg-zinc-900/50"
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide",
                  filterType === tab.id
                    ? "bg-white text-brand-primary"
                    : "bg-white/10 text-zinc-300 border border-white/5"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
