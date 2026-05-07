"use client";

import { Heart, Plus, MessageCircle } from "lucide-react";
import Link from "next/link";

export function MobileNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-black py-4 text-white">
      <Link href="/favorites">
        <Heart className="h-7 w-7" />
      </Link>
      <Link href="/sell" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
        <Plus className="h-7 w-7" />
      </Link>
      <Link href="/messages">
        <MessageCircle className="h-7 w-7" />
      </Link>
    </nav>
  );
}
