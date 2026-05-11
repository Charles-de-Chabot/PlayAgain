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

  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 md:px-6 md:py-4 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center shrink-0">
        <img 
          src="/images/logoTopPlayAgain.png" 
          alt="PlayAgain Logo" 
          className="h-[40px] w-auto md:h-[49px]"
        />
      </Link>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Message de bienvenue - Toujours visible */}
        {isAuthenticated && (
          <div className="mr-1 flex flex-col items-end shrink-0">
            <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">Bienvenue,</span>
            <span className="text-[11px] md:text-sm font-bold text-brand-primary leading-tight">{user?.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-3">
          {/* Icône Home - Masquée si on est déjà sur l'accueil */}
          {!isHomePage && (
            <Link href="/" className="p-1.5 md:p-2 text-black hover:text-brand-primary transition-colors">
              <Home className="h-5 w-5 md:h-6 md:w-6" />
            </Link>
          )}

          {/* Icône profil */}
          <Link 
            href={isAuthenticated ? "/profile" : "/auth/login"} 
            className="p-1.5 md:p-2 text-black hover:text-brand-primary transition-colors"
          >
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </Link>

          {/* Bouton déconnexion seulement si connecté */}
          {isAuthenticated && (
            <button 
              onClick={() => signOut()}
              className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors"
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
