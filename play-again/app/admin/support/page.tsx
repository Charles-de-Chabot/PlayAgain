"use client";

import { useState, useEffect } from "react";
import { LifeBuoy, CheckCircle, AlertCircle } from "lucide-react";
import SupportTicketSidebar, { type SupportTicketAdmin } from "./components/SupportTicketSidebar";
import SupportUserMetaHeader from "./components/SupportUserMetaHeader";
import SupportChatConsole from "./components/SupportChatConsole";

export default function SupportAdminPage() {
  // --- ÉTATS ---
  const [tickets, setTickets] = useState<SupportTicketAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketAdmin | null>(null);
  const [filterStatus, setFilterStatus] = useState("NEW");
  const [replyContent, setReplyContent] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- CHARGEMENT DES TICKETS ---
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/support?status=${filterStatus}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        // Reselect active ticket if it still exists in the fetched list
        if (selectedTicket) {
          const updated = data.tickets.find((t: any) => t.id === selectedTicket.id);
          if (updated) {
            setSelectedTicket(updated);
          }
        }
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de récupérer les tickets d'assistance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Sending administrative reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          content: replyContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setReplyContent("");

      // Reload tickets to refresh internal chat feed
      await fetchTickets();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur lors de l'envoi de la réponse.");
    } finally {
      setActionLoading(false);
    }
  };

  // Mark ticket as RESOLVED
  const handleResolveTicket = async (ticketId: number) => {
    try {
      setResolveLoading(true);
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          content:
            "✅ [Action Modérateur] Ce ticket d'assistance a été marqué comme RÉSOLU par un administrateur. Le dossier est désormais clos.",
          status: "RESOLVED",
        }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", "Ticket résolu avec succès !");
      setSelectedTicket(null);
      fetchTickets();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de résolution.");
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative h-full text-left">
      {/* 🔔 Toast notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Helpdesk & Assistance
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Répondez aux réclamations de vos utilisateurs. Les réponses alimentent en direct un fil de discussion permanent sécurisé dans leur messagerie.
        </p>
      </div>

      {/* 🔍 Sélecteur de filtres de statut */}
      <div className="flex gap-2 p-1.5 bg-white/[0.01] border border-white/[0.04] rounded-2xl w-fit">
        <button
          onClick={() => {
            setFilterStatus("NEW");
            setSelectedTicket(null);
          }}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterStatus === "NEW"
              ? "bg-[#10B981] text-black shadow-lg shadow-emerald-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Nouveaux tickets (Non lus)
        </button>
        <button
          onClick={() => {
            setFilterStatus("IN_PROGRESS");
            setSelectedTicket(null);
          }}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
            filterStatus === "IN_PROGRESS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          En cours de traitement
        </button>
      </div>

      {/* 🗺️ Workspace Split-screen Double Colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-[65vh]">
        {/* 📋 Colonne de Gauche : Liste des tickets (1/3) */}
        <SupportTicketSidebar
          tickets={tickets}
          selectedTicketId={selectedTicket?.id}
          loading={loading}
          onSelectTicket={setSelectedTicket}
        />

        {/* 💬 Colonne de Droite : Console de Chat Support (2/3) */}
        <div className="lg:col-span-2 bg-[#0C101D] border border-white/[0.06] rounded-3xl h-full flex flex-col shadow-2xl overflow-hidden relative">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <SupportUserMetaHeader
                ticket={selectedTicket}
                resolveLoading={resolveLoading}
                onResolve={handleResolveTicket}
              />

              <SupportChatConsole
                ticket={selectedTicket}
                replyContent={replyContent}
                onChangeReply={setReplyContent}
                actionLoading={actionLoading}
                onSendReply={handleSendReply}
              />
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
              <div className="p-4 rounded-3xl bg-white/[0.01] border border-white/[0.06] text-slate-500 animate-pulse shadow-inner">
                <LifeBuoy className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">Console d'Assistance Utilisateur</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                  Sélectionnez un ticket dans la colonne de gauche pour entamer la médiation ou répondre à l'utilisateur.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
