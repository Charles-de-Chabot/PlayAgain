"use client";

import { Heart, Plus, MessageCircle } from "lucide-react";
import Link from "next/link";

export function MobileNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex xl:hidden items-center justify-around bg-black/90 backdrop-blur-lg py-4 text-white border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <Link href="/favorites" className="cursor-pointer">
        <Heart className="h-7 w-7" />
      </Link>
      <Link href="/sell" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black cursor-pointer">
        <Plus className="h-7 w-7" />
      </Link>
      <Link href="/messages" className="cursor-pointer">
        <MessageCircle className="h-7 w-7" />
      </Link>
    </nav>
  );
}
