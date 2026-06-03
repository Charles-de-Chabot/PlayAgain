"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  markAsOpened,
  markAllAsOpened,
  deleteNotification,
} from "@/app/actions/notification";
import {
  voteInPoll,
  getPollResultsPublic,
} from "@/app/actions/broadcast";

export interface NotificationItem {
  id: number;
  type: "MESSAGE" | "TRANSACTION" | "SYSTEM" | "AI_MATCH" | "ANNOUNCEMENT" | "POLL";
  message: string;
  is_opened: boolean;
  created_at: string | Date;
  metadata?: any;
}

export function useNotifications(initialNotifications: NotificationItem[]) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Escrow / Logistics states
  const [processingInvoices, setProcessingInvoices] = useState<
    Record<number, "releasing" | "disputing" | "done_release" | "done_dispute" | null>
  >({});

  // Dispute modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInvoiceId, setDisputeInvoiceId] = useState<number | null>(null);
  const [disputeNotifId, setDisputeNotifId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  // Poll states
  const [votingId, setVotingId] = useState<number | null>(null);
  const [pollResults, setPollResults] = useState<
    Record<
      string,
      { options: string[]; votes: Record<string, number>; totalVotes: number; isClosed: boolean } | null
    >
  >({});
  const [loadingResultsId, setLoadingResultsId] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Scroll to active card when "open" search query param changes
  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) {
      const idNum = parseInt(openId);
      if (!isNaN(idNum)) {
        setExpandedId(idNum);

        setTimeout(() => {
          const element = document.getElementById(`notif-card-${idNum}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 350);
      }
    }
  }, [searchParams]);

  // Load poll statistics
  const loadPollResults = useCallback(
    async (broadcastId: string) => {
      if (pollResults[broadcastId]) return;
      try {
        setLoadingResultsId(broadcastId);
        const res = await getPollResultsPublic(broadcastId);
        if (res && res.success && res.options) {
          setPollResults((prev) => ({
            ...prev,
            [broadcastId]: {
              options: res.options || [],
              votes: (res.votes as Record<string, number>) || {},
              totalVotes: res.totalVotes || 0,
              isClosed: !!res.isClosed,
            },
          }));
        }
      } catch (e) {
        console.error("Erreur chargement résultats:", e);
      } finally {
        setLoadingResultsId(null);
      }
    },
    [pollResults]
  );

  useEffect(() => {
    if (expandedId !== null) {
      const expandedNotif = notifications.find((n) => n.id === expandedId);
      if (expandedNotif && expandedNotif.type === "POLL") {
        const meta =
          typeof expandedNotif.metadata === "string"
            ? JSON.parse(expandedNotif.metadata)
            : expandedNotif.metadata || {};
        if (meta.broadcastId) {
          loadPollResults(meta.broadcastId);
        }
      }
    }
  }, [expandedId, notifications, loadPollResults]);

  // SSE Subscription for real-time notifications
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) {
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

  const handleMarkRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_opened: true } : n)));
    try {
      await markAsOpened(id);
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  }, []);

  const handleToggleExpand = useCallback(
    async (id: number, isOpened: boolean) => {
      if (expandedId === id) {
        setExpandedId(null);
      } else {
        setExpandedId(id);
        if (!isOpened) {
          await handleMarkRead(id);
        }
      }
    },
    [expandedId, handleMarkRead]
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (expandedId === id) setExpandedId(null);

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      try {
        await deleteNotification(id);
      } catch (err) {
        console.error("Erreur lors de la suppression de la notification:", err);
      }
    },
    [expandedId]
  );

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_opened: true })));
    try {
      await markAllAsOpened();
    } catch (err) {
      console.error("Erreur lors du marquage de tout comme lu:", err);
    }
  }, []);

  const handleReleaseFunds = useCallback(
    async (e: React.MouseEvent, notifId: number, invoiceId: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (processingInvoices[invoiceId]) return;

      setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: "releasing" }));

      try {
        const res = await fetch(`/api/invoices/${invoiceId}/release`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erreur lors de la libération des fonds");
        }

        setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: "done_release" }));
        await handleMarkRead(notifId);
      } catch (err: any) {
        alert(err.message || "Erreur de connexion");
        setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: null }));
      }
    },
    [processingInvoices, handleMarkRead]
  );

  const handleDispute = useCallback(
    async (e: React.MouseEvent, notifId: number, invoiceId: number) => {
      e.stopPropagation();
      e.preventDefault();
      if (processingInvoices[invoiceId]) return;

      setDisputeInvoiceId(invoiceId);
      setDisputeNotifId(notifId);
      setDisputeReason("");
      setShowDisputeModal(true);
    },
    [processingInvoices]
  );

  const submitDispute = useCallback(async () => {
    if (!disputeInvoiceId || !disputeNotifId) return;
    if (!disputeReason.trim()) {
      alert("Vous devez décrire le problème pour pouvoir déclarer un litige.");
      return;
    }

    const invoiceId = disputeInvoiceId;
    const notifId = disputeNotifId;
    const reason = disputeReason.trim();

    setShowDisputeModal(false);
    setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: "disputing" }));

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

      setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: "done_dispute" }));
      await handleMarkRead(notifId);

      alert(
        "Votre litige a bien été déclaré. Vous allez être redirigé vers votre fil de discussion avec notre Service Après-Vente."
      );
      window.location.href = `/messages/${data.conversationId}`;
    } catch (err: any) {
      alert(err.message || "Erreur de connexion");
      setProcessingInvoices((prev) => ({ ...prev, [invoiceId]: null }));
    }
  }, [disputeInvoiceId, disputeNotifId, disputeReason, handleMarkRead]);

  const handleVote = useCallback(
    async (notifId: number, option: string) => {
      setVotingId(notifId);
      try {
        const res = await voteInPoll(notifId, option);
        if (res.success) {
          setNotifications((prev) =>
            prev.map((n) => {
              if (n.id === notifId) {
                const meta = typeof n.metadata === "string" ? JSON.parse(n.metadata) : n.metadata || {};
                const broadcastId = meta.broadcastId;
                if (broadcastId) {
                  setTimeout(() => {
                    setPollResults((prevResults) => {
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
                    userVote: option,
                  },
                  is_opened: true,
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
    },
    [loadPollResults]
  );

  // Tab count calculations
  const counts = useMemo(() => {
    return {
      ALL: notifications.length,
      MESSAGE: notifications.filter((n) => n.type === "MESSAGE").length,
      TRANSACTION: notifications.filter((n) => n.type === "TRANSACTION").length,
      SYSTEM: notifications.filter((n) => n.type === "SYSTEM").length,
      AI_MATCH: notifications.filter((n) => n.type === "AI_MATCH").length,
      ANNOUNCEMENT: notifications.filter((n) => n.type === "ANNOUNCEMENT").length,
      POLL: notifications.filter((n) => n.type === "POLL").length,
      UNREAD: notifications.filter((n) => !n.is_opened).length,
    };
  }, [notifications]);

  // Filtering search and sort computations
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (filterType !== "ALL") {
      result = result.filter((n) => n.type === filterType);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.message.toLowerCase().includes(query) || n.type.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notifications, filterType, searchQuery, sortBy]);

  return {
    notifications,
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
  };
}
