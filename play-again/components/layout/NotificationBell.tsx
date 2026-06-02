"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { 
  getUserNotifications, 
  markAsOpened, 
  markAllAsOpened, 
  deleteNotification 
} from "@/app/actions/notification";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newNotifReceived, setNewNotifReceived] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.is_opened).length;

  // 1. Charger les notifications et s'abonner au flux SSE temps réel
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const data = await getUserNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur de chargement initial des notifications:", err);
      }
    };
    fetchInitial();

    // S'abonner au flux Server-Sent Events (SSE)
    const eventSource = new EventSource("/api/notifications/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        
        // Ajouter la notification en tête de liste et déclencher l'animation
        setNotifications(prev => {
          // Éviter les doublons si l'événement SSE est émis en même temps
          if (prev.some(n => n.id === newNotif.id)) {
            return prev;
          }
          return [newNotif, ...prev];
        });
        
        setNewNotifReceived(true);
        // Arrêter l'animation de vibration après 800ms
        setTimeout(() => setNewNotifReceived(false), 800);
      } catch (err) {
        console.error("Erreur d'analyse du message SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Reconnexion en cours pour le flux SSE des notifications...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // 2. Mettre à jour dynamiquement l'onglet du navigateur s'il y a des non-lus
  useEffect(() => {
    const originalTitle = "PlayAgain";
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);

  // 3. Fermer le dropdown lors d'un clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  // Marquer comme lu
  const handleMarkAsRead = async (id: number, notif: any) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_opened: true } : n)
    );
    await markAsOpened(id);

    // Interception intelligente si on est déjà sur /messages
    if (pathname === "/messages" && notif.metadata?.conversationId) {
      const event = new CustomEvent("change-active-conversation", {
        detail: { conversationId: notif.metadata.conversationId }
      });
      window.dispatchEvent(event);
      setIsOpen(false);
    }
  };

  // Tout marquer comme lu
  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_opened: true })));
    await markAllAsOpened();
  };

  // Supprimer
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de la Cloche */}
      <button
        onClick={handleToggle}
        className={cn(
          "p-1.5 md:p-2 text-zinc-300 hover:text-brand-accent hover:scale-115 transition-all cursor-pointer relative focus:outline-hidden",
          newNotifReceived && "animate-bell-ring text-brand-accent"
        )}
        title="Notifications"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
        
        {/* Badge dynamique Vert Citron */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_8px_#C6FF34] animate-badge-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant Glassmorphic */}
      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-[320px] md:w-[360px] bg-zinc-950/90 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[28px] overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
          
          {/* En-tête du Dropdown */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-brand-accent hover:opacity-85 transition-all cursor-pointer focus:outline-hidden"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            )}
          </div>

          {/* Liste des Notifications */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-2 select-none">
                <Bell className="w-8 h-8 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-wider">Aucune notification</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={
                    notif.type === "POLL" 
                      ? `/profile/notifications?open=${notif.id}` 
                      : (notif.metadata?.redirectUrl || "/profile/notifications")
                  }
                  onClick={() => handleMarkAsRead(notif.id, notif)}
                  className={cn(
                    "flex gap-3 px-5 py-3.5 border-b border-white/5 transition-all relative group cursor-pointer text-left",
                    !notif.is_opened ? "bg-white/5" : "bg-transparent hover:bg-white/2"
                  )}
                >
                  {/* Point indicateur non-lu */}
                  {!notif.is_opened && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-accent rounded-full shadow-[0_0_6px_#C6FF34]" />
                  )}

                  {/* Image miniature (produit) ou Avatar (expéditeur) si disponible */}
                  {notif.metadata?.productImageUrl ? (
                    <img 
                      src={notif.metadata.productImageUrl} 
                      alt="Miniature article" 
                      className={cn(
                        "w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10 self-center transition-all",
                        notif.is_opened ? "opacity-35" : "opacity-100"
                      )}
                    />
                  ) : notif.metadata?.senderAvatarUrl ? (
                    <img 
                      src={notif.metadata.senderAvatarUrl} 
                      alt="Avatar expéditeur" 
                      className={cn(
                        "w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 self-center transition-all",
                        notif.is_opened ? "opacity-35" : "opacity-100"
                      )}
                    />
                  ) : (
                    // Icône cloche par défaut
                    <div className={cn(
                      "w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0 self-center transition-all",
                      notif.is_opened ? "opacity-35" : "opacity-100"
                    )}>
                      <Bell className="w-4 h-4" />
                    </div>
                  )}

                  {/* Corps de la notification (Grisé/Semi-transparent si déjà ouverte) */}
                  <div className={cn(
                    "flex-1 flex flex-col gap-0.5 transition-all",
                    notif.is_opened ? "opacity-45" : "opacity-100"
                  )}>
                    <p className={cn(
                      "text-[11px] font-bold leading-relaxed",
                      notif.is_opened ? "text-zinc-500" : "text-zinc-200"
                    )}>
                      {notif.message}
                    </p>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                      {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Bouton de suppression rapide au survol */}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-500 transition-all self-center focus:outline-hidden"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>
              ))
            )}
          </div>

          {/* Pied du Dropdown */}
          <Link 
            href="/profile" 
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 bg-white/3 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Voir tout sur mon profil
          </Link>
        </div>
      )}
    </div>
  );
}
