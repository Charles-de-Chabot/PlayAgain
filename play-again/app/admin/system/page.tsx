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
  ShieldCheck,
  Check
} from "lucide-react";

// Résout l'usage estimé d'une image d'après son dossier d'upload pour guider l'admin
const getOrphanPurpose = (url: string) => {
  if (url.includes("/uploads/products/")) {
    return {
      label: "Photo de Produit",
      desc: "Ancienne annonce de produit supprimée.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      folder: "products"
    };
  }
  if (url.includes("/uploads/profile/") || url.includes("/uploads/avatars/")) {
    return {
      label: "Avatar / Profil",
      desc: "Ancienne photo de profil utilisateur.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      folder: "profile"
    };
  }
  if (url.includes("/uploads/chat/")) {
    return {
      label: "Messagerie (Chat)",
      desc: "Pièce jointe de chat supprimée.",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      folder: "chat"
    };
  }
  if (url.includes("/uploads/verifications/")) {
    return {
      label: "Vérification (ID)",
      desc: "Pièce d'identité ou selfie de certification.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      folder: "verifications"
    };
  }
  return {
    label: "Fichier Système",
    desc: "Fichier orphelin non classifié.",
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    folder: "uploads"
  };
};

export default function SystemAdminPage() {
  // --- ÉTATS ---
  const [stats, setStats] = useState({
    totalStorageUsedBytes: 0,
    orphansCount: 0,
    orphansStorageSizeDeltaBytes: 0,
    dbMediaCount: 0
  });
  const [orphans, setOrphans] = useState<{ url: string; size: number }[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
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

  const toggleSelectOrphan = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
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
        "⚠️ PURGE SÉCURISÉE DES FICHIERS ORPHELINS INITIÉE..."
      ]);

      const res = await fetch("/api/admin/system/storage", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ urls: selectedUrls })
      });
      const data = await res.json();

      if (data.error) {
        setLogs(prev => [...prev, `❌ ERREUR SYSTÈME : ${data.error}`]);
        showNotification("error", data.error);
        return;
      }

      // Défilement de logs réel avec les tailles exactes
      const deletedFiles = data.deletedUrls || [];
      
      for (let i = 0; i < deletedFiles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 80));
        const fileInfo = orphans.find(o => o.url === deletedFiles[i]);
        const sizeStr = fileInfo ? formatBytes(fileInfo.size) : "Inconnu";
        setLogs(prev => [
          ...prev, 
          `🟢 PURGED OK : ${deletedFiles[i]} - Libéré : ${sizeStr}`
        ]);
      }

      setLogs(prev => [
        ...prev,
        "--------------------------------------------------",
        "🎉 PURGE CIBLÉE TERMINÉE AVEC SUCCÈS !",
        `✅ Fichiers supprimés de votre machine : ${data.deletedCount}`,
        `✅ Espace disque libéré : ${(data.bytesFreed / (1024 * 1024)).toFixed(2)} Mo`,
        "🟢 Système de fichiers : SAIN & OPTIMISÉ."
      ]);

      // Re-charger les statistiques réelles
      await fetchStats();
      setSelectedUrls([]);

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
        <div className="flex flex-col space-y-8">
          
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
                        [Système en attente] Cochez les fichiers et cliquez sur "Lancer la purge" pour les supprimer du serveur...
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
                    disabled={cleaning || selectedUrls.length === 0}
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
                        <span>Lancer la Purge ({selectedUrls.length})</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* 🖼️ Section d'Aperçu des images orphelines */}
          {orphans.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>Aperçu des Fichiers Orphelins ({orphans.length})</span>
                </h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => {
                      if (selectedUrls.length === orphans.length) {
                        setSelectedUrls([]);
                      } else {
                        setSelectedUrls(orphans.map(o => o.url));
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none"
                  >
                    {selectedUrls.length === orphans.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                    {formatBytes(orphans.filter(o => selectedUrls.includes(o.url)).reduce((sum, o) => sum + o.size, 0))} Récupérables
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent">
                {orphans.map((orphan, i) => {
                  const isImage = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(orphan.url);
                  const isSelected = selectedUrls.includes(orphan.url);
                  const purpose = getOrphanPurpose(orphan.url);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleSelectOrphan(orphan.url)}
                      className={`relative p-2.5 flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300 rounded-2xl cursor-pointer select-none overflow-hidden border ${
                        isSelected 
                          ? 'border-rose-500/50 bg-rose-500/[0.04] shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20' 
                          : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* Badge de sélection circulaire */}
                      <div className={`absolute top-2.5 right-2.5 z-10 w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-rose-500 border-rose-400 text-white shadow' 
                          : 'bg-black/60 border-white/20 text-transparent'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </div>

                      <div className="w-full aspect-square rounded-lg bg-black/45 border border-white/[0.05] overflow-hidden flex items-center justify-center relative shadow-inner">
                        {isImage ? (
                          <img 
                            src={orphan.url} 
                            alt="Orphelin" 
                            className={`w-full h-full object-cover transition-all duration-300 ${
                              isSelected ? 'scale-102' : 'group-hover:scale-105'
                            }`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        
                        <div className={`fallback ${isImage ? 'hidden' : ''} text-slate-600 flex flex-col items-center justify-center`}>
                          <HardDrive className={`w-6 h-6 transition-colors ${isSelected ? 'text-rose-400' : 'group-hover:text-rose-400'}`} />
                        </div>

                        {/* Overlay d'information Hover ultra-détaillé */}
                        <div className="absolute inset-0 bg-black/92 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center gap-1.5 backdrop-blur-[2px] select-none">
                          <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${purpose.color}`}>
                            {purpose.label}
                          </span>
                          <span className="text-[7.5px] font-medium text-slate-300 leading-tight">
                            {purpose.desc}
                          </span>
                          <div className="text-[6.5px] font-mono text-slate-500 border-t border-white/[0.08] pt-1 mt-1 w-full break-all">
                            Dossier: <span className="text-slate-300 font-bold">{purpose.folder}/</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full flex flex-col min-w-0">
                        <span className={`text-[9px] font-mono truncate w-full transition-colors ${
                          isSelected ? 'text-rose-200 font-semibold' : 'text-slate-400 group-hover:text-white'
                        }`}>
                          {orphan.url.split('/').pop()}
                        </span>
                        <span className={`text-[8px] font-bold ${
                          isSelected ? 'text-rose-400' : 'text-slate-500'
                        }`}>
                          {formatBytes(orphan.size)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
