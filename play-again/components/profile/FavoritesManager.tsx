"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  Plus, 
  Trash2, 
  Folder, 
  Search, 
  Sparkles, 
  Loader2, 
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";
import { createBookmarkList, deleteBookmarkList } from "@/app/actions/bookmark";

interface FavItem {
  id: number;
  product: any;
}

interface BookmarkList {
  id: number;
  name: string;
  items: FavItem[];
}

interface FavoritesManagerProps {
  initialLists: BookmarkList[];
}

const sortLists = (arr: BookmarkList[]) => {
  return [...arr].sort((a, b) => {
    if (a.name === "Favoris") return -1;
    if (b.name === "Favoris") return 1;
    return a.name.localeCompare(b.name);
  });
};

export function FavoritesManager({ initialLists }: FavoritesManagerProps) {
  const router = useRouter();
  const sortedInitial = sortLists(initialLists);
  const [lists, setLists] = useState<BookmarkList[]>(sortedInitial);
  const [activeListId, setActiveListId] = useState<number>(
    sortedInitial.length > 0 ? sortedInitial[0].id : 0
  );
  
  // Création de liste
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Suppression de liste
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronisation de l'état local avec les props du serveur
  useEffect(() => {
    setLists(sortLists(initialLists));
  }, [initialLists]);

  // Écoute de l'événement global de modification de favori (ajout/suppression)
  useEffect(() => {
    const handleBookmarkToggle = (e: Event) => {
      const { productId, listId, action } = (e as CustomEvent).detail;
      
      setLists((prevLists) => {
        const updated = prevLists.map((list) => {
          if (list.id === listId) {
            if (action === "removed") {
              return {
                ...list,
                items: list.items.filter(item => item.product.id !== productId)
              };
            }
          }
          return list;
        });
        return sortLists(updated);
      });

      // Rafraîchit les données serveur en arrière-plan sans recharger la page
      router.refresh();
    };

    window.addEventListener("bookmark-toggle", handleBookmarkToggle);
    return () => {
      window.removeEventListener("bookmark-toggle", handleBookmarkToggle);
    };
  }, [router]);

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newListName.trim();
    if (!cleanName) {
      setCreateError("Le nom de la liste est requis.");
      return;
    }
    setCreating(true);
    setCreateError(null);

    try {
      const res = await createBookmarkList(cleanName);
      if (res.success && res.list) {
        const newList: BookmarkList = {
          id: res.list.id,
          name: res.list.name,
          items: []
        };
        const updatedLists = sortLists([...lists, newList]);
        setLists(updatedLists);
        setActiveListId(newList.id);
        setNewListName("");
        setShowCreateForm(false);
      } else {
        setCreateError(res.error || "Impossible de créer la liste.");
      }
    } catch (err) {
      console.error(err);
      setCreateError("Une erreur est survenue.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: number) => {
    setIsDeleting(true);
    try {
      const res = await deleteBookmarkList(listId);
      if (res.success) {
        const updatedLists = sortLists(lists.filter(l => l.id !== listId));
        setLists(updatedLists);
        if (activeListId === listId && updatedLists.length > 0) {
          setActiveListId(updatedLists[0].id);
        }
        setDeletingId(null);
      } else {
        alert(res.error || "Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full relative z-10">
      
      {/* 📁 COLONNE GAUCHE : Gestion des Listes */}
      <div className="w-full lg:w-80 shrink-0 bg-zinc-900/60 backdrop-blur-xl rounded-4xl border border-white/10 p-5 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Mes Listes de Favoris
          </h2>
          <span className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
            {lists.length}
          </span>
        </div>

        {/* Liste des onglets */}
        <div className="space-y-1 max-h-[300px] lg:max-h-none overflow-y-auto custom-scrollbar pr-1">
          {lists.map((list) => {
            const isActive = list.id === activeListId;
            const isCustom = list.name !== "Favoris";
            return (
              <div
                key={list.id}
                className={cn(
                  "flex items-center justify-between rounded-3xl p-3.5 transition-all duration-300 group border border-transparent",
                  isActive 
                    ? "bg-linear-to-r from-brand-primary/20 to-brand-accent/5 border-white/10 shadow-inner" 
                    : "hover:bg-white/5 hover:border-white/5"
                )}
              >
                <button
                  onClick={() => {
                    setActiveListId(list.id);
                    setDeletingId(null);
                  }}
                  className="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center transition-colors shadow-inner shrink-0",
                    isActive 
                      ? "bg-brand-primary text-white" 
                      : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                  )}>
                    <Folder className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-bold text-sm truncate",
                      isActive ? "text-white" : "text-zinc-300 group-hover:text-white"
                    )}>
                      {list.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 mt-0.5">
                      {list.items.length} {list.items.length > 1 ? "produits" : "produit"}
                    </p>
                  </div>
                </button>

                {/* Bouton de suppression */}
                {isCustom && (
                  <div className="ml-2 shrink-0">
                    {deletingId === list.id ? (
                      <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-red-500/20 p-1.5 rounded-2xl transition-all">
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          disabled={isDeleting}
                          className="px-2 py-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          {isDeleting ? "..." : "OUI"}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-1 text-[9px] font-black text-zinc-500 hover:text-white rounded-xl cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(list.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer shrink-0"
                        title="Supprimer la liste"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ➕ Créer une nouvelle liste */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full py-4 rounded-3xl border border-dashed border-white/20 hover:border-brand-primary/50 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouvelle Liste
          </button>
        ) : (
          <form onSubmit={handleCreateList} className="space-y-3 pt-3 border-t border-white/5">
            <input
              type="text"
              placeholder="Nom de la liste..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              disabled={creating}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all"
            />
            {createError && (
              <span className="text-[9px] text-red-400 font-bold block pl-1">{createError}</span>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewListName("");
                  setCreateError(null);
                }}
                disabled={creating}
                className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-[10px] font-black uppercase tracking-wider text-white hover:bg-brand-primary/80 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 🛍️ COLONNE DROITE : Liste des produits */}
      <div className="flex-1 w-full space-y-6">
        {activeList && (
          <>
            {/* Header de la liste */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-primary">Liste Active</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-none tracking-tight">
                  {activeList.name}
                </h1>
              </div>
              <p className="text-zinc-400 text-sm font-semibold sm:text-right">
                {activeList.items.length} {activeList.items.length > 1 ? "équipements enregistrés" : "équipement enregistré"}
              </p>
            </div>

            {/* Grille de produits favoris */}
            {activeList.items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 justify-items-center">
                {activeList.items.map((item) => {
                  const product = item.product;
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      condition={product.state}
                      category={product.category?.label || "Sport"}
                      image={product.media?.[0]?.url}
                      fullProduct={product}
                      className="max-w-full"
                    />
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="w-full rounded-4xl bg-zinc-900/40 backdrop-blur-xl border border-dashed border-white/10 p-12 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
                {/* Background lighting */}
                <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all duration-500 shadow-2xl relative z-10">
                  <Heart className="w-7 h-7" />
                </div>
                
                <div className="space-y-2 relative z-10 max-w-sm">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Aucun favori pour l'instant</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ajoutez vos équipements de sport favoris pour les retrouver facilement et comparer leur Deal Score et matching IA.
                  </p>
                </div>
                
                <Link
                  href="/shop"
                  className="relative z-10 py-3.5 px-6 rounded-2xl bg-linear-to-r from-brand-primary to-brand-accent hover:opacity-90 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-[0_0_25px_rgba(125,56,255,0.4)] cursor-pointer flex items-center gap-2 group/btn"
                >
                  <Search className="w-4 h-4" /> Parcourir le Shop <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
