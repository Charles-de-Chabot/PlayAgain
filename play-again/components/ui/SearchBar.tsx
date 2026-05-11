"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Rechercher un équipement..." }: SearchBarProps) {
  return (
    <div className={cn("relative mx-auto w-[319px] h-[38px] md:w-[453px] md:h-[54px] xl:w-[663px] xl:h-[79px]", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      <input
        type="text"
        placeholder={placeholder}
        className="h-full w-full rounded-xs border-2 border-white/80 bg-transparent pl-12 pr-4 text-white placeholder:text-white/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />
    </div>
  );
}
