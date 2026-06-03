"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SportIdStepMorphologyProps {
  height: number;
  setHeight: (val: number) => void;
  weight: number;
  setWeight: (val: number) => void;
  shoeSize: number | null;
  setShoeSize: (val: number | null) => void;
  needsHandedness: boolean;
  handOrientation: string;
  setHandOrientation: (val: string) => void;
  needsStance: boolean;
  boardStance: string;
  setBoardStance: (val: string) => void;
}

export default function SportIdStepMorphology({
  height,
  setHeight,
  weight,
  setWeight,
  shoeSize,
  setShoeSize,
  needsHandedness,
  handOrientation,
  setHandOrientation,
  needsStance,
  boardStance,
  setBoardStance,
}: SportIdStepMorphologyProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
          Morphologie <span className="text-brand-accent">& Technique</span>
        </h2>
        <p className="text-zinc-500 text-sm font-medium">
          Ces détails nous aident à trouver les articles à ta taille.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Height Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
              Taille (cm)
            </label>
            <span className="text-2xl font-black italic text-brand-accent">{height} cm</span>
          </div>
          <input
            type="range"
            min="100"
            max="220"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
          />
        </div>

        {/* Weight Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
              Poids (kg)
            </label>
            <span className="text-2xl font-black italic text-brand-accent">{weight} kg</span>
          </div>
          <input
            type="range"
            min="30"
            max="150"
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Shoe Size Selection */}
      <div className="space-y-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
          Pointure (EU)
        </label>
        <div className="flex flex-wrap gap-2">
          {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setShoeSize(size)}
              className={cn(
                "w-14 h-14 border-2 rounded-none font-black italic transition-all cursor-pointer",
                shoeSize === size
                  ? "bg-white text-black border-white"
                  : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/20"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Technique selection: Handedness / Stance */}
      {(needsHandedness || needsStance) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {needsHandedness && (
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
                Latéralité
              </label>
              <div className="flex bg-zinc-950/50 p-1 border-2 border-white/5 rounded-none">
                <button
                  type="button"
                  onClick={() => setHandOrientation("RIGHT")}
                  className={cn(
                    "flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none cursor-pointer",
                    handOrientation === "RIGHT" ? "bg-white/10 text-white" : "text-zinc-700"
                  )}
                >
                  Droitier
                </button>
                <button
                  type="button"
                  onClick={() => setHandOrientation("LEFT")}
                  className={cn(
                    "flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none cursor-pointer",
                    handOrientation === "LEFT" ? "bg-white/10 text-white" : "text-zinc-700"
                  )}
                >
                  Gaucher
                </button>
              </div>
            </div>
          )}

          {needsStance && (
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
                Stance (Glisse)
              </label>
              <div className="flex bg-zinc-950/50 p-1 border-2 border-white/5 rounded-none">
                <button
                  type="button"
                  onClick={() => setBoardStance("REGULAR")}
                  className={cn(
                    "flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none cursor-pointer",
                    boardStance === "REGULAR" ? "bg-white/10 text-white" : "text-zinc-700"
                  )}
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => setBoardStance("GOOFY")}
                  className={cn(
                    "flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none cursor-pointer",
                    boardStance === "GOOFY" ? "bg-white/10 text-white" : "text-zinc-700"
                  )}
                >
                  Goofy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
