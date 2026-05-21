"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { BookmarkSelector } from "./BookmarkSelector";
import { getProductFavoritedStatus } from "@/app/actions/bookmark";
import { cn } from "@/lib/utils";

export function BookmarkButtonWrapper({ productId }: { productId: number }) {
  const [showBookmarkSelector, setShowBookmarkSelector] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await getProductFavoritedStatus(productId);
        setIsFavorited(res.isFavorited);
      } catch (err) {
        console.error("Error fetching favorited status:", err);
      }
    }
    checkStatus();
  }, [productId]);

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowBookmarkSelector(!showBookmarkSelector);
        }}
        className={cn(
          "w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all cursor-pointer",
          isFavorited 
            ? "text-red-500 hover:text-red-600 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
            : "text-zinc-400 hover:text-red-500"
        )}
        title="Ajouter aux favoris"
      >
        <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
      </button>

      {showBookmarkSelector && (
        <BookmarkSelector
          productId={productId}
          onClose={() => setShowBookmarkSelector(false)}
          onStatusChange={(fav) => setIsFavorited(fav)}
        />
      )}
    </div>
  );
}
