"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logique de vérification de session à implémenter plus tard
    setLoading(false);
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
