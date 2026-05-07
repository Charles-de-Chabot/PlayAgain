"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = "Rechercher un équipement..." }: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
      <input
        type="text"
        placeholder={placeholder}
        className="h-14 w-full rounded-xl border border-white/20 bg-transparent pl-12 pr-4 text-white placeholder:text-white/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />
    </div>
  );
}
