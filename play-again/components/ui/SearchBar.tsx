"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Rechercher un équipement..." }: SearchBarProps) {
  return (
    <div className={cn("relative mx-auto w-[319px] h-[38px] md:w-[453px] md:h-[54px] xl:w-[663px] xl:h-[54px] group", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors z-20" />
      <input
        type="text"
        placeholder={placeholder}
        className="h-full w-full rounded-none border border-white/10 bg-white/5 pl-12 pr-4 text-white placeholder:text-white/30 backdrop-blur-xl shadow-2xl transition-all duration-300 focus:border-brand-primary/50 focus:bg-white/10 focus:outline-none focus:ring-0 group-hover:border-white/30"
      />
      {/* Glow effect focus */}
      <div className="absolute inset-0 -z-10 bg-brand-primary/0 group-focus-within:bg-brand-primary/10 blur-2xl transition-all duration-500 rounded-full" />
    </div>
  );
}
