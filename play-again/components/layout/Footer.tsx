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
  HelpCircle,
  Globe,
  Share2,
  MessageCircle
} from "lucide-react";

export function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="hidden xl:block bg-zinc-950 border-t border-white/5 pt-16 pb-8 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo et Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <img 
                src="/images/logoPlayAgain.png" 
                alt="PlayAgain Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md mb-2">
              PlayAgain est la référence pour l'achat et la vente d'équipements sportifs de seconde vie. 
              Donnez une nouvelle vie à votre matériel et équipez-vous au meilleur prix.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                  <Home className="h-4 w-4 group-hover:scale-110" />
                  <span className="text-sm font-semibold">Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                  <ShoppingBag className="h-4 w-4 group-hover:scale-110" />
                  <span className="text-sm font-semibold">Boutique</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                  <HelpCircle className="h-4 w-4 group-hover:scale-110" />
                  <span className="text-sm font-semibold">Aide & Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Votre Compte</h4>
            <ul className="space-y-4">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                      <User className="h-4 w-4 group-hover:scale-110" />
                      <span className="text-sm font-semibold">Mon profil</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/favorites" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                      <Heart className="h-4 w-4 group-hover:scale-110" />
                      <span className="text-sm font-semibold">Mes favoris</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500 flex items-center space-x-3 transition-all group w-full text-left">
                      <LogOut className="h-4 w-4 group-hover:scale-110" />
                      <span className="text-sm font-semibold">Déconnexion</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                      <LogOut className="h-4 w-4 group-hover:scale-110" />
                      <span className="text-sm font-semibold">Connexion</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="text-zinc-500 hover:text-brand-accent flex items-center space-x-3 transition-all group">
                      <Plus className="h-4 w-4 group-hover:scale-110" />
                      <span className="text-sm font-semibold">Créer un compte</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* RGPD et Copyright */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-600 text-xs font-medium">
              &copy; {new Date().getFullYear()} PlayAgain. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-8 text-[11px] font-bold uppercase tracking-widest text-zinc-600">
              <a className="hover:text-brand-accent transition-colors" href="#">Mentions légales</a>
              <a className="hover:text-brand-accent transition-colors" href="#">CGU</a>
              <a className="hover:text-brand-accent transition-colors" href="#">Vie privée</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
