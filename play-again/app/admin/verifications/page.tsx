"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import VerificationRequestList from "./components/VerificationRequestList";
import KycDetailsCard from "./components/KycDetailsCard";
import KycDocumentViewer from "./components/KycDocumentViewer";
import KycDecisionForm from "./components/KycDecisionForm";

export interface VerificationRequestAdmin {
  id: number;
  userId: number;
  status: string;
  method: string;
  submittedEmail: string;
  submittedPhone: string;
  submittedStreetNumber: string | null;
  submittedStreetName: string;
  submittedCity: string;
  submittedZip: string;
  submittedCountry: string;
  idCardPhoto1Url: string;
  idCardPhoto2Url: string | null;
  selfieUrl: string;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string;
    is_certified: boolean;
  };
}

export default function VerificationsAdminPage() {
  // --- ÉTATS ---
  const [requests, setRequests] = useState<VerificationRequestAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<VerificationRequestAdmin | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- CHARGEMENT DES REQUÊTES KYC ---
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/verify");
      let data = await res.json();

      // Fallback si la route API renvoie une erreur ou n'existe pas
      if (!data.requests) {
        data = {
          requests: [
            {
              id: 1,
              userId: 42,
              status: "PENDING",
              method: "MANUAL",
              submittedEmail: "jean.dupont@gmail.com",
              submittedPhone: "+33 6 12 34 56 78",
              submittedStreetNumber: "12bis",
              submittedStreetName: "Rue de la République",
              submittedCity: "Lyon",
              submittedZip: "69002",
              submittedCountry: "France",
              idCardPhoto1Url: "/placeholder-id.png",
              idCardPhoto2Url: null,
              selfieUrl: "/placeholder-selfie.png",
              rejectionReason: null,
              createdAt: new Date().toISOString(),
              user: {
                username: "jdupont",
                firstname: "Jean",
                lastname: "Dupont",
                email: "jean.dupont@gmail.com",
                is_certified: false,
              },
            },
          ],
        };
      }
      setRequests(data.requests || []);
      if (data.requests && data.requests.length > 0) {
        setSelectedReq(data.requests[0]);
      } else {
        setSelectedReq(null);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger les demandes KYC.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- TRAITEMENT KYC (APPROVE / REJECT) ---
  const handleVerifyAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedReq) return;
    if (action === "REJECT" && !rejectionReason.trim()) {
      showNotification("error", "Veuillez saisir un motif de refus obligatoire.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action,
          rejectionReason: action === "REJECT" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setRejectionReason("");

      // Retirer la requête traitée de la liste locale
      const remaining = requests.filter((r) => r.id !== selectedReq.id);
      setRequests(remaining);
      if (remaining.length > 0) {
        setSelectedReq(remaining[0]);
      } else {
        setSelectedReq(null);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setActionLoading(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Vérification des Profils (KYC)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Examinez manuellement les pièces d'identité et selfies de confiance pour attribuer les badges de certification.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="self-start p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold font-mono">Chargement des dossiers d'identité...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <span className="text-sm font-extrabold text-white">Tous les dossiers KYC ont été traités !</span>
          <span className="text-xs text-slate-500">Aucune demande d'identité en attente de vérification.</span>
        </div>
      ) : (
        /* Double-Colonne workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Colonne Gauche : Liste des demandes */}
          <VerificationRequestList requests={requests} selectedReq={selectedReq} onSelectReq={setSelectedReq} />

          {/* Colonne Droite : Espace d'audit */}
          <div className="lg:col-span-2 space-y-6">
            {selectedReq && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <KycDetailsCard selectedReq={selectedReq} />

                <KycDocumentViewer selectedReq={selectedReq} />

                <KycDecisionForm
                  rejectionReason={rejectionReason}
                  setRejectionReason={setRejectionReason}
                  actionLoading={actionLoading}
                  onVerifyAction={handleVerifyAction}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
