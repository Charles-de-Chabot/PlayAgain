"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  id: number | string;
  label: string;
}

interface AutocompleteProps {
  items: Item[];
  placeholder: string;
  label: string;
  onSelect: (id: string) => void;
  className?: string;
  selectedId?: string;
}

export function Autocomplete({ items, placeholder, label, onSelect, className, selectedId }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronisation avec l'ID sélectionné de l'extérieur
  useEffect(() => {
    if (selectedId) {
      const item = items.find(i => i.id.toString() === selectedId);
      if (item) setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [selectedId, items]);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: Item) => {
    setSelectedItem(item);
    setQuery("");
    setIsOpen(false);
    onSelect(item.id.toString());
  };

  return (
    <div className={cn("relative w-full", isOpen && "z-50", className)} ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">
        {label}
      </label>
      
      <div 
        className={cn(
          "relative flex items-center bg-zinc-950/50 border transition-all duration-300 cursor-text",
          isOpen 
            ? "border-brand-primary shadow-[0_0_15px_rgba(125,56,255,0.2)]" 
            : "border-white/10 hover:border-white/20"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className={cn(
          "absolute left-4 transition-colors duration-300",
          isOpen ? "text-brand-primary" : "text-zinc-700"
        )}>
          <Search className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          className={cn(
            "w-full bg-transparent p-4 pl-12 text-sm md:text-base font-bold focus:outline-none placeholder:text-zinc-800 placeholder:italic placeholder:font-normal transition-colors",
            selectedItem && !isOpen ? "text-brand-accent" : "text-white"
          )}
          placeholder={placeholder}
          value={isOpen ? query : (selectedItem ? selectedItem.label : query)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setQuery(""); 
            setIsOpen(true);
          }}
        />

        <div className="absolute right-4 flex items-center gap-2">
          {selectedItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(null);
                setQuery("");
                onSelect("");
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors group/clear cursor-pointer"
              title="Effacer la sélection"
            >
              <X className="w-3.5 h-3.5 text-zinc-500 group-hover/clear:text-red-400" />
            </button>
          )}
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-zinc-700", isOpen && "rotate-180 text-brand-primary")} />
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto rounded-none animate-in fade-in slide-in-from-top-2 duration-300 custom-scrollbar">
          {filteredItems.length > 0 ? (
            <div className="py-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-left transition-all group relative overflow-hidden"
                >
                  {/* Hover Indicator Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                  
                  <span className={cn(
                    "text-xs md:text-sm font-bold tracking-tight transition-colors duration-300",
                    selectedItem?.id === item.id ? "text-brand-accent" : "text-zinc-400 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                  
                  {selectedItem?.id === item.id ? (
                    <div className="bg-brand-accent/10 p-1">
                      <Check className="w-3.5 h-3.5 text-brand-accent" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-zinc-800 mx-auto mb-3 opacity-50" />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">
                Aucun résultat pour "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
