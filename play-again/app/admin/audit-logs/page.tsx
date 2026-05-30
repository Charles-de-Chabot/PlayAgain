"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Terminal as TermIcon, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Database,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface AdminLogAdmin {
  id: number;
  adminId: number;
  adminEmail: string;
  action: string;
  targetId: number | null;
  createdAt: string;
  metadata: any;
}

export default function AuditLogsAdminPage() {
  // --- ÉTATS ---
  const [logs, setLogs] = useState<AdminLogAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- CHARGEMENT DES LOGS D'AUDIT ---
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterAction) queryParams.append("action", filterAction);

      const res = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible d'extraire les logs d'audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      
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
          Journal d'Audit & Sécurité
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Historique d'audit système traçant chaque action effectuée par l'équipe administrative de PlayAgain.
        </p>
      </div>

      {/* 🔍 Filtres de types d'actions administratives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg">
        
        {/* Sélecteur d'action */}
        <div className="relative flex items-center">
          <Filter className="absolute left-3 w-4 h-4 text-slate-500" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
          >
            <option value="">Toutes les actions administratives</option>
            <option value="USER_SOFT_DELETE">Suspendre utilisateur (USER_SOFT_DELETE)</option>
            <option value="USER_REACTIVATE">Réactiver utilisateur (USER_REACTIVATE)</option>
            <option value="CATALOG_PRODUCT_DEACTIVATE">Suspendre produit (CATALOG_PRODUCT_DEACTIVATE)</option>
            <option value="CATALOG_PRODUCT_ACTIVATE">Réactiver produit (CATALOG_PRODUCT_ACTIVATE)</option>
            <option value="PROMO_CODE_CREATED">Créer code promo (PROMO_CODE_CREATED)</option>
            <option value="PROMO_CODE_BROADCAST">Diffuser offre (PROMO_CODE_BROADCAST)</option>
            <option value="STORAGE_ORPHAN_CLEANUP">Purge orpheline (STORAGE_ORPHAN_CLEANUP)</option>
            <option value="SEO_METADATA_UPDATE">Mise à jour SEO (SEO_METADATA_UPDATE)</option>
          </select>
        </div>

      </div>

      {/* 🖥️ Terminal Monospace Log Viewer */}
      <div className="bg-[#05070E] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
        
        {/* Barre titre de la console */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <TermIcon className="w-4.5 h-4.5 text-emerald-400" />
            <span>playagain-audit-terminal@root</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full inline-block" />
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
          </div>
        </div>

        {/* Corps des logs monospace */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3 text-cyan-400 font-mono text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>[SYSTEM_SCAN] Extraction de la table d'audit...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-16 text-slate-600 font-mono text-xs italic">
              [CON-LOG] Aucun événement administratif enregistré dans cette catégorie.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-[11px] leading-relaxed text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 bg-white/[0.01]">
                  <th className="p-3 uppercase">Horodatage</th>
                  <th className="p-3 uppercase">Modérateur</th>
                  <th className="p-3 uppercase text-center">Événement</th>
                  <th className="p-3 uppercase">Métadonnées d'Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString("fr-FR")} à {new Date(log.createdAt).toLocaleTimeString("fr-FR")}
                    </td>

                    {/* Email administrateur */}
                    <td className="p-3 font-bold text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>{log.adminEmail}</span>
                    </td>

                    {/* Type Action / Événement */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        log.action.includes("DELETE") || log.action.includes("DEACTIVATE")
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : log.action.includes("CREATE") || log.action.includes("CLEANUP") || log.action.includes("ACTIVATE")
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Metadata JSON formaté */}
                    <td className="p-3 text-slate-400 max-w-xs sm:max-w-md md:max-w-lg truncate select-text" title={JSON.stringify(log.metadata)}>
                      <span className="text-[10px] text-slate-500">{'{'}</span>
                      {log.metadata && Object.entries(log.metadata).map(([key, val]: any, i) => (
                        <span key={i} className="mx-1">
                          <span className="text-cyan-400">"{key}"</span>: 
                          <span className="text-amber-300"> {typeof val === "object" ? JSON.stringify(val) : `"${val}"`}</span>
                          {i < Object.entries(log.metadata).length - 1 ? "," : ""}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-500">{'}'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
