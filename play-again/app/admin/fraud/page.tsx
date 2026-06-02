"use client";

import { useEffect, useState } from "react";
import { 
  Skull, 
  Activity, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  Phone, 
  Network, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface SuspectUser {
  id: number;
  email: string;
  username: string | null;
  is_active: boolean;
}

interface IpCorrelation {
  ipAddress: string;
  users: SuspectUser[];
}

interface StripeCorrelation {
  stripeConnectId: string;
  users: SuspectUser[];
}

interface PhoneCorrelation {
  phone: string;
  users: SuspectUser[];
}

interface CorrelationsData {
  ipCollisions: IpCorrelation[];
  stripeCollisions: StripeCorrelation[];
  phoneCollisions: PhoneCorrelation[];
}

export default function FraudDashboard() {
  const [data, setData] = useState<CorrelationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Onglet actif : "stripe", "ip", "phone"
  const [activeTab, setActiveTab] = useState<"stripe" | "ip" | "phone">("stripe");
  
  // Sélection des utilisateurs pour le Mass-Block
  const [selectedUsers, setSelectedUsers] = useState<Record<number, boolean>>({});
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Charger les données de corrélation
  const fetchCorrelations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/fraud/correlations");
      if (!res.ok) {
        throw new Error(`Erreur lors de la récupération : ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de charger les données de corrélation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelations();
  }, []);

  // Gérer la sélection des utilisateurs
  const toggleSelectUser = (id: number) => {
    setSelectedUsers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Sélectionner tout un groupe de corrélation
  const selectGroup = (users: SuspectUser[]) => {
    const nextSelection = { ...selectedUsers };
    const allSelected = users.every(u => nextSelection[u.id]);
    
    users.forEach(u => {
      nextSelection[u.id] = !allSelected;
    });
    
    setSelectedUsers(nextSelection);
  };

  // Déclencher le Mass-Block
  const handleMassBlock = async () => {
    const idsToBlock = Object.entries(selectedUsers)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => parseInt(id));

    if (idsToBlock.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir suspendre définitivement ces ${idsToBlock.length} utilisateurs ainsi que toutes leurs annonces actives ?`)) {
      return;
    }

    try {
      setIsBlocking(true);
      setBlockMessage(null);

      const res = await fetch("/api/admin/fraud/mass-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: idsToBlock,
          reason: blockReason || undefined
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Une erreur est survenue.");
      }

      setBlockMessage({ success: true, text: json.message });
      setBlockReason("");
      setSelectedUsers({});
      
      // Recharger les données fraîches de corrélation
      fetchCorrelations();
    } catch (err: any) {
      setBlockMessage({ success: false, text: err.message || "Erreur de traitement." });
    } finally {
      setIsBlocking(false);
    }
  };

  const getSelectedCount = () => {
    return Object.values(selectedUsers).filter(Boolean).length;
  };

  // Liste active en fonction de l'onglet
  const getActiveList = () => {
    if (!data) return [];
    if (activeTab === "stripe") return data.stripeCollisions;
    if (activeTab === "ip") return data.ipCollisions;
    return data.phoneCollisions;
  };

  return (
    <div className="flex-1 flex flex-col gap-8 min-h-screen">
      
      {/* 🚀 En-tête de page Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
              <Skull className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Détection de Fraude & Corrélations
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Analyse en direct des liaisons multi-comptes par IP, Stripe Connect ID, et téléphone.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton recharger */}
        <button 
          onClick={fetchCorrelations}
          className="px-4 py-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all rounded-xl flex items-center gap-2"
        >
          <Activity className="w-3.5 h-3.5" />
          Actualiser les données
        </button>
      </div>

      {loading ? (
        // 🌀 Skeletons de chargement
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse" />
            <div className="h-96 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse" />
          </div>
          <div className="h-[500px] bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse" />
        </div>
      ) : error ? (
        // ⚠️ Message d'erreur
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Une erreur est survenue</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchCorrelations}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= CÔTÉ GAUCHE : VISUALISATEUR ET LIAISONS ================= */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 🌐 Interactive Fraud Graph Canvas (SVG) */}
            <div className="bg-[#070A13] border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              {/* Radar Cyber Grid */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Fraud Network Visualizer
                  </span>
                </div>
                <span className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                  Radar Actif
                </span>
              </div>

              {/* Rendu dynamique du graphe SVG */}
              <div className="h-64 flex items-center justify-center relative z-10 bg-black/40 rounded-2xl border border-white/[0.04]">
                {getActiveList().length === 0 ? (
                  <div className="text-center p-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                    <p className="text-slate-400 text-xs font-semibold">
                      Aucune liaison suspecte identifiée pour cet onglet.
                    </p>
                  </div>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 600 300">
                    {/* Dessiner les lignes de liaison */}
                    {getActiveList().slice(0, 3).map((group, groupIdx) => {
                      const centerX = 150 + groupIdx * 150;
                      const centerY = 150;
                      return group.users.map((_, idx) => {
                        const angle = (idx * 2 * Math.PI) / group.users.length;
                        const targetX = centerX + Math.cos(angle) * 60;
                        const targetY = centerY + Math.sin(angle) * 60;
                        
                        return (
                          <line
                            key={`line-${groupIdx}-${idx}`}
                            x1={centerX}
                            y1={centerY}
                            x2={targetX}
                            y2={targetY}
                            stroke="#EF4444"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                            className="animate-[pulse_2s_infinite]"
                          />
                        );
                      });
                    })}

                    {/* Dessiner les nœuds */}
                    {getActiveList().slice(0, 3).map((group, groupIdx) => {
                      const centerX = 150 + groupIdx * 150;
                      const centerY = 150;
                      
                      return (
                        <g key={`nodes-${groupIdx}`}>
                          {/* Nœud central (IP, Stripe ou Téléphone) */}
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r="12"
                            fill="#1E293B"
                            stroke="#635BFF"
                            strokeWidth="2"
                            className="shadow-2xl"
                          />
                          <text
                            x={centerX}
                            y={centerY + 4}
                            fill="#fff"
                            fontSize="8"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            C
                          </text>

                          {/* Nœuds satellites (Utilisateurs) */}
                          {group.users.map((user, idx) => {
                            const angle = (idx * 2 * Math.PI) / group.users.length;
                            const targetX = centerX + Math.cos(angle) * 60;
                            const targetY = centerY + Math.sin(angle) * 60;
                            
                            return (
                              <g key={`node-${groupIdx}-${idx}`}>
                                <circle
                                  cx={targetX}
                                  cy={targetY}
                                  r="9"
                                  fill={user.is_active ? "#1A0B0E" : "#27272A"}
                                  stroke={user.is_active ? "#EF4444" : "#52525B"}
                                  strokeWidth="2"
                                  style={{
                                    filter: user.is_active ? "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.6))" : "none"
                                  }}
                                />
                                <text
                                  x={targetX}
                                  y={targetY + 3}
                                  fill="#fff"
                                  fontSize="7"
                                  textAnchor="middle"
                                >
                                  U
                                </text>
                                <text
                                  x={targetX}
                                  y={targetY + 22}
                                  fill="#94A3B8"
                                  fontSize="7"
                                  textAnchor="middle"
                                  fontWeight="semibold"
                                >
                                  ID: {user.id}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* 🗂️ Système d'onglets de corrélation */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-xl flex flex-col gap-6">
              
              <div className="flex border-b border-white/[0.06] p-1 bg-black/40 rounded-xl max-w-md">
                <button
                  onClick={() => setActiveTab("stripe")}
                  className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 ${
                    activeTab === "stripe"
                      ? "bg-[#635BFF] text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Stripe Connected
                  {data && data.stripeCollisions.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">
                      {data.stripeCollisions.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab("ip")}
                  className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 ${
                    activeTab === "ip"
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Adresse IP
                  {data && data.ipCollisions.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">
                      {data.ipCollisions.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("phone")}
                  className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg flex items-center justify-center gap-2 ${
                    activeTab === "phone"
                      ? "bg-amber-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Téléphone
                  {data && data.phoneCollisions.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full">
                      {data.phoneCollisions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Liste des collisions détectées */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {getActiveList().length === 0 ? (
                  <div className="text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
                    <h3 className="text-sm font-bold text-white mb-1">Aucune collision détectée</h3>
                    <p className="text-slate-500 text-xs">
                      Félicitations, aucun réseau frauduleux n'a pu être identifié pour ce critère.
                    </p>
                  </div>
                ) : (
                  getActiveList().map((group: any, idx: number) => {
                    const identifier = group.stripeConnectId || group.ipAddress || group.phone;
                    return (
                      <div 
                        key={`${activeTab}-${idx}`}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 hover:border-white/[0.08] transition-all flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-300 font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.04]">
                              {identifier}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                              {group.users.length} comptes liés
                            </span>
                          </div>
                          
                          <button
                            onClick={() => selectGroup(group.users)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white transition-all underline"
                          >
                            Tout sélectionner
                          </button>
                        </div>

                        {/* Comptes impliqués */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.users.map((user: SuspectUser) => (
                            <div 
                              key={user.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                selectedUsers[user.id]
                                  ? "bg-red-500/5 border-red-500/30"
                                  : "bg-black/30 border-white/[0.04]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={!!selectedUsers[user.id]}
                                  onChange={() => toggleSelectUser(user.id)}
                                  className="w-3.5 h-3.5 rounded border-white/20 bg-black/60 text-red-500 focus:ring-red-500"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">
                                    {user.username || "Sans nom"}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    ID: {user.id} • {user.email}
                                  </span>
                                </div>
                              </div>

                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                user.is_active
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                              }`}>
                                {user.is_active ? "ACTIF" : "BANNIT"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* ================= CÔTÉ DROIT : BOÎTE D'ACTION DE MASS-BLOCK ================= */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-[#0E1322] border border-white/[0.06] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6 sticky top-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />
              
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 relative z-10">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Centre de Neutralisation
                </h3>
              </div>

              {/* Résumé de sélection */}
              <div className="bg-black/40 border border-white/[0.04] p-4 rounded-2xl relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Comptes sélectionnés :
                  </span>
                </div>
                <span className="text-sm font-black text-red-400 bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20">
                  {getSelectedCount()}
                </span>
              </div>

              {/* Formulaire de Mass-Block */}
              <div className="flex flex-col gap-4 relative z-10">
                <label className="text-xs font-bold text-slate-400">
                  Raison ou motif officiel de suspension :
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="ex: Réseau multi-comptes frauduleux identifié pour tentative de manipulation ou contournement de KYC..."
                  className="w-full h-24 bg-black/60 border border-white/[0.08] text-white rounded-xl p-3 text-xs placeholder:text-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all resize-none font-sans"
                />

                {blockMessage && (
                  <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
                    blockMessage.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {blockMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span className="font-semibold">{blockMessage.text}</span>
                  </div>
                )}

                <button
                  onClick={handleMassBlock}
                  disabled={getSelectedCount() === 0 || isBlocking}
                  className={`w-full py-3.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 border ${
                    getSelectedCount() === 0 || isBlocking
                      ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 border-red-400/20 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.35)] active:scale-98"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {isBlocking ? "Blocage en cours..." : "Suspendre la sélection"}
                </button>
              </div>

              {/* Instructions de sécurité */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative z-10 text-[10px] text-slate-500 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  Rappel d'action administrative :
                </div>
                <p>
                  Cette action effectuera un **Soft-Delete** de chaque compte et suspendra immédiatement toutes leurs annonces actives en cours pour éviter de corrompre l'historique des transactions passées.
                </p>
                <p>
                  Chaque de désactivation administrative sera journalisée de manière permanente dans la table d'audit `AdminLog` sous votre signature.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
