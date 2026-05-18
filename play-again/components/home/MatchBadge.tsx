import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface MatchBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function MatchBadge({ score, className, showLabel = true }: MatchBadgeProps) {
  // Détermination de la couleur en fonction du score (Aligné avec le code couleur des ProductCard)
  const getScoreStyles = () => {
    if (score >= 90) return "bg-cyan-400 border-cyan-500/40 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]";
    if (score >= 70) return "bg-brand-accent border-brand-accent/40 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]";
    if (score >= 50) return "bg-amber-400 border-amber-500/40 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]";
    return "bg-white border-white/40 text-zinc-950";
  };

  return (
    <div className={cn(
      "flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-full backdrop-blur-md shadow-lg transition-all duration-500",
      getScoreStyles(),
      className
    )}>
      <Zap className={cn("w-3.5 h-3.5 fill-current", score >= 70 ? "animate-pulse" : "opacity-50")} />
      <span className="text-[11px] font-black uppercase tracking-widest italic leading-none">
        {score}% {showLabel && <span className="opacity-60 ml-0.5">Match</span>}
      </span>
    </div>
  );
}
