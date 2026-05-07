"use client";

import Link from "next/link";
import { Home, User } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4">
      <Link href="/" className="flex items-center">
        <img 
          src="/images/logoTopPlayAgain.png" 
          alt="PlayAgain Logo" 
          className="h-[49px] w-[87px]"
        />
      </Link>
      
      <div className="flex items-center gap-4">
        <Link href="/" className="text-black">
          <Home className="h-6 w-6" />
        </Link>
        <Link href="/profile" className="text-black">
          <User className="h-6 w-6" />
        </Link>
      </div>
    </header>
  );
}
