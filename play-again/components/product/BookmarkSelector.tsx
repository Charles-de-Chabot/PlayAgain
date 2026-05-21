"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  getUserBookmarks,
  createBookmarkList,
  toggleProductInList,
  getProductFavoritedStatus,
} from "@/app/actions/bookmark";

interface BookmarkSelectorProps {
  productId: number;
  onClose: () => void;
  onStatusChange?: (isFavorited: boolean) => void;
}

export function BookmarkSelector({
  productId,
  onClose,
  onStatusChange,
}: BookmarkSelectorProps) {
  const { isAuthenticated } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [favoritedListIds, setFavoritedListIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  
  // Création de liste
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fermer tous les autres sélecteurs de favoris ouverts sur la page
    window.dispatchEvent(new CustomEvent("close-other-bookmark-selectors", {
      detail: { productId }
    }));
  }, [productId]);

  // Charger les listes de favoris et le statut du produit
  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [bookmarksRes, statusRes] = await Promise.all([
        getUserBookmarks(),
        getProductFavoritedStatus(productId),
      ]);
      setLists(bookmarksRes);
      setFavoritedListIds(statusRes.listIds);
      if (onStatusChange) {
        onStatusChange(statusRes.isFavorited);
      }
    } catch (err) {
      console.error("Erreur de chargement des listes de favoris:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, productId]);

  // Fermeture du sélecteur avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Ajouter / Retirer de la liste
  const handleToggleList = async (listId: number) => {
    if (togglingId !== null) return;
    setTogglingId(listId);
    setError(null);
    try {
      const res = await toggleProductInList(productId, listId);
      if (res.success && res.listIds) {
        setFavoritedListIds(res.listIds);
        
        // Notification globale pour mettre à jour l'interface instantanément
        window.dispatchEvent(new CustomEvent("bookmark-toggle", {
          detail: { productId, listId, action: res.action }
        }));

        if (onStatusChange) {
          onStatusChange(res.listIds.length > 0);
        }
      } else {
        setError(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Erreur lors de la modification des favoris:", err);
      setError("Impossible de modifier les favoris.");
    } finally {
      setTogglingId(null);
    }
  };

  // Créer une nouvelle liste
  const handleCreateList = async () => {
    const cleanName = newListName.trim();
    if (!cleanName) {
      setError("Le nom de la liste est requis.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await createBookmarkList(cleanName);
      if (res.success && res.list) {
        // Ajouter la nouvelle liste localement
        setLists((prev) => [...prev, { ...res.list, items: [] }].sort((a, b) => a.name.localeCompare(b.name)));
        setNewListName("");
        setShowCreateForm(false);
        // L'ajouter automatiquement au produit
        await handleToggleList(res.list.id);
      } else {
        setError(res.error || "Impossible de créer la liste.");
      }
    } catch (err) {
      console.error("Erreur de création de liste de favoris:", err);
      setError("Une erreur est survenue.");
    } finally {
      setCreating(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Click-outside backdrop overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs cursor-default animate-in fade-in duration-200" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }} 
      />

      {/* Centered Modal Card */}
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-[36px] p-6 w-[340px] text-white flex flex-col gap-4 transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 select-none">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Mes Listes</span>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="text-center py-4 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-zinc-400 leading-normal px-2">
              Connectez-vous pour ajouter ce produit à vos favoris.
            </p>
            <Link
              href="/auth/login"
              className="py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-[10px] font-black uppercase tracking-wider text-white transition-all shadow-[0_0_15px_rgba(125,56,255,0.4)] text-center cursor-pointer"
            >
              Se connecter
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-wider">Chargement...</span>
          </div>
        ) : (
          <>
            {/* List Selection */}
            <div className="max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
              {lists.filter((l) => l.name !== "Favoris").map((list) => {
                const isChecked = favoritedListIds.includes(list.id);
                const isToggling = togglingId === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleList(list.id);
                    }}
                    disabled={isToggling}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 pr-2 truncate">
                      <span className="font-bold truncate text-zinc-300 group-hover:text-white transition-colors">{list.name}</span>
                    </div>
                    
                    <div className={cn(
                      "w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all shrink-0",
                      isChecked 
                        ? "bg-red-500 border-red-500 text-white" 
                         : "border-white/20 text-transparent"
                    )}>
                      {isToggling ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-white" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Create New List */}
            {!showCreateForm ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCreateForm(true);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-brand-primary/50 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer text-center"
              >
                + Nouvelle Liste
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Nom de la liste..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateList();
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary transition-all"
                />
                {error && <span className="text-[9px] text-red-400 font-bold">{error}</span>}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCreateForm(false);
                      setNewListName("");
                      setError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateList();
                    }}
                    disabled={creating}
                    className="px-2.5 py-1 rounded-lg bg-brand-primary text-[9px] font-black uppercase tracking-wider text-white hover:bg-brand-primary/80 transition-all cursor-pointer"
                  >
                    {creating ? "Création..." : "Créer"}
                  </button>
                </div>
              </div>
            )}

            {/* Valider Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-brand-primary to-brand-accent hover:opacity-90 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_20px_rgba(125,56,255,0.3)] cursor-pointer text-center mt-1"
            >
              Valider
            </button>
          </>
        )}
      </div>
    </>,
    document.body
  );
}
