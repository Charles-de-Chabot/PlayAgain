"use client";

import { useEffect, useState } from "react";

export function GlobalScrollbar() {
  const [thumbHeight, setThumbHeight] = useState(40);
  const [thumbTop, setThumbTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Détermination robuste de la position et dimensions de défilement multi-navigateurs
      const scrollTop = window.scrollY !== undefined ? window.scrollY : (document.documentElement.scrollTop || document.body.scrollTop || 0);
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
      
      // Si la page n'est pas assez longue pour défiler, on n'affiche rien
      if (scrollHeight <= clientHeight + 10) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);

      // Calcul dynamique de la taille du curseur (légèrement raccourcie pour l'esthétique)
      const visibleRatio = clientHeight / scrollHeight;
      const height = Math.max(15, visibleRatio * clientHeight * 0.7);
      setThumbHeight(height);

      // Calcul dynamique de la position du curseur
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      const maxThumbTop = clientHeight - height - 8; // Marge de 8px en haut/bas
      const top = 4 + scrollRatio * maxThumbTop;
      setThumbTop(top);

      // Masquage automatique après 800ms d'inactivité
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 800);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    
    // Premier calcul au montage
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed right-1 top-0 bottom-0 w-1.5 z-[9999] pointer-events-none flex flex-col justify-start">
      <div
        className="w-1.5 rounded-full bg-brand-primary shadow-2xl transition-all duration-200 ease-out"
        style={{
          height: `${thumbHeight}px`,
          transform: `translateY(${thumbTop}px)`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
