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
    <footer className="bg-zinc-950 border-t border-white/5 pt-12 pb-24 xl:pb-12 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Main Grid: 3 columns for mobile/tablet, 4 columns for XL */}
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 mb-12 items-start">
          
          {/* Section Logo & Description - Shared row on mobile (grid-cols-3) */}
          <div className="col-span-1 xl:col-span-2 flex flex-col items-center sm:items-start justify-center text-center sm:text-left self-center sm:self-start">
            <Link href="/" className="inline-block mb-0 sm:mb-4 transition-transform hover:scale-105">
              <img 
                src="/images/logoPlayAgain.png" 
                alt="PlayAgain Logo" 
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed hidden sm:block max-w-xs">
              La référence pour l'achat et la vente d'équipements sportifs de seconde vie. 
            </p>
          </div>

          {/* Navigation */}
          <div className="col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-6">
            <h4 className="text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">Navigation</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link href="/" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[11px] sm:text-sm font-semibold">Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[11px] sm:text-sm font-semibold">Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-[11px] sm:text-sm font-semibold">Aide</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div className="col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-6">
            <h4 className="text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">Compte</h4>
            <ul className="space-y-3 sm:space-y-4">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[11px] sm:text-sm font-semibold">Profil</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/favorites" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[11px] sm:text-sm font-semibold">Favoris</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500 flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group w-full text-center sm:text-left">
                      <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[11px] sm:text-sm font-semibold">Quitter</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                      <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-sm font-semibold">Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="text-zinc-500 hover:text-brand-accent flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 transition-all group">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[11px] sm:text-sm font-semibold">Inscrit</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* RGPD et Copyright */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} PlayAgain
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">
              <a className="hover:text-brand-accent transition-colors" href="#">Mentions</a>
              <a className="hover:text-brand-accent transition-colors" href="#">CGU</a>
              <a className="hover:text-brand-accent transition-colors" href="#">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
