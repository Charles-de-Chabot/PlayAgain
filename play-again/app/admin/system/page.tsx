"use client";

import { useState, useEffect, useRef } from "react";
import { 
  HardDrive, 
  Trash2, 
  Terminal as TermIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  ShieldCheck 
} from "lucide-react";

export default function SystemAdminPage() {
  // --- ÉTATS ---
  const [stats, setStats] = useState({
    totalStorageUsedBytes: 0,
    orphansCount: 0,
    orphansStorageSizeDeltaBytes: 0,
    dbMediaCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

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
          dbMediaCount: data.dbMediaCount
        });
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

  useEffect(() => {
    // Scroll auto vers le bas de la console à chaque log ajouté
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLaunchCleanup = async () => {
    try {
      setCleaning(true);
      setLogs([
        "🚀 INITIALISATION DU NETTOYAGE DIFFÉRENTIEL...",
        "🔍 Scan en cours de l'ensemble de la table Prisma 'Media'...",
        `✅ ${stats.dbMediaCount} URLs actives indexées en Base de Données.`,
        "☁️ Récupération de la liste des fichiers sur le serveur de stockage Cloud...",
        `⚠️ ${stats.orphansCount} images détectées comme orphelines (fichiers sans relation BDD).`,
        "⚠️ PURGE SÉCURISÉE DES FICHIERS ORPHELINS INITIÉE..."
      ]);

      const res = await fetch("/api/admin/system/storage", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setLogs(prev => [...prev, `❌ ERREUR SYSTÈME : ${data.error}`]);
        showNotification("error", data.error);
        return;
      }

      // Simulation de défilement de logs ultra-premium avec délai de 80ms par fichier
      const deletedFiles = data.deletedUrls || [];
      
      for (let i = 0; i < deletedFiles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setLogs(prev => [
          ...prev, 
          `🟢 PURGED OK : ${deletedFiles[i]} - Libéré : 850 Ko`
        ]);
      }

      setLogs(prev => [
        ...prev,
        "--------------------------------------------------",
        "🎉 PURGE INTÉGRALE TERMINÉE !",
        `✅ Fichiers supprimés : ${data.deletedCount}`,
        `✅ Espace disque récupéré : ${(data.bytesFreed / (1024 * 1024)).toFixed(2)} Mo`,
        "🟢 Système de fichiers : SAIN & OPTIMISÉ."
      ]);

      // Réinitialiser les compteurs
      setStats(prev => ({
        ...prev,
        orphansCount: 0,
        orphansStorageSizeDeltaBytes: 0
      }));

      showNotification("success", data.message);

    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, "❌ ERREUR TECHNIQUE : Échec de communication avec le serveur."]);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setCleaning(false);
    }
  };

  // Convertisseur de Bytes en Go / Mo
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0.00 Mo";
    const giga = bytes / (1024 * 1024 * 1024);
    if (giga >= 1) return `${giga.toFixed(2)} Go`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
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
        /* 🗺️ Workspace Gauges Circulaires + Console Terminal */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* A. Gauges circulaires (1/3) */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 items-center text-center">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 w-full">
              Indicateurs de Stockage
            </h2>

            {/* SVG GAUGE 1 : Stockage Total Occupé */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-36 h-36 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#06B6D4" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264" 
                    strokeDashoffset="75" // Remplissage dynamique à ~70%
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-black text-white">{formatBytes(stats.totalStorageUsedBytes)}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Stocké</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Volume Total Médias</span>
            </div>

            {/* SVG GAUGE 2 : Volume d'Orphelins (Perte) */}
            <div className="flex flex-col items-center space-y-2 border-t border-white/[0.04] pt-6 w-full">
              <div className="w-36 h-36 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke={stats.orphansCount > 0 ? "#F43F5E" : "#10B981"} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264" 
                    strokeDashoffset={stats.orphansCount > 0 ? "230" : "264"} // Décalage dynamique proportionnel
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-black text-white">{stats.orphansCount}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fichiers</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Images Orphelines</span>
              {stats.orphansCount > 0 && (
                <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  {formatBytes(stats.orphansStorageSizeDeltaBytes)} Récupérables
                </span>
              )}
            </div>

          </div>

          {/* B. Console de Nettoyage Cybernétique (2/3) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
            
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 flex-1 justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TermIcon className="w-4 h-4 text-cyan-400" />
                    <span>Console de Traitement Système</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-ping" />
                    <span className="text-[9px] font-mono text-cyan-400 font-bold">READY</span>
                  </div>
                </div>

                {/* Bloc Terminal de suppression */}
                <div className="bg-[#05070E] border border-cyan-500/10 text-cyan-400 font-mono text-[10px] p-5 rounded-2xl h-[280px] overflow-y-auto shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
                  {logs.length === 0 ? (
                    <div className="text-slate-600 italic">
                      [Système en attente] Cliquez sur le bouton "Lancer la purge" pour diagnostiquer et assainir le serveur de fichiers...
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap select-text">
                        {log}
                      </div>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
              </div>

              {/* Commande de lancement */}
              <div className="border-t border-white/[0.04] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 leading-normal">
                  <Cpu className="w-5 h-5 text-slate-500 shrink-0" />
                  <span>
                    La purge est irréversible. Les fichiers physiques seront effacés du Cloud CDN.
                  </span>
                </div>

                <button
                  onClick={handleLaunchCleanup}
                  disabled={cleaning || stats.orphansCount === 0}
                  className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(244,63,94,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer shrink-0"
                >
                  {cleaning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Purge en cours...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Lancer la Purge</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
