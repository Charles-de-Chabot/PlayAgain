"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Inbox,
  Check,
  AlertTriangle,
  Loader2,
  BarChart2,
  Lock
} from "lucide-react";
import { 
  markAsOpened, 
  markAllAsOpened, 
  deleteNotification,
  voteInPoll,
  getPollResultsPublic
} from "@/app/actions/notification";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface NotificationsClientProps {
  initialNotifications: any[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingInvoices, setProcessingInvoices] = useState<Record<number, "releasing" | "disputing" | "done_release" | "done_dispute" | null>>({});
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInvoiceId, setDisputeInvoiceId] = useState<number | null>(null);
  const [disputeNotifId, setDisputeNotifId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [votingId, setVotingId] = useState<number | null>(null);
  const [pollResults, setPollResults] = useState<Record<string, { options: string[], votes: Record<string, number>, totalVotes: number, isClosed: boolean } | null>>({});
  const [loadingResultsId, setLoadingResultsId] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Expansion automatique et défilement fluide depuis le paramètre d'URL 'open'
  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) {
      const idNum = parseInt(openId);
      if (!isNaN(idNum)) {
        setExpandedId(idNum);
        
        // Défilement fluide une fois le DOM prêt
        setTimeout(() => {
          const element = document.getElementById(`notif-card-${idNum}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 350);
      }
    }
  }, [searchParams]);

  const loadPollResults = async (broadcastId: string) => {
    if (pollResults[broadcastId]) return;
    try {
      setLoadingResultsId(broadcastId);
      const res = await getPollResultsPublic(broadcastId);
      if (res && res.success && res.options) {
        setPollResults(prev => {
          const next = { ...prev };
          next[broadcastId] = {
            options: res.options || [],
            votes: (res.votes as Record<string, number>) || {},
            totalVotes: res.totalVotes || 0,
            isClosed: !!res.isClosed
          };
          return next;
        });
      }
    } catch (e) {
      console.error("Erreur chargement résultats:", e);
    } finally {
      setLoadingResultsId(null);
    }
  };

  useEffect(() => {
    if (expandedId !== null) {
      const expandedNotif = notifications.find(n => n.id === expandedId);
      if (expandedNotif && expandedNotif.type === "POLL") {
        const meta = typeof expandedNotif.metadata === "string" ? JSON.parse(expandedNotif.metadata) : expandedNotif.metadata || {};
        if (meta.broadcastId) {
          loadPollResults(meta.broadcastId);
        }
      }
    }
  }, [expandedId, notifications]);

  // 1. S'abonner au flux Server-Sent Events (SSE) pour le temps réel
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");
    
    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        
        // Ajouter la notification en tête de liste s'il n'existe pas déjà
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) {
            return prev;
          }
          return [newNotif, ...prev];
        });
      } catch (err) {
        console.error("Erreur de décodage du flux SSE notifications:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // 2. Actions sur les notifications
  const handleMarkRead = async (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_opened: true } : n)
    );
    try {
      await markAsOpened(id);
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  };

  const handleToggleExpand = async (id: number, isOpened: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isOpened) {
        await handleMarkRead(id);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (expandedId === id) setExpandedId(null);
    
    // Suppression locale instantanée
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Erreur lors de la suppression de la notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_opened: true })));
    try {
      await markAllAsOpened();
    } catch (err) {
      console.error("Erreur lors du marquage de tout comme lu:", err);
    }
  };

  const handleReleaseFunds = async (e: React.MouseEvent, notifId: number, invoiceId: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (processingInvoices[invoiceId]) return;

    setProcessingInvoices(prev => ({ ...prev, [invoiceId]: "releasing" }));

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/release`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la libération des fonds");
      }

      setProcessingInvoices(prev => ({ ...prev, [invoiceId]: "done_release" }));
      
      // Marquer automatiquement la notification comme lue
      await handleMarkRead(notifId);
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
      setProcessingInvoices(prev => ({ ...prev, [invoiceId]: null }));
    }
  };

  const handleDispute = async (e: React.MouseEvent, notifId: number, invoiceId: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (processingInvoices[invoiceId]) return;

    setDisputeInvoiceId(invoiceId);
    setDisputeNotifId(notifId);
    setDisputeReason("");
    setShowDisputeModal(true);
  };

  const submitDispute = async () => {
    if (!disputeInvoiceId || !disputeNotifId) return;
    if (!disputeReason.trim()) {
      alert("Vous devez décrire le problème pour pouvoir déclarer un litige.");
      return;
    }

    const invoiceId = disputeInvoiceId;
    const notifId = disputeNotifId;
    const reason = disputeReason.trim();

    setShowDisputeModal(false);
    setProcessingInvoices(prev => ({ ...prev, [invoiceId]: "disputing" }));

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'ouverture du litige");
      }

      setProcessingInvoices(prev => ({ ...prev, [invoiceId]: "done_dispute" }));
      
      // Marquer automatiquement la notification comme lue
      await handleMarkRead(notifId);

      alert("Votre litige a bien été déclaré. Vous allez être redirigé vers votre fil de discussion avec notre Service Après-Vente.");
      window.location.href = `/messages/${data.conversationId}`;
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
      setProcessingInvoices(prev => ({ ...prev, [invoiceId]: null }));
    }
  };

  const handleVote = async (notifId: number, option: string) => {
    setVotingId(notifId);
    try {
      const res = await voteInPoll(notifId, option);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => {
            if (n.id === notifId) {
              const meta = typeof n.metadata === "string" ? JSON.parse(n.metadata) : n.metadata || {};
              const broadcastId = meta.broadcastId;
              if (broadcastId) {
                setTimeout(() => {
                  setPollResults(prevResults => {
                    const copy = { ...prevResults };
                    delete copy[broadcastId];
                    return copy;
                  });
                  loadPollResults(broadcastId);
                }, 100);
              }
              return {
                ...n,
                metadata: {
                  ...meta,
                  userVote: option
                },
                is_opened: true
              };
            }
            return n;
          })
        );
      } else {
        alert(res.error || "Erreur lors du vote");
      }
    } catch (err) {
      console.error("Erreur de vote:", err);
      alert("Erreur de connexion");
    } finally {
      setVotingId(null);
    }
  };

  // 3. Calculs des compteurs par onglet
  const counts = useMemo(() => {
    return {
      ALL: notifications.length,
      MESSAGE: notifications.filter(n => n.type === "MESSAGE").length,
      TRANSACTION: notifications.filter(n => n.type === "TRANSACTION").length,
      SYSTEM: notifications.filter(n => n.type === "SYSTEM").length,
      AI_MATCH: notifications.filter(n => n.type === "AI_MATCH").length,
      ANNOUNCEMENT: notifications.filter(n => n.type === "ANNOUNCEMENT").length,
      POLL: notifications.filter(n => n.type === "POLL").length,
      UNREAD: notifications.filter(n => !n.is_opened).length,
    };
  }, [notifications]);

  // 4. Filtrage, Recherche et Tri des notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Filtrer par type
    if (filterType !== "ALL") {
      result = result.filter(n => n.type === filterType);
    }

    // Filtrer par recherche textuelle (insensible à la casse)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.message.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
      );
    }

    // Trier par date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notifications, filterType, searchQuery, sortBy]);

  // Configuration visuelle par type de notification
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return {
          icon: MessageSquare,
          color: "text-brand-primary",
          bg: "bg-brand-primary/10 border-brand-primary/20",
          label: "Message",
          accentColor: "rgba(125, 56, 255, 0.4)"
        };
      case "TRANSACTION":
        return {
          icon: CreditCard,
          color: "text-brand-accent",
          bg: "bg-brand-accent/10 border-brand-accent/20",
          label: "Transaction",
          accentColor: "rgba(198, 255, 52, 0.4)"
        };
      case "AI_MATCH":
        return {
          icon: Sparkles,
          color: "text-[#5ce1e6]",
          bg: "bg-[#5ce1e6]/10 border-[#5ce1e6]/20",
          label: "Match IA",
          accentColor: "rgba(92, 225, 230, 0.4)"
        };
      case "ANNOUNCEMENT":
        return {
          icon: Bell,
          color: "text-amber-400",
          bg: "bg-amber-500/10 border-amber-500/20",
          label: "Annonce",
          accentColor: "rgba(245, 158, 11, 0.4)"
        };
      case "POLL":
        return {
          icon: BarChart2,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          label: "Sondage",
          accentColor: "rgba(16, 185, 129, 0.4)"
        };
      case "SYSTEM":
      default:
        return {
          icon: Settings,
          color: "text-zinc-400",
          bg: "bg-zinc-800/50 border-zinc-700/50",
          label: "Système",
          accentColor: "rgba(255, 255, 255, 0.1)"
        };
    }
  };

  const tabs = [
    { id: "ALL", label: "Toutes", count: counts.ALL },
    { id: "MESSAGE", label: "Messages", count: counts.MESSAGE },
    { id: "TRANSACTION", label: "Transactions", count: counts.TRANSACTION },
    { id: "AI_MATCH", label: "Matchs IA", count: counts.AI_MATCH },
    { id: "ANNOUNCEMENT", label: "Annonces", count: counts.ANNOUNCEMENT },
    { id: "POLL", label: "Sondages", count: counts.POLL },
    { id: "SYSTEM", label: "Système", count: counts.SYSTEM },
  ];

  return (
    <div className="w-full pb-12">
      
      {/* En-tête principal premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/15">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/5 select-none w-fit shadow-[0_0_15px_rgba(125,56,255,0.08)]">
            <span className="text-[10px] animate-pulse">⚡</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-primary">
              Historique des notifications
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic leading-none">
            Centre de notifications
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-bold">
            Gérez vos alertes, transactions, messages et recommandations personnalisées.
          </p>
        </div>

        {counts.UNREAD > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-950/80 border border-brand-accent/30 text-brand-accent text-[11px] font-black uppercase tracking-widest hover:bg-brand-accent/5 hover:border-brand-accent/60 transition-all duration-300 shadow-[0_0_15px_rgba(198,255,52,0.05)] cursor-pointer shrink-0 self-start md:self-end"
          >
            <CheckCheck className="w-4 h-4 stroke-[2]" />
            Tout marquer comme lu ({counts.UNREAD})
          </button>
        )}
      </div>

      {/* Barre de Recherche, Tris et Filtres */}
      <div className="space-y-6 mb-8">
        
        {/* Recherche et Tri */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="relative flex-1 w-full group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-primary transition-colors">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-3xl bg-zinc-950/80 border border-white/10 text-white placeholder-zinc-500 font-bold text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            />
          </div>

          <button
            onClick={() => setSortBy(prev => prev === "desc" ? "asc" : "desc")}
            className="flex items-center justify-center gap-3 px-5 py-4 w-full sm:w-auto rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            title={sortBy === "desc" ? "Plus récentes d'abord" : "Plus anciennes d'abord"}
          >
            <ArrowUpDown className="w-4 h-4 text-brand-primary" />
            Tri : {sortBy === "desc" ? "Récentes" : "Anciennes"}
          </button>
        </div>

        {/* Navigation / Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setExpandedId(null); // fermer la notification active lors du changement de filtre
              }}
              className={cn(
                "px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer border flex items-center gap-2",
                filterType === tab.id
                  ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_20px_rgba(125,56,255,0.45)] hover:brightness-110"
                  : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/10 hover:bg-zinc-900/50"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide",
                  filterType === tab.id 
                    ? "bg-white text-brand-primary" 
                    : "bg-white/10 text-zinc-300 border border-white/5"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Liste des Notifications */}
      <div className="flex flex-col gap-4">
        {filteredNotifications.length === 0 ? (
          
          /* État Vide Premium */
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[36px] bg-zinc-950/40 border border-white/5 backdrop-blur-md text-zinc-500 gap-4 text-center select-none shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-650 mb-2">
              <Inbox className="w-8 h-8 stroke-[1.2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">
                Aucune notification trouvée
              </h3>
              <p className="text-xs text-zinc-500 font-bold max-w-sm">
                {searchQuery 
                  ? `Aucun résultat pour la recherche "${searchQuery}". Essayez d'autres termes.` 
                  : "Vous êtes à jour ! Aucune notification n'est disponible dans cette catégorie."}
              </p>
            </div>
          </div>

        ) : (
          
          /* Boucle sur les notifications */
          filteredNotifications.map((notif) => {
            const config = getTypeConfig(notif.type);
            const TypeIcon = config.icon;
            const isExpanded = expandedId === notif.id;

            return (
              <div
                key={notif.id}
                id={`notif-card-${notif.id}`}
                onClick={() => handleToggleExpand(notif.id, notif.is_opened)}
                className={cn(
                  "relative overflow-hidden rounded-[28px] border bg-zinc-950/80 backdrop-blur-2xl transition-all duration-300 cursor-pointer text-left flex flex-col group",
                  notif.is_opened ? "border-white/10" : "border-brand-primary/45 shadow-[0_0_20px_rgba(125,56,255,0.07)]",
                  isExpanded ? "border-brand-primary shadow-[0_0_30px_rgba(125,56,255,0.15)] scale-[1.01]" : "hover:border-white/20 hover:scale-[1.005]"
                )}
                style={{
                  boxShadow: isExpanded ? `0 0 30px ${config.accentColor}` : undefined
                }}
              >
                
                {/* Lueur d'arrière-plan propre au type sur carte ouverte */}
                {isExpanded && (
                  <div 
                    className="absolute -top-12 -left-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-20 transition-all duration-500"
                    style={{ backgroundColor: config.color.includes("brand-primary") ? "#7D38FF" : config.color.includes("brand-accent") ? "#C6FF34" : "#5ce1e6" }}
                  />
                )}

                {/* Point indicateur non-lu avec halo Vert Citron */}
                {!notif.is_opened && (
                  <span className="absolute left-3 top-7 w-2 h-2 bg-brand-accent rounded-full shadow-[0_0_8px_#C6FF34] animate-badge-pulse z-20" />
                )}

                {/* Corps Principal */}
                <div className="flex gap-4 p-5 md:p-6 items-start justify-between relative z-10 w-full">
                  
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    
                    {/* Colonne gauche : Image ou Icône de notification */}
                    <div className="shrink-0 relative">
                      {notif.metadata?.productImageUrl ? (
                        <img
                          src={notif.metadata.productImageUrl}
                          alt="Produit lié"
                          className={cn(
                            "w-12 h-12 rounded-2xl object-cover border border-white/15 shadow-md transition-all shrink-0 self-center",
                            notif.is_opened ? "opacity-60" : "opacity-100"
                          )}
                        />
                      ) : notif.metadata?.senderAvatarUrl ? (
                        <img
                          src={notif.metadata.senderAvatarUrl}
                          alt="Expéditeur"
                          className={cn(
                            "w-12 h-12 rounded-full object-cover border border-white/15 shadow-md transition-all shrink-0 self-center",
                            notif.is_opened ? "opacity-60" : "opacity-100"
                          )}
                        />
                      ) : (
                        <div className={cn(
                          "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all shadow-inner",
                          config.bg,
                          notif.is_opened ? "opacity-50" : "opacity-100"
                        )}>
                          <TypeIcon className={cn("w-5 h-5", config.color)} />
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel principal */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5 self-center">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                          config.bg,
                          config.color
                        )}>
                          {config.label}
                        </span>
                        
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider" suppressHydrationWarning>
                          {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <p className={cn(
                        "text-xs md:text-sm font-bold leading-relaxed pr-4 select-text transition-all",
                        notif.is_opened ? "text-zinc-400" : "text-zinc-100",
                        !isExpanded && "line-clamp-2 md:line-clamp-1"
                      )}>
                        {notif.message}
                      </p>
                    </div>

                  </div>

                  {/* Actions à droite */}
                  <div className="flex items-center gap-3 shrink-0 self-center">
                    
                    {/* Bouton de Suppression */}
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300 focus:outline-none"
                      title="Supprimer la notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Indicateur de Déploiement */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-450 group-hover:text-white transition-all duration-300">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>

                  </div>

                </div>

                {/* Section Détails Dépliés (Accordéon avec animation d'ouverture douce) */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-white/2 relative z-10 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-6 md:p-8 space-y-5">
                      
                      {/* Affichage Message Complet */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Message de la notification
                        </h4>
                        <p className="text-sm text-zinc-300 font-medium leading-relaxed bg-black/35 p-4 rounded-2xl border border-white/5 select-text whitespace-pre-wrap shadow-inner">
                          {notif.message}
                        </p>
                      </div>

                      {/* Affichage du Sondage */}
                      {notif.type === "POLL" && (() => {
                        const meta = typeof notif.metadata === "string" ? JSON.parse(notif.metadata) : notif.metadata || {};
                        const isPollClosed = !!meta.isClosed || !!pollResults[meta.broadcastId]?.isClosed;
                        const hasVoted = !!meta.userVote;

                        return (
                          <div className="space-y-4 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-3">
                              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <span>📊 Sondage : {meta.question || "Votre avis nous intéresse"}</span>
                              </h4>
                              {isPollClosed ? (
                                <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit shadow-inner">
                                  <Lock className="w-2.5 h-2.5" />
                                  Clôturé
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit animate-pulse">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                  En Cours
                                </span>
                              )}
                            </div>

                            {isPollClosed || hasVoted ? (
                              <div className="space-y-4">
                                <div className="text-xs text-zinc-400 font-bold leading-relaxed mb-2">
                                  {isPollClosed ? (
                                    hasVoted ? (
                                      <p>Ce sondage est clôturé. Merci pour votre vote ! Vous aviez choisi : <span className="text-emerald-400 font-extrabold uppercase tracking-wider">{meta.userVote}</span></p>
                                    ) : (
                                      <p className="text-zinc-500">Ce sondage est désormais clôturé. Les votes ne sont plus acceptés.</p>
                                    )
                                  ) : (
                                    <p>Votre vote a bien été pris en compte ! Choix : <span className="text-emerald-400 font-extrabold uppercase tracking-wider">{meta.userVote}</span></p>
                                  )}
                                </div>

                                {loadingResultsId === meta.broadcastId ? (
                                  <div className="flex items-center justify-center py-6 gap-2 bg-white/[0.01] border border-white/5 rounded-xl">
                                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Calcul des résultats en base...</span>
                                  </div>
                                ) : pollResults[meta.broadcastId] ? (
                                  <div className="grid grid-cols-1 gap-3">
                                    {pollResults[meta.broadcastId]?.options.map((opt: string) => {
                                      const votesCount = pollResults[meta.broadcastId]?.votes[opt] || 0;
                                      const totalVotes = pollResults[meta.broadcastId]?.totalVotes || 0;
                                      const percent = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
                                      const isUserChoice = meta.userVote === opt;

                                      return (
                                        <div key={opt} className="space-y-1.5">
                                          <div className="flex justify-between text-[11px] font-bold text-zinc-350">
                                            <span className={cn(isUserChoice && "text-emerald-400 font-extrabold flex items-center gap-1")}>
                                              {isUserChoice && <Check className="w-3 h-3 text-emerald-400 stroke-3 shrink-0" />}
                                              {opt}
                                            </span>
                                            <span className="text-zinc-400 font-medium">
                                              {votesCount} votes <span className="text-emerald-400 font-bold">({percent}%)</span>
                                            </span>
                                          </div>
                                          {/* Horizontal cyber progress gauge */}
                                          <div className="w-full h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden relative shadow-inner p-[1px]">
                                            <div 
                                              className={cn(
                                                "h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                                                isUserChoice ? "bg-gradient-to-r from-emerald-600 to-cyan-500" : "bg-zinc-700"
                                              )}
                                              style={{ width: `${percent}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <div className="text-[9px] text-zinc-650 font-bold uppercase text-right tracking-wider pt-1">
                                      Total participation : {pollResults[meta.broadcastId]?.totalVotes} réponses
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-zinc-550 italic font-bold">
                                    Aucun résultat cumulé disponible.
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {votingId === notif.id ? (
                                  <div className="flex items-center justify-center py-6 gap-2">
                                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                    <span className="text-xs text-zinc-500 font-bold">Enregistrement de votre vote...</span>
                                  </div>
                                ) : (
                                  meta.options?.map((opt: string) => (
                                    <button
                                      key={opt}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleVote(notif.id, opt);
                                      }}
                                      className="p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/[0.02] hover:bg-emerald-500/5 text-zinc-300 hover:text-white text-xs font-bold transition-all text-left flex items-center justify-between active:scale-[0.99] cursor-pointer group"
                                    >
                                      <span>{opt}</span>
                                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-emerald-400 uppercase tracking-widest transition-all">
                                        Voter →
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Métadonnées additionnelles s'il y en a */}
                      {notif.metadata && Object.keys(notif.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-1 items-center justify-between border-t border-white/5 pt-4">
                          
                          {/* Snippet ou informations secondaires */}
                          {notif.metadata.messageSnippet && (
                            <div className="space-y-1 max-w-md">
                              <h5 className="text-[9px] font-black uppercase tracking-wider text-zinc-550">
                                Aperçu
                              </h5>
                              <p className="text-xs text-zinc-400 font-semibold italic">
                                "{notif.metadata.messageSnippet}"
                              </p>
                            </div>
                          )}

                          {/* Bouton d'action de redirection vers l'application */}
                          {notif.metadata.redirectUrl && (
                            <Link
                              href={notif.metadata.redirectUrl}
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all duration-300 shadow-[0_4px_15px_rgba(125,56,255,0.3)] hover:scale-[1.02] cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Accéder au lien
                            </Link>
                          )}

                        </div>
                      )}

                      {/* Actions rapides de Livraison pour l'acheteur */}
                      {notif.metadata?.isDelivery && notif.metadata?.invoiceId && (
                        <div className="w-full mt-2 p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-left space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Actions requises</span>
                            <p className="text-xs text-white/80 font-semibold">Veuillez confirmer si vous avez reçu l'équipement de sport en parfait état ou s'il y a un problème.</p>
                          </div>
                          
                          {processingInvoices[notif.metadata.invoiceId] === "done_release" ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-md">
                              <Check className="w-4 h-4" />
                              <span>Fonds libérés avec succès ! Merci de votre confiance.</span>
                            </div>
                          ) : processingInvoices[notif.metadata.invoiceId] === "done_dispute" ? (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold shadow-md">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Litige déclaré. Notre service client analyse votre demande.</span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                              {/* Bouton Tout est OK */}
                              <button
                                onClick={(e) => handleReleaseFunds(e, notif.id, notif.metadata.invoiceId)}
                                disabled={processingInvoices[notif.metadata.invoiceId] !== undefined && processingInvoices[notif.metadata.invoiceId] !== null}
                                className="px-5 py-3 rounded-xl bg-brand-accent hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-accent/10 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                              >
                                {processingInvoices[notif.metadata.invoiceId] === "releasing" ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 text-black stroke-[3]" />
                                    <span>Tout est OK</span>
                                  </>
                                )}
                              </button>

                              {/* Bouton Déclarer un problème */}
                              <button
                                onClick={(e) => handleDispute(e, notif.id, notif.metadata.invoiceId)}
                                disabled={processingInvoices[notif.metadata.invoiceId] !== undefined && processingInvoices[notif.metadata.invoiceId] !== null}
                                className="px-5 py-3 rounded-xl bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                              >
                                {processingInvoices[notif.metadata.invoiceId] === "disputing" ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                ) : (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <span>Déclarer un problème</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>



      {/* MODAL PERSONNALISÉ DE DÉCLARATION DE LITIGE */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative bg-zinc-950 border border-white/10 rounded-[2.2rem] w-full max-w-lg p-7 md:p-9 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col text-left">
            
            {/* Icône de litige */}
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>

            {/* Titres */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Déclarer un problème</h3>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                Notre service de médiation est à votre écoute pour sécuriser votre achat. Décrivez précisément le problème ci-dessous. Les fonds resteront gelés en sécurité sous séquestre.
              </p>
            </div>

            {/* Formulaire message */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                Description de votre problème *
              </label>
              <textarea
                rows={4}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-black/55 border border-white/10 rounded-2xl p-4 text-xs text-white focus:border-red-500/60 focus:ring-0 transition-all outline-none resize-none placeholder-zinc-700 font-medium"
                placeholder="Indiquez ici si l'article est défectueux, incomplet, non conforme à la description..."
              />
            </div>

            {/* Boutons d'actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={submitDispute}
                disabled={!disputeReason.trim()}
                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Confirmer le litige</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
