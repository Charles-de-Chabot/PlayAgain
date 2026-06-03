"use client";

import React from "react";
import { CheckCheck, Inbox } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationFilterBar from "./components/NotificationFilterBar";
import NotificationCard from "./components/NotificationCard";
import DisputeModal from "./components/DisputeModal";

interface NotificationsClientProps {
  initialNotifications: any[];
}

/**
 * NotificationsClient is the main container orchestrating the client's notifications page,
 * employing subcomponents and useNotifications hook state management.
 */
export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const {
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    expandedId,
    setExpandedId,
    processingInvoices,
    showDisputeModal,
    setShowDisputeModal,
    disputeReason,
    setDisputeReason,
    votingId,
    pollResults,
    loadingResultsId,
    handleToggleExpand,
    handleDelete,
    handleMarkAllRead,
    handleReleaseFunds,
    handleDispute,
    submitDispute,
    handleVote,
    counts,
    filteredNotifications,
  } = useNotifications(initialNotifications);

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
      {/* Principal header panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/15 text-left">
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
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-950/80 border border-brand-accent/30 text-brand-accent text-[11px] font-black uppercase tracking-widest hover:bg-brand-accent/5 hover:border-brand-accent/60 transition-all duration-300 shadow-[0_0_15px_rgba(198,255,52,0.05)] cursor-pointer shrink-0 self-start md:self-end"
          >
            <CheckCheck className="w-4 h-4 stroke-[2]" />
            <span>Tout marquer comme lu ({counts.UNREAD})</span>
          </button>
        )}
      </div>

      {/* Filter and search bar */}
      <NotificationFilterBar
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterType={filterType}
        setFilterType={setFilterType}
        tabs={tabs}
        setExpandedId={setExpandedId}
      />

      {/* Notification items list */}
      <div className="flex flex-col gap-4">
        {filteredNotifications.length === 0 ? (
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
          filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              isExpanded={expandedId === notif.id}
              onToggleExpand={handleToggleExpand}
              onDelete={handleDelete}
              votingId={votingId}
              pollResults={pollResults}
              loadingResultsId={loadingResultsId}
              onVote={handleVote}
              processingInvoices={processingInvoices}
              onReleaseFunds={handleReleaseFunds}
              onDispute={handleDispute}
            />
          ))
        )}
      </div>

      {/* Custom Transaction Dispute Modal */}
      <DisputeModal
        showDisputeModal={showDisputeModal}
        setShowDisputeModal={setShowDisputeModal}
        disputeReason={disputeReason}
        setDisputeReason={setDisputeReason}
        onSubmit={submitDispute}
      />
    </div>
  );
}
