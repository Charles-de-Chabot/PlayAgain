"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LifeBuoy, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  MessageSquare,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check
} from "lucide-react";

interface SupportMessageAdmin {
  id: number;
  ticketId: number;
  senderId: number;
  isAdminReply: boolean;
  content: string;
  createdAt: string;
}

interface SupportTicketAdmin {
  id: number;
  userId: number;
  subject: string | null;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string;
    phone: string | null;
    profile_picture: string | null;
  };
  messages: SupportMessageAdmin[];
}

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

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket, selectedTicket?.messages]);

  // --- CHARGEMENT DES TICKETS ---
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/support?status=${filterStatus}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        // Reselectionner le ticket actif s'il existe toujours dans la liste
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

  // Envoi de la réponse administrative
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
          content: replyContent.trim()
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setReplyContent("");
      
      // Recharger les tickets pour actualiser le chat interne
      await fetchTickets();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur lors de l'envoi de la réponse.");
    } finally {
      setActionLoading(false);
    }
  };

  // Marquer un ticket comme RESOLU
  const handleResolveTicket = async (ticketId: number) => {
    try {
      setResolveLoading(true);
      // On peut appeler une simple API ou modifier le statut. Pour simplifier, on envoie un message disant que le ticket est résolu
      // et on peut mettre à jour le statut en base. Nous créons un appel transactionnel.
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          content: "✅ [Action Modérateur] Ce ticket d'assistance a été marqué comme RÉSOLU par un administrateur. Le dossier est désormais clos.",
          status: "RESOLVED"
        })
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
    <div className="flex-1 flex flex-col space-y-8 relative h-full">
      
      {/* 🔔 Toast notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
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
          onClick={() => { setFilterStatus("NEW"); setSelectedTicket(null); }}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
            filterStatus === "NEW" 
              ? "bg-[#10B981] text-black shadow-lg shadow-emerald-500/15" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Nouveaux tickets (Non lus)
        </button>
        <button
          onClick={() => { setFilterStatus("IN_PROGRESS"); setSelectedTicket(null); }}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
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
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 h-full overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3">
            Flux de demandes d'aide
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 flex-1">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-[10px] text-slate-500 font-mono">Scan des tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-12 text-slate-500 font-bold text-xs flex-1 flex items-center justify-center">
              Aucun ticket de support dans cette catégorie.
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 relative group text-left ${
                    selectedTicket?.id === ticket.id
                      ? "bg-white/[0.06] border-white/15"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Pseudo & Badge d'état */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-[#10B981] transition-colors truncate max-w-[70%]">
                      {ticket.user.firstname} {ticket.user.lastname}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                      ticket.status === "NEW"
                        ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25 animate-pulse"
                        : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                    }`}>
                      {ticket.status === "NEW" ? "Nouveau" : "En cours"}
                    </span>
                  </div>

                  {/* Objet & Description abrégée */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-extrabold text-slate-300 line-clamp-1 leading-snug">
                      Objet : {ticket.subject || "Demande sans objet"}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 font-medium leading-relaxed">
                      {ticket.content}
                    </p>
                  </div>

                  {/* Date en bas */}
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-white/[0.03]">
                    <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Créé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 💬 Colonne de Droite : Console de Chat Support (2/3) */}
        <div className="lg:col-span-2 bg-[#0C101D] border border-white/[0.06] rounded-3xl h-full flex flex-col shadow-2xl overflow-hidden relative">
          
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* En-tête du Chat */}
              <div className="p-4 bg-white/[0.01] border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedTicket.user.profile_picture ? (
                      <img src={selectedTicket.user.profile_picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        {(selectedTicket.user.username || selectedTicket.user.email).substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                      {selectedTicket.user.firstname} {selectedTicket.user.lastname}
                      <span className="text-[9px] font-mono font-bold text-slate-500">(@{selectedTicket.user.username})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      Sujet : <span className="text-slate-300 font-bold">{selectedTicket.subject || "Support Général"}</span>
                    </span>
                  </div>
                </div>

                {/* Résoudre */}
                <button
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  disabled={resolveLoading}
                  className="p-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white border border-white/5 active:scale-95 transition-all rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {resolveLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Clore & Résoudre</span>
                    </>
                  )}
                </button>
              </div>

              {/* User Metadata / Contact Info Bar */}
              <div className="px-6 py-3 bg-[#0A0D18]/80 border-b border-white/4 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2 text-slate-400 min-w-0">
                  <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">E-mail:</span>
                  <a href={`mailto:${selectedTicket.user.email}`} className="text-[#10B981] hover:underline text-[11px] font-bold truncate">
                    {selectedTicket.user.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400 min-w-0">
                  <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">Téléphone:</span>
                  <span className="text-slate-200 text-[11px] font-bold truncate">
                    {selectedTicket.user.phone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 min-w-0 md:justify-end">
                  <span className="font-mono text-[9px] uppercase text-slate-500 shrink-0">ID Utilisateur:</span>
                  <span className="text-slate-200 text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    #{selectedTicket.user.id}
                  </span>
                </div>
              </div>

              {/* Corps de la conversation historique */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                
                {/* 1. La question initiale de l'utilisateur */}
                <div className="flex gap-3 items-start max-w-[85%] text-left">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-lg text-xs leading-relaxed">
                    <div className="text-[9px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
                      <span>Message Initial</span>
                      <span>•</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"})}</span>
                    </div>
                    <p className="text-slate-200 font-medium">
                      {selectedTicket.content}
                    </p>
                  </div>
                </div>

                {/* 2. Les réponses consécutives (Admin et autres) */}
                {selectedTicket.messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 items-start max-w-[85%] text-left ${
                      msg.isAdminReply ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shrink-0 ${
                      msg.isAdminReply 
                        ? "bg-[#10B981]/15 border-[#10B981]/20 text-[#10B981]" 
                        : "bg-slate-800 border-white/10 text-slate-400"
                    }`}>
                      {msg.isAdminReply ? <ShieldCheck className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    <div className={`rounded-2xl p-4 shadow-lg text-xs leading-relaxed ${
                      msg.isAdminReply
                        ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-[#10B981]/25 rounded-tr-none text-emerald-100"
                        : "bg-white/5 border border-white/10 rounded-tl-none text-slate-200"
                    }`}>
                      <div className="text-[9px] font-bold text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
                        <span>{msg.isAdminReply ? "Support PlayAgain" : "Message"}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString("fr-FR", {hour: "2-digit", minute: "2-digit"})}</span>
                      </div>
                      {msg.content.startsWith("📷 Image partagée : ") ? (
                        <div className="space-y-2 mt-1">
                          <span className="text-[10px] text-slate-400 block font-bold">📷 Image partagée :</span>
                          <a 
                            href={msg.content.replace("📷 Image partagée : ", "")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-white/10 hover:border-[#10B981]/50 transition-all max-w-[240px] bg-zinc-950 shadow-md group"
                          >
                            <img 
                              src={msg.content.replace("📷 Image partagée : ", "")} 
                              alt="Partagée" 
                              className="w-full h-auto object-cover max-h-48 group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </a>
                        </div>
                      ) : (
                        <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

              </div>

              {/* Pied de saisie administrative */}
              <form onSubmit={handleSendReply} className="p-4 bg-[#0A0D18] border-t border-white/[0.04] flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Tapez votre réponse d'aide..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 focus:border-[#10B981]/50 focus:outline-none rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !replyContent.trim()}
                  className="p-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer shadow-lg"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

            </div>
          ) : (
            /* Écran d'accueil Helpdesk vide */
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
              <div className="p-4 rounded-3xl bg-white/[0.01] border border-white/[0.06] text-slate-500 animate-pulse shadow-inner">
                <LifeBuoy className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">
                  Console d'Assistance Utilisateur
                </h3>
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
