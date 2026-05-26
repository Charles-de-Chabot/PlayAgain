"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, MessageSquare, User, Lock } from "lucide-react";

interface User {
  id: number;
  username: string | null;
  profile_picture: string | null;
  firstname: string | null;
  lastname: string | null;
}

interface Media {
  url: string;
}

interface Product {
  title: string;
  user_id: number;
  price: any;
  media: Media[];
  user: User;
}

interface Message {
  content: string;
  created_at: any;
  is_read: boolean;
  user_id: number;
}

interface Conversation {
  id: number;
  user_id: number; // Acheteur
  product_id: number;
  user: User; // Acheteur
  product: Product;
  messages: Message[];
}

interface ConversationListClientProps {
  initialConversations: any[];
  currentUserId: number;
  children: React.ReactNode;
}

export default function ConversationListClient({
  initialConversations,
  currentUserId,
  children,
}: ConversationListClientProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Est-on sur une page de conversation active ?
  // Le chemin sera /messages/123
  const isChatActive = pathname !== "/messages" && pathname !== "/messages/";

  // Filtrer les conversations
  const filteredConversations = initialConversations.filter((conv) => {
    const isBuyer = conv.user_id === currentUserId;
    const partner = isBuyer ? conv.product.user : conv.user;
    const partnerName = partner?.username || partner?.firstname || "";
    const productName = conv.product.title || "";
    
    const query = search.toLowerCase();
    return (
      partnerName.toLowerCase().includes(query) ||
      productName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden gap-4">
      {/* Colonne Gauche : Liste des conversations */}
      <aside
        className={`w-full md:w-[380px] flex-shrink-0 flex flex-col h-full bg-brand-black/45 border border-white/10 backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300 ${
          isChatActive ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Titre & Barre de recherche */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <h1 className="text-xl font-bold font-sans tracking-wide bg-gradient-to-r from-white via-white to-brand-accent bg-clip-text text-transparent">
            Vos Discussions
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un pseudo ou produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-accent text-white placeholder-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <MessageSquare className="h-10 w-10 text-white/20 mb-2" />
              <p className="text-sm text-white/40">Aucune discussion trouvée.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isBuyer = conv.user_id === currentUserId;
              const partner = isBuyer ? conv.product.user : conv.user;
              const lastMessage = conv.messages[0];
              const productMedia = conv.product.media[0]?.url;
              
              const isUnread =
                lastMessage &&
                !lastMessage.is_read &&
                lastMessage.user_id !== currentUserId;

              const partnerName = partner?.username || partner?.firstname || "Utilisateur";
              
              // Déterminer si cette conversation est sélectionnée dans l'URL
              const isSelected = pathname === `/messages/${conv.id}`;

              // Format date relative simplifiée
              let relativeDate = "";
              if (lastMessage && isMounted) {
                const date = new Date(lastMessage.created_at || conv.created_at);
                relativeDate = date.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }

              // Déterminer si cette conversation est en lecture seule (bloquée)
              const isReadOnly = (() => {
                if (!conv.product.is_active && !conv.product.is_sold) return true;
                if (conv.product.is_sold) {
                  const activeInvoice = conv.product.invoice_items?.[0]?.invoice;
                  if (activeInvoice) {
                    const isShipping = activeInvoice.address_id !== null;
                    if (isShipping) {
                      return ["SHIPPED", "DELIVERED", "COMPLETED"].includes(activeInvoice.status);
                    } else {
                      return activeInvoice.status === "COMPLETED";
                    }
                  }
                }
                return false;
              })();

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative border ${
                    isSelected
                      ? "bg-white/10 border-brand-accent"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                  } ${isReadOnly ? "opacity-55 saturate-[0.6] hover:opacity-85 hover:saturate-100" : ""}`}
                >
                  {/* Avatar de l'interlocuteur */}
                  <div className="relative flex-shrink-0">
                    {partner?.profile_picture ? (
                      <img
                        src={partner.profile_picture}
                        alt={partnerName}
                        className="h-11 w-11 rounded-full object-cover border border-white/10 group-hover:border-white/20"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:bg-brand-primary/20 group-hover:border-brand-primary/30 group-hover:text-white transition-all">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-brand-accent rounded-full border-2 border-brand-black shadow-lg shadow-brand-accent/20" />
                    )}
                  </div>

                  {/* Infos principales */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h2 className="text-sm font-bold text-white truncate group-hover:text-brand-accent transition-colors">
                          {partnerName}
                        </h2>
                        {isReadOnly && (
                          <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-white/40 flex-shrink-0">
                        {relativeDate}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-xs font-semibold text-brand-accent truncate">
                        {conv.product.title}
                      </span>
                    </div>

                    {/* Snippet message */}
                    <p className={`text-xs truncate ${isUnread ? "text-white font-bold" : "text-white/60"}`}>
                      {lastMessage
                        ? lastMessage.user_id === currentUserId
                          ? `Moi : ${lastMessage.content}`
                          : lastMessage.content
                        : "Aucun message"}
                    </p>
                  </div>

                  {/* Miniature produit à droite */}
                  {productMedia && (
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 relative">
                      <img
                        src={productMedia}
                        alt={conv.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* Colonne Droite : Le fil de discussion (children) */}
      <section
        className={`flex-1 h-full bg-brand-black/45 border border-white/10 backdrop-blur-lg rounded-2xl overflow-hidden ${
          isChatActive ? "flex" : "hidden md:flex"
        }`}
      >
        {children}
      </section>
    </div>
  );
}
