"use client";

import { useState } from "react";

interface PeriodData {
  data: number[];
  labels: string[];
}

interface DashboardChartProps {
  day: PeriodData;
  week: PeriodData;
  month: PeriodData;
  year: PeriodData;
  overall: PeriodData;
}

export default function DashboardChart({ day, week, month, year, overall }: DashboardChartProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year" | "overall">("week");

  // Get active period data
  const activePeriod = 
    period === "day" ? day : 
    period === "week" ? week : 
    period === "month" ? month : 
    period === "year" ? year : 
    overall;

  const chartData = activePeriod.data;
  const chartDays = activePeriod.labels;

  // SVG drawing configuration
  const width = 500;
  const height = 150;
  const paddingTop = 15;
  const paddingBottom = 25;
  const paddingLeft = 55;
  const paddingRight = 15;
  const maxVal = Math.max(...chartData) * 1.1 || 10;

  // Convert points to SVG coordinates
  const points = chartData.map((val, i) => {
    const x = paddingLeft + (i * (width - paddingLeft - paddingRight)) / Math.max(1, chartData.length - 1);
    const y = height - paddingBottom - (val * (height - paddingTop - paddingBottom)) / maxVal;
    return { x, y };
  });

  // SVG cubic Bezier curve path
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  // Area under the curve
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || width} ${height - paddingBottom} L ${points[0]?.x || 0} ${height - paddingBottom} Z`;

  return (
    <div className="bg-white/2 backdrop-blur-xl border border-white/6 rounded-3xl p-6 shadow-2xl lg:col-span-2 flex flex-col relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-extrabold text-white">
            Volume de Transactions
          </h2>
          <p className="text-[10px] text-slate-400">
            {period === "day" && "Flux de ventes heure par heure (dernières 24h)"}
            {period === "week" && "Flux de ventes quotidien (7 derniers jours)"}
            {period === "month" && "Flux de ventes par intervalles de 5 jours (30 derniers jours)"}
            {period === "year" && "Flux de ventes mensuel (12 derniers mois)"}
            {period === "overall" && "Activité globale historique depuis le lancement"}
          </p>
        </div>

        {/* Onglets d'échelle temporelle */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl shrink-0">
          {[
            { key: "day", label: "Jour" },
            { key: "week", label: "Semaine" },
            { key: "month", label: "Mois" },
            { key: "year", label: "Année" },
            { key: "overall", label: "Global" }
          ].map((tab) => {
            const isActive = period === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key as any)}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tracé du Graphique SVG */}
      <div className="flex-1 min-h-[160px] relative w-full flex items-center justify-center bg-black/20 rounded-2xl border border-white/2 p-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Lignes de repère d'arrière-plan et graduation ordonnées (Y) */}
          {[
            { y: paddingTop, value: maxVal },
            { y: paddingTop + (height - paddingTop - paddingBottom) * 0.33, value: maxVal * 0.66 },
            { y: paddingTop + (height - paddingTop - paddingBottom) * 0.66, value: maxVal * 0.33 },
            { y: height - paddingBottom, value: 0 },
          ].map((tick, i) => (
            <g key={i}>
              <line 
                x1={paddingLeft} 
                y1={tick.y} 
                x2={width - paddingRight} 
                y2={tick.y} 
                stroke={i === 3 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)"} 
                strokeWidth="1" 
                strokeDasharray={i === 3 ? "0" : "3"} 
              />
              <text
                x={paddingLeft - 8}
                y={tick.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.4)"
                className="text-[8px] font-mono font-bold"
              >
                {Math.round(tick.value).toLocaleString("fr-FR")} €
              </text>
            </g>
          ))}

          {/* Remplissage de zone */}
          {points.length > 0 && <path d={areaPath} fill="url(#areaGradient)" />}

          {/* Tracé de la courbe néon */}
          {points.length > 0 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#lineGradient)" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              className="drop-shadow-[0_4px_8px_rgba(16,185,129,0.3)]"
            />
          )}

          {/* Points d'ancrage */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="#10B981" 
                stroke="#070A13" 
                strokeWidth="2" 
                className="transition-all duration-300 hover:r-6" 
              />
              <text 
                x={p.x} 
                y={p.y - 10} 
                textAnchor="middle" 
                fill="#ffffff" 
                className="text-[8px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {chartData[i]}€
              </text>
            </g>
          ))}

          {/* Graduation des jours/intervalles (X) */}
          {chartDays.map((day, i) => {
            const x = paddingLeft + (i * (width - paddingLeft - paddingRight)) / Math.max(1, chartDays.length - 1);
            return (
              <text
                key={i}
                x={x}
                y={height - paddingBottom + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                className="text-[8px] font-mono font-bold"
              >
                {day}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
