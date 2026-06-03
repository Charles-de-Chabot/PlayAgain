"use client";

import React from "react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import NotificationEditor from "./components/NotificationEditor";
import LivePreview from "./components/LivePreview";
import LivePolls from "./components/LivePolls";
import BroadcastHistory from "./components/BroadcastHistory";

/**
 * AdminNotificationsPage orchestrates the administrator broadcast dashboard.
 */
export default function AdminNotificationsPage() {
  const {
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
  } = useAdminNotifications();

  return (
    <div className="flex-1 flex flex-col space-y-8 relative pb-16">
      {/* 🚀 En-tête de la page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
            SuperAdmin Console
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Notifications &amp; Sondages Globaux
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">
            Diffusez des annonces importantes ou lancez des sondages instantanés auprès de toute la communauté PlayAgain.
          </p>
        </div>

        {/* Toggles de Navigation d'onglet */}
        <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "editor"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] font-extrabold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Créer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "live"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] font-extrabold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Sondages Live
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
              activeTab === "history"
                ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] font-extrabold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Historique
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        /* ================= ONGLER ÉDITEUR ================= */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* A. Éditeur de messages riches (3/5) */}
          <div className="lg:col-span-3">
            <NotificationEditor
              broadcastType={broadcastType}
              setBroadcastType={setBroadcastType}
              targetType={targetType}
              setTargetType={setTargetType}
              targetDropdownOpen={targetDropdownOpen}
              setTargetDropdownOpen={setTargetDropdownOpen}
              message={message}
              setMessage={setMessage}
              redirectUrl={redirectUrl}
              setRedirectUrl={setRedirectUrl}
              coverImageUrl={coverImageUrl}
              setCoverImageUrl={setCoverImageUrl}
              pollQuestion={pollQuestion}
              setPollQuestion={setPollQuestion}
              pollOptions={pollOptions}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              onOptionChange={handleOptionChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          {/* B. Live Mobile Preview Container (2/5) */}
          <div className="lg:col-span-2">
            <LivePreview
              broadcastType={broadcastType}
              message={message}
              coverImageUrl={coverImageUrl}
              pollQuestion={pollQuestion}
              pollOptions={pollOptions}
              redirectUrl={redirectUrl}
            />
          </div>
        </div>
      ) : activeTab === "live" ? (
        /* ================= ONGLER SONDAGES LIVE ================= */
        <LivePolls
          history={history}
          historyLoading={historyLoading}
          closingBroadcastId={closingBroadcastId}
          onClosePoll={handleClosePoll}
          onRefresh={fetchHistory}
        />
      ) : (
        /* ================= ONGLER HISTORIQUE ================= */
        <BroadcastHistory
          history={history}
          historyLoading={historyLoading}
          expandedRowId={expandedRowId}
          setExpandedRowId={setExpandedRowId}
          onRefresh={fetchHistory}
        />
      )}
    </div>
  );
}
