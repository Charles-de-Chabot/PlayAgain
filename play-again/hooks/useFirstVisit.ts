"use client";

import { useState, useEffect } from "react";

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("play-again-visited");
    if (!hasVisited) {
      setIsFirstVisit(true);
    } else {
      setIsFirstVisit(false);
    }
  }, []);

  const completeFirstVisit = () => {
    localStorage.setItem("play-again-visited", "true");
    setIsFirstVisit(false);
  };

  return { isFirstVisit, completeFirstVisit };
}
