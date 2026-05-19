"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isProfilePage = pathname === "/profile";

  return (
    <header className="fixed top-0 left-0 w-screen z-50 flex items-center justify-between bg-white/40 backdrop-blur-xl px-4 py-3 md:px-6 md:py-4 border-b border-white/20 shadow-2xl">
      {/* Logo */}
      <Link href="/" className="flex items-center shrink-0 cursor-pointer">
        <img 
          src="/images/logoTopPlayAgain.png" 
          alt="PlayAgain Logo" 
          className="h-[40px] w-auto md:h-[49px] brightness-110"
        />
      </Link>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Message de bienvenue - Toujours visible */}
        {isAuthenticated && (
          <div className="mr-1 flex flex-col items-end shrink-0">
            <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-zinc-800 font-bold leading-none opacity-60">Bienvenue,</span>
            <span className="text-[11px] md:text-sm font-black text-zinc-950 leading-tight">{user?.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-3">
          {/* Icône Home - Masquée si on est déjà sur l'accueil */}
          {!isHomePage && (
            <Link href="/" className="p-1.5 md:p-2 text-white hover:text-brand-accent transition-colors cursor-pointer">
              <Home className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          )}

          {/* Icône profil ou Liens Auth */}
          {!isProfilePage && (
            isAuthenticated ? (
              <Link 
                href="/profile" 
                className="p-1.5 md:p-2 text-black hover:text-brand-primary transition-colors cursor-pointer"
              >
                <User className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
            ) : (
              <div className="flex items-center">
                <Link 
                  href="/auth/login" 
                  className="p-1.5 md:p-2 text-black hover:text-brand-primary transition-colors xl:hidden cursor-pointer"
                >
                  <User className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
                <div className="hidden xl:flex items-center gap-2 text-[11px] font-black uppercase italic text-brand-primary tracking-tighter ml-4">
                  <Link href="/auth/login" className="hover:text-black transition-colors cursor-pointer">Se connecter</Link>
                  <span className="text-gray-300">/</span>
                  <Link href="/auth/register" className="hover:text-black transition-colors cursor-pointer">inscription</Link>
                </div>
              </div>
            )
          )}

          {/* Bouton déconnexion seulement si connecté */}
          {isAuthenticated && (
            <button 
              onClick={() => signOut()}
              className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
