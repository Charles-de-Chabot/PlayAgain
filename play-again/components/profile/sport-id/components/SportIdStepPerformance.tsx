"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPORTS_ICONS, LEVEL_DEFINITIONS } from "../sportConstants";
import { type SportSkillData } from "@/components/profile/SportProfileForm";

export interface SportIdStepPerformanceProps {
  skills: SportSkillData[];
  onSetSkillLevel: (sportName: string, level: string) => void;
  activeSport: string;
  setActiveSport: (sportName: string) => void;
  frequency: number;
  setFrequency: (val: number) => void;
  tabsRef: React.RefObject<HTMLDivElement | null>;
  scrollTabs: (direction: "left" | "right") => void;
}

export default function SportIdStepPerformance({
  skills,
  onSetSkillLevel,
  activeSport,
  setActiveSport,
  frequency,
  setFrequency,
  tabsRef,
  scrollTabs,
}: SportIdStepPerformanceProps) {
  const currentActiveSport = activeSport || skills[0]?.sportName || "";
  const activeSkill = skills.find((s) => s.sportName === currentActiveSport) || {
    sportName: currentActiveSport,
    level: "BEGINNER",
  };

  const handleTabClick = (sportName: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveSport(sportName);
    const container = tabsRef.current;
    const button = e.currentTarget;
    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const relativeLeft = buttonRect.left - containerRect.left + container.scrollLeft;
      const targetScrollLeft = relativeLeft - containerRect.width / 2 + buttonRect.width / 2;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
          Performance <span className="text-brand-accent">& Objectifs</span>
        </h2>
        <p className="text-zinc-500 text-sm font-medium">
          Dernière étape pour activer ton intelligence PlayAgain.
        </p>
      </div>

      <div className="space-y-6">
        {/* Header block with label on top and a horizontal sliding carousel underneath */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-4 w-full">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
            Ton Niveau par sport
          </label>

          {/* Sport Tabs Carousel */}
          {skills.length > 0 && (
            <div className="flex items-center gap-2 w-full relative">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-white/5 bg-zinc-950/40 text-zinc-500 hover:text-white hover:border-white/20 transition-all rounded-none cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Scrollable container for tabs */}
              <div
                ref={tabsRef}
                className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none scroll-smooth"
              >
                {skills.map((skill) => {
                  const isSelected = skill.sportName === currentActiveSport;
                  const label = skill.sportName.trim().toUpperCase();
                  const IconComponent = SPORTS_ICONS[label] || Award;

                  return (
                    <button
                      key={skill.sportName}
                      type="button"
                      onClick={(e) => handleTabClick(skill.sportName, e)}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 rounded-none text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-2 shrink-0",
                        isSelected
                          ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                          : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-zinc-200 hover:border-white/10"
                      )}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{skill.sportName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-white/5 bg-zinc-950/40 text-zinc-500 hover:text-white hover:border-white/20 transition-all rounded-none cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Stacked Level Buttons for the active sport */}
        <div className="flex flex-col gap-3 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {LEVEL_DEFINITIONS.map((l) => {
            const isActive = activeSkill.level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onSetSkillLevel(currentActiveSport, l.id)}
                className={cn(
                  "flex flex-col md:flex-row md:items-center justify-between p-5 border-2 transition-all cursor-pointer rounded-none text-left select-none relative overflow-hidden group min-h-[72px]",
                  isActive
                    ? l.activeGlow
                    : "bg-zinc-950/40 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300 " + l.glow
                )}
              >
                {isActive && <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-white to-transparent" />}

                <div className="flex items-center gap-4 relative z-10 shrink-0">
                  <h3
                    className={cn(
                      "text-lg font-black uppercase tracking-tighter italic",
                      isActive ? "text-white" : "text-zinc-300 group-hover:text-white transition-colors"
                    )}
                  >
                    {l.label}
                  </h3>
                </div>

                <p className="text-[10px] leading-relaxed text-zinc-500 mt-2 md:mt-0 md:pl-6 max-w-xl relative z-10 font-medium group-hover:text-zinc-400 transition-colors">
                  {l.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
            Fréquence de pratique
          </label>
          <span className="text-2xl font-black italic text-brand-accent">
            {frequency}x <span className="text-xs uppercase tracking-widest text-zinc-500">/ semaine</span>
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="7"
          value={frequency}
          onChange={(e) => setFrequency(parseInt(e.target.value))}
          className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
        />
        <div className="flex justify-between px-1">
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Occasionnel</span>
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Intensif</span>
        </div>
      </div>
    </div>
  );
}
