import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface MatchBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function MatchBadge({ score, className, showLabel = true }: MatchBadgeProps) {
  // Détermination de la couleur en fonction du score
  const getScoreStyles = () => {
    if (score >= 90) return "text-rose-500 border-rose-500/30 bg-rose-500/5 shadow-rose-500/20";
    if (score >= 70) return "text-amber-500 border-amber-500/30 bg-amber-500/5 shadow-amber-500/20";
    return "text-zinc-500 border-zinc-500/30 bg-zinc-500/5";
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1.5 border backdrop-blur-md shadow-lg transition-all duration-500",
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
