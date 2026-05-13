"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import { 
  Home, 
  ShoppingBag, 
  Plus, 
  Heart, 
  User, 
  LogOut, 
  HelpCircle
} from "lucide-react";

export function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="bg-black border-t border-white/5 py-12 mt-auto relative z-10 font-sans">
      <div className="max-w-[1440px] mx-auto px-10">
        
        {/* 5-Column Grid (2 for Brand, 1 each for others) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10 mb-12 items-start text-center md:text-left">
          
          {/* 1. BRAND */}
          <div className="col-span-2 md:col-span-2 space-y-6 flex flex-col items-center md:items-start">
            <Link href="/" className="transition-transform hover:scale-105 cursor-pointer">
              <img 
                src="/images/logoPlayAgain.png" 
                alt="PlayAgain Logo" 
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">
              La seconde vie de votre passion
            </p>
          </div>

          {/* 2. EXPLORER */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Explorer</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Accueil</Link>
              </li>
              <li>
                <Link href="/shop" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Le Shop</Link>
              </li>
            </ul>
          </div>

          {/* 3. COMPTE */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Compte</h4>
            <ul className="space-y-3">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Mon Profil</Link>
                  </li>
                  <li>
                    <Link href="/favorites" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Mes Favoris</Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/auth/login" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Connexion</Link>
                </li>
              )}
            </ul>
          </div>

          {/* 4. SUPPORT */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-zinc-500 hover:text-brand-accent transition-all text-[11px] font-bold uppercase cursor-pointer">Aide & FAQ</Link>
              </li>
              <li>
                <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500 transition-all text-[11px] font-bold uppercase cursor-pointer">Quitter</button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright + Legal Links Centered */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-28">
          <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} PlayAgain &bull; All Rights Reserved
          </p>
          
          <span className="hidden md:block h-3 w-px bg-white/10" />

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
            <a className="hover:text-brand-accent transition-colors cursor-pointer" href="#">Mentions</a>
            <a className="hover:text-brand-accent transition-colors cursor-pointer" href="#">CGU</a>
            <a className="hover:text-brand-accent transition-colors cursor-pointer" href="#">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
