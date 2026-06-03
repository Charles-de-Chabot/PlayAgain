"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { sendGlobalBroadcast, getAdminBroadcastHistory, closePoll } from "@/app/actions/notification";

export interface BroadcastSummary {
  broadcastId: string;
  type: "POLL" | "ANNOUNCEMENT";
  question?: string;
  message: string;
  options?: string[];
  createdAt: Date | string;
  votes?: Record<string, number>;
  totalVotes?: number;
  notifiedCount: number;
  isClosed?: boolean;
  closedAt?: string;
  redirectUrl?: string;
  coverImageUrl?: string;
  targetType?: "GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED";
}

/**
 * useAdminNotifications custom hook handles options insertion, submit validations,
 * poll closing, and histories loaders.
 */
export function useAdminNotifications() {
  const { showToast } = useToast();

  const [broadcastType, setBroadcastType] = useState<"ANNOUNCEMENT" | "POLL">("ANNOUNCEMENT");
  const [targetType, setTargetType] = useState<"GLOBAL" | "SELLERS" | "BUYERS" | "CERTIFIED" | "UNCERTIFIED">("GLOBAL");
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["Tennis", "Padel"]);

  const [activeTab, setActiveTab] = useState<"editor" | "live" | "history">("editor");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<BroadcastSummary[]>([]);
  const [closingBroadcastId, setClosingBroadcastId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await getAdminBroadcastHistory();
      setHistory(data as any);
    } catch (e) {
      console.error(e);
      showToast("error", "Impossible de charger l'historique des diffusions.");
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setTargetDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleAddOption = useCallback(() => {
    if (pollOptions.length >= 4) {
      showToast("error", "Un sondage est limité à 4 options maximum.");
      return;
    }
    setPollOptions((prev) => [...prev, ""]);
  }, [pollOptions.length, showToast]);

  const handleRemoveOption = useCallback((index: number) => {
    if (pollOptions.length <= 2) {
      showToast("error", "Un sondage requiert au moins 2 options.");
      return;
    }
    setPollOptions((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }, [pollOptions.length, showToast]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }, []);

  const handleClosePoll = useCallback(async (broadcastId: string) => {
    try {
      setClosingBroadcastId(broadcastId);
      const res = await closePoll(broadcastId);
      if (res.success) {
        showToast("success", res.message || "Sondage clôturé avec succès.");
        fetchHistory();
      } else {
        showToast("error", res.error || "Impossible de clôturer le sondage.");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur technique lors de la clôture.");
    } finally {
      setClosingBroadcastId(null);
    }
  }, [fetchHistory, showToast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (broadcastType === "ANNOUNCEMENT") {
      if (!message.trim()) {
        showToast("error", "Veuillez saisir un message pour l'annonce globale.");
        return;
      }
    } else {
      if (!pollQuestion.trim()) {
        showToast("error", "Veuillez saisir la question du sondage.");
        return;
      }

      const filledOptions = pollOptions.filter((o) => o.trim() !== "");
      if (filledOptions.length < 2) {
        showToast("error", "Un sondage requiert au moins 2 options valides remplies.");
        return;
      }
    }

    try {
      setLoading(true);

      const payloadMessage = broadcastType === "ANNOUNCEMENT" ? message : pollQuestion;
      const metadata: any = {};

      if (broadcastType === "ANNOUNCEMENT") {
        if (redirectUrl.trim()) metadata.redirectUrl = redirectUrl.trim();
        if (coverImageUrl.trim()) metadata.productImageUrl = coverImageUrl.trim();
      } else {
        metadata.question = pollQuestion.trim();
        metadata.options = pollOptions.filter((o) => o.trim() !== "").map((o) => o.trim());
      }

      const res = await sendGlobalBroadcast({
        type: broadcastType,
        message: payloadMessage,
        targetType,
        metadata,
      });

      if (!res.success) {
        showToast("error", res.error || "Une erreur est survenue lors de l'envoi.");
        return;
      }

      showToast("success", res.message || "Message broadcasté avec succès !");

      setMessage("");
      setRedirectUrl("");
      setCoverImageUrl("");
      setPollQuestion("");
      setPollOptions(["Tennis", "Padel"]);

      fetchHistory();

      if (broadcastType === "POLL") {
        setActiveTab("history");
      }
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur réseau ou serveur lors du broadcast.");
    } finally {
      setLoading(false);
    }
  }, [broadcastType, message, pollQuestion, pollOptions, targetType, fetchHistory, showToast]);

  return {
    broadcastType,
    setBroadcastType,
    targetType,
    setTargetType,
    targetDropdownOpen,
    setTargetDropdownOpen,
    message,
    setMessage,
    redirectUrl,
    setRedirectUrl,
    coverImageUrl,
    setCoverImageUrl,
    pollQuestion,
    setPollQuestion,
    pollOptions,
    setPollOptions,
    activeTab,
    setActiveTab,
    expandedRowId,
    setExpandedRowId,
    loading,
    historyLoading,
    history,
    closingBroadcastId,
    handleAddOption,
    handleRemoveOption,
    handleOptionChange,
    handleClosePoll,
    handleSubmit,
    fetchHistory,
  };
}
