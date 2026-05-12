"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Rechercher un équipement..." }: SearchBarProps) {
  return (
    <div className={cn("relative mx-auto w-[319px] h-[38px] md:w-[453px] md:h-[54px] xl:w-[663px] xl:h-[54px]", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      <input
        type="text"
        placeholder={placeholder}
        className="h-full w-full rounded-none border border-white/20 bg-white/10 pl-12 pr-4 text-white placeholder:text-white/50 backdrop-blur-sm shadow-inner transition-all focus:border-brand-accent focus:bg-white/20 focus:outline-none focus:ring-4 focus:ring-brand-accent/20"
      />
    </div>
  );
}
