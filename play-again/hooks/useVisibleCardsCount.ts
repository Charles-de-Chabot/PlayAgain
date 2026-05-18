"use client";

import { useEffect, useState } from "react";

/**
 * Hook personnalisé pour calculer dynamiquement le nombre optimal de cartes produit
 * à afficher sur une seule ligne en fonction de la largeur de l'écran (viewport).
 * 
 * @param defaultCount Valeur par défaut pour le Server-Side Rendering (SSR)
 * @returns Le nombre optimal de cartes (visibleCount) à afficher
 */
export function useVisibleCardsCount(defaultCount = 5): number {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Client-side window tracking
    setMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let visibleCount = defaultCount;

  if (mounted && windowWidth > 0) {
    const isDesktop = windowWidth >= 768;
    const padding = 48; // px-6 (24px de chaque côté) pour le conteneur principal
    const availableWidth = windowWidth - padding;

    if (isDesktop) {
      const cardWidth = 240; // max-w-[240px]
      const gap = windowWidth >= 1024 ? 40 : 32; // lg:gap-10 (40px) vs md:gap-8 (32px)

      // Trouve le plus grand N (de 1 à 5) tel que : N * cardWidth + (N - 1) * gap <= availableWidth
      let maxN = 1;
      for (let n = 2; n <= 5; n++) {
        if (n * cardWidth + (n - 1) * gap <= availableWidth) {
          maxN = n;
        }
      }
      visibleCount = maxN;
    } else {
      const cardWidth = 160; // max-w-[160px]
      const gap = 24; // gap-6 (24px)

      // Trouve le plus grand N (de 1 à 5) tel que : N * cardWidth + (N - 1) * gap <= availableWidth
      let maxN = 1;
      for (let n = 2; n <= 5; n++) {
        if (n * cardWidth + (n - 1) * gap <= availableWidth) {
          maxN = n;
        }
      }
      visibleCount = maxN;
    }
  }

  return visibleCount;
}
