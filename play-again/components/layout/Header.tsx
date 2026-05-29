"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, CircleUserRound, LogOut, ShoppingBag, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  // Nettoyage intelligent des filtres du shop quand on change d'univers (accueil, profil, etc.)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isShop = pathname === "/shop";
      const isProduct = pathname.startsWith("/product/");
      if (!isShop && !isProduct) {
        sessionStorage.removeItem("playagain_shop_filters");
      }
    }
  }, [pathname]);

  const isHomePage = pathname === "/";
  const isProfilePage = pathname === "/profile";

  const navItems = [
    { label: "Shop", href: "/shop" },
    { label: "Vendre", href: "/sell" },
    { label: "Aide", href: "/help" },
  ];

  return (
    <header className="fixed top-0 left-0 w-screen z-50 flex items-center justify-between bg-zinc-950/60 backdrop-blur-xl px-4 py-2.5 md:px-8 md:py-3.5 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Visual Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-accent/30 to-transparent" />
      
      {/* Left side: Logo & Desktop Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 cursor-pointer">
          <img 
            src="/images/logoTopPlayAgain.png" 
            alt="PlayAgain Logo" 
            className="h-[30px] w-auto md:h-[38px] brightness-0 invert"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] italic">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1.5 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  isActive ? "text-brand-accent" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-[-6px] left-0 right-0 h-[2.5px] bg-brand-accent rounded-full shadow-[0_0_8px_#C6FF34]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Right side: Welcome, Icons & Auth */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Message de bienvenue - Toujours visible si connecté */}
        {isAuthenticated && (
          <div className="mr-1 flex flex-col items-end shrink-0 sm:flex">
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-zinc-400 font-bold leading-none opacity-80">Bienvenue,</span>
            <span className="text-[11px] md:text-sm font-black text-white leading-tight hover:text-brand-primary transition-colors cursor-pointer">{user?.name}</span>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-3">
          {/* Icône Home - Masquée si on est déjà sur l'accueil */}
          {!isHomePage && (
            <Link href="/" className="p-1.5 md:p-2 text-zinc-300 hover:text-brand-accent hover:scale-115 transition-all cursor-pointer" title="Accueil">
              <Compass className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </Link>
          )}

          {/* Icône Messagerie - Uniquement si connecté */}
          {isAuthenticated && (
            <Link 
              href="/messages" 
              className={`p-1.5 md:p-2 transition-all hover:scale-115 cursor-pointer ${
                pathname.startsWith("/messages")
                  ? "text-brand-accent" 
                  : "text-zinc-300 hover:text-brand-accent"
              }`}
              title="Messagerie"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
            </Link>
          )}

          {/* Cloche de notifications temps réel - Uniquement si connecté */}
          {isAuthenticated && <NotificationBell />}

          {/* Icône Shop (Mobile uniquement) */}
          <Link 
            href="/shop" 
            className={`p-1.5 md:p-2 transition-all hover:scale-115 cursor-pointer md:hidden ${
              pathname === "/shop" 
                ? "text-brand-accent" 
                : "text-zinc-300 hover:text-brand-accent"
            }`}
            title="Catalogue"
          >
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
          </Link>

          {/* Icône profil ou Liens Auth */}
          {!isProfilePage && (
            isAuthenticated ? (
              <Link 
                href="/profile" 
                className="p-1.5 md:p-2 text-zinc-300 hover:text-brand-primary hover:scale-115 transition-all cursor-pointer"
                title="Mon profil"
              >
                <CircleUserRound className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {/* Mobile User Icon */}
                <Link 
                  href="/auth/login" 
                  className="p-1.5 text-zinc-300 hover:text-brand-primary hover:scale-115 transition-all xl:hidden cursor-pointer"
                  title="Connexion"
                >
                  <CircleUserRound className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
                </Link>
                
                {/* Desktop Auth Buttons */}
                <div className="hidden xl:flex items-center gap-2 text-[11px] font-black uppercase italic tracking-wider ml-2">
                  <Link 
                    href="/auth/login" 
                    className="px-3.5 py-1.5 rounded-full border border-white/10 hover:border-brand-accent text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  >
                    Se connecter
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-3.5 py-1.5 rounded-full bg-brand-primary hover:bg-brand-primary/80 text-white shadow-[0_0_15px_rgba(125,56,255,0.4)] transition-all duration-300 cursor-pointer"
                  >
                    Inscription
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Bouton déconnexion seulement si connecté */}
          {isAuthenticated && (
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 md:p-2 text-zinc-500 hover:text-red-500 hover:scale-115 transition-all cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
