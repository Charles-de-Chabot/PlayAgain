"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function NotificationTracker() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;

    // Associer les onglets d'administration à leurs cookies de dernière visite respectifs
    const pathToCookieMap: Record<string, string> = {
      "/admin/users": "last_visited_users",
      "/admin/catalog": "last_visited_catalog",
      "/admin/taxonomy": "last_visited_taxonomy",
      "/admin/fraud": "last_visited_fraud",
      "/admin/shipping": "last_visited_shipping",
      "/admin/system": "last_visited_system",
    };

    const cookieName = pathToCookieMap[pathname];
    if (cookieName) {
      // Helper pour lire un cookie côté client
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
      };

      const existingCookieValue = getCookie(cookieName);
      const nowStr = new Date().toISOString();

      // Si le cookie n'existe pas encore ou s'il est plus ancien de quelques secondes, on le met à jour
      if (!existingCookieValue) {
        // Expiration du cookie dans 30 jours
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${cookieName}=${nowStr}; path=/; expires=${expires}; SameSite=Lax`;
        
        // Rafraîchit les composants serveur de la page de manière transparente pour effacer le badge
        router.refresh();
      }
    }
  }, [pathname, router]);

  return null;
}
