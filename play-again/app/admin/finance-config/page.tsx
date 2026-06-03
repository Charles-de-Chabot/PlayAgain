"use client";

import { useState, useEffect } from "react";
import { Sliders, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import PlatformFeesForm from "./components/PlatformFeesForm";
import PricingSimulator from "./components/PricingSimulator";
import AuditHistoryLog, { type AdminLog } from "./components/AuditHistoryLog";

interface FinanceConfig {
  commissionRate: number;
  flatFee: number;
}

export default function FinanceConfigPage() {
  // --- ÉTATS ---
  const [config, setConfig] = useState<FinanceConfig>({ commissionRate: 5.0, flatFee: 0.70 });
  const [history, setHistory] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Valeurs du formulaire d'édition
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [flatFee, setFlatFee] = useState(0.70);

  // --- CHARGEMENT DES CONFIGS ---
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/config/fees");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setCommissionRate(data.config.commissionRate);
        setFlatFee(data.config.flatFee);
      }
      if (data.history) {
        setHistory(data.history);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger la configuration financière.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // --- ENREGISTREMENT ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/config/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate,
          flatFee,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Erreur de sauvegarde.");
        return;
      }

      showNotification("success", data.message);
      setConfig({ commissionRate, flatFee });

      // Rafraîchir l'historique
      const freshRes = await fetch("/api/admin/config/fees");
      const freshData = await freshRes.json();
      if (freshData.history) {
        setHistory(freshData.history);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de sauvegarde.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative text-left">
      {/* 🔔 Toast notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-bounce ${
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sliders className="w-8 h-8 text-emerald-400" />
            Configuration des Commissions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gégérez les taux de commission, les frais de transaction fixes de la plateforme et simulez l'impact financier en temps réel.
          </p>
        </div>

        {/* Glow indicator */}
        <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-extrabold uppercase tracking-wider self-start md:self-auto animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Contrôle Financier Live</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Synchronisation des règles de commission...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* GAUCHE : FORMULAIRE DE RÉGLAGES (5/12) */}
          <div className="lg:col-span-5">
            <PlatformFeesForm
              commissionRate={commissionRate}
              setCommissionRate={setCommissionRate}
              flatFee={flatFee}
              setFlatFee={setFlatFee}
              actionLoading={actionLoading}
              onSubmit={handleSave}
            />
          </div>

          {/* DROITE : SIMULATEUR & HISTORIQUE (7/12) */}
          <div className="lg:col-span-7 space-y-8">
            <PricingSimulator commissionRate={commissionRate} flatFee={flatFee} />

            <AuditHistoryLog history={history} />
          </div>
        </div>
      )}
    </div>
  );
}
