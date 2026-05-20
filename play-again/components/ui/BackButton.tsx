"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  fallbackHref?: string;
}

export function BackButton({ className, fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group cursor-pointer bg-transparent border-none outline-none p-0",
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-brand-primary/50 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
    </button>
  );
}
