"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface HelpItemProps {
  title: string;
  content: string;
}

interface HelpSectionProps {
  title: string;
  icon: React.ReactNode;
  items: HelpItemProps[];
}

export function HelpAccordion({ title, icon, items }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  return (
    <div className="mb-4 overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl transition-all">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-brand-accent shadow-inner">
            {icon}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        </div>
        <ChevronDown 
          className={`h-6 w-6 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-accent" : ""}`} 
        />
      </button>

      {/* Section Content (Items) */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] border-t border-white/5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-2 space-y-1">
          {items.map((item, index) => (
            <div key={index} className="rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenItemIndex(openItemIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-zinc-300">{item.title}</span>
                <div className={`h-1.5 w-1.5 rounded-full transition-all ${openItemIndex === index ? "bg-brand-accent scale-150 shadow-[0_0_8px_#C6FF34]" : "bg-zinc-700"}`} />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openItemIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 text-sm leading-relaxed text-zinc-500">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
