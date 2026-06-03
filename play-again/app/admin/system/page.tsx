"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import StorageIndicators from "./components/StorageIndicators";
import SystemTerminalConsole from "./components/SystemTerminalConsole";
import OrphanFilesGrid from "./components/OrphanFilesGrid";

export default function SystemAdminPage() {
  // --- ÉTATS ---
  const [stats, setStats] = useState({
    totalStorageUsedBytes: 0,
    orphansCount: 0,
    orphansStorageSizeDeltaBytes: 0,
    dbMediaCount: 0,
  });
  const [orphans, setOrphans] = useState<{ url: string; size: number }[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- CHARGEMENT DES STATS DE STOCKAGE ---
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system/storage");
      const data = await res.json();
      if (data.success) {
        setStats({
          totalStorageUsedBytes: data.totalStorageUsedBytes,
          orphansCount: data.orphansCount,
          orphansStorageSizeDeltaBytes: data.orphansStorageSizeDeltaBytes,
          dbMediaCount: data.dbMediaCount,
        });
        const fetchedOrphans = data.orphans || [];
        setOrphans(fetchedOrphans);
        setSelectedUrls(fetchedOrphans.map((o: any) => o.url));
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible d'analyser le serveur de stockage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const toggleSelectOrphan = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUrls.length === orphans.length) {
      setSelectedUrls([]);
    } else {
      setSelectedUrls(orphans.map((o) => o.url));
    }
  };

  const handleLaunchCleanup = async () => {
    if (selectedUrls.length === 0) {
      showNotification("error", "Veuillez sélectionner au moins un fichier à supprimer.");
      return;
    }

    try {
      setCleaning(true);
      setLogs([
        "🚀 INITIALISATION DU NETTOYAGE DIFFÉRENTIEL CIBLÉ...",
        `🔍 ${selectedUrls.length} fichiers sélectionnés prêts pour la suppression.`,
        "⚠️ PURGE SÉCURISÉE DES FICHIERS ORPHELINS INITIÉE...",
      ]);

      const res = await fetch("/api/admin/system/storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: selectedUrls }),
      });
      const data = await res.json();

      if (data.error) {
        setLogs((prev) => [...prev, `❌ ERREUR SYSTÈME : ${data.error}`]);
        showNotification("error", data.error);
        return;
      }

      // Progressively simulate logs printing
      const deletedFiles = data.deletedUrls || [];

      for (let i = 0; i < deletedFiles.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        const fileInfo = orphans.find((o) => o.url === deletedFiles[i]);
        const sizeStr = fileInfo ? formatBytes(fileInfo.size) : "Inconnu";
        setLogs((prev) => [...prev, `🟢 PURGED OK : ${deletedFiles[i]} - Libéré : ${sizeStr}`]);
      }

      setLogs((prev) => [
        ...prev,
        "--------------------------------------------------",
        "🎉 PURGE CIBLÉE TERMINÉE AVEC SUCCÈS !",
        `✅ Fichiers supprimés de votre machine : ${data.deletedCount}`,
        `✅ Espace disque libéré : ${(data.bytesFreed / (1024 * 1024)).toFixed(2)} Mo`,
        "🟢 Système de fichiers : SAIN & OPTIMISÉ.",
      ]);

      await fetchStats();
      setSelectedUrls([]);
      showNotification("success", data.message);
    } catch (e) {
      console.error(e);
      setLogs((prev) => [...prev, "❌ ERREUR TECHNIQUE : Échec de communication avec le serveur."]);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setCleaning(false);
    }
  };

  // Bytes formatter utility helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0.00 Mo";
    const giga = bytes / (1024 * 1024 * 1024);
    if (giga >= 1) return `${giga.toFixed(2)} Go`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative text-left">
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
          Nettoyeur d'Images & Santé Serveur
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Surveillez le stockage occupé sur vos CDNs de médias et purgez en toute sécurité les images orphelines obsolètes.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Diagnostic matériel en cours...</span>
        </div>
      ) : (
        <div className="flex flex-col space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* A. Gauges circulaires (1/3) */}
            <StorageIndicators
              stats={stats}
              loading={loading}
              onRefresh={fetchStats}
              formatBytes={formatBytes}
            />

            {/* B. Console de Nettoyage Cybernétique (2/3) */}
            <div className="lg:col-span-2 h-full">
              <SystemTerminalConsole
                logs={logs}
                cleaning={cleaning}
                selectedCount={selectedUrls.length}
                onLaunchCleanup={handleLaunchCleanup}
              />
            </div>
          </div>

          {/* 🖼/ Aperçu des images orphelines */}
          <OrphanFilesGrid
            orphans={orphans}
            selectedUrls={selectedUrls}
            onToggleSelectOrphan={toggleSelectOrphan}
            onToggleSelectAll={toggleSelectAll}
            formatBytes={formatBytes}
          />
        </div>
      )}
    </div>
  );
}
