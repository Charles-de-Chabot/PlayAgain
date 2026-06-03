"use client";

import { useEffect, useState } from "react";
import { Skull, Activity, AlertCircle } from "lucide-react";
import FraudNetworkVisualizer from "./components/FraudNetworkVisualizer";
import FraudCollisionList from "./components/FraudCollisionList";
import MassBlockPanel from "./components/MassBlockPanel";

export interface SuspectUser {
  id: number;
  email: string;
  username: string | null;
  is_active: boolean;
}

export interface IpCorrelation {
  ipAddress: string;
  users: SuspectUser[];
}

export interface StripeCorrelation {
  stripeConnectId: string;
  users: SuspectUser[];
}

export interface PhoneCorrelation {
  phone: string;
  users: SuspectUser[];
}

export interface CorrelationsData {
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
    setSelectedUsers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sélectionner tout un groupe de corrélation
  const selectGroup = (users: SuspectUser[]) => {
    const nextSelection = { ...selectedUsers };
    const allSelected = users.every((u) => nextSelection[u.id]);

    users.forEach((u) => {
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

    if (
      !confirm(
        `Êtes-vous sûr de vouloir suspendre définitivement ces ${idsToBlock.length} utilisateurs ainsi que toutes leurs annonces actives ?`
      )
    ) {
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
          reason: blockReason || undefined,
        }),
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
    <div className="flex-1 flex flex-col gap-8 min-h-screen text-left">
      {/* 🚀 En-tête de page Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
              <Skull className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Détection de Fraude & Corrélations</h1>
              <p className="text-slate-400 text-xs mt-1">
                Analyse en direct des liaisons multi-comptes par IP, Stripe Connect ID, et téléphone.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton recharger */}
        <button
          onClick={fetchCorrelations}
          className="px-4 py-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all rounded-xl flex items-center gap-2 cursor-pointer"
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
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CÔTÉ GAUCHE : VISUALISATEUR ET LIAISONS */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <FraudNetworkVisualizer activeList={getActiveList()} />

            <FraudCollisionList
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stripeCollisionsCount={data ? data.stripeCollisions.length : 0}
              ipCollisionsCount={data ? data.ipCollisions.length : 0}
              phoneCollisionsCount={data ? data.phoneCollisions.length : 0}
              activeList={getActiveList()}
              selectedUsers={selectedUsers}
              toggleSelectUser={toggleSelectUser}
              selectGroup={selectGroup}
            />
          </div>

          {/* CÔTÉ DROIT : BOÎTE D'ACTION DE MASS-BLOCK */}
          <MassBlockPanel
            selectedCount={getSelectedCount()}
            blockReason={blockReason}
            setBlockReason={setBlockReason}
            blockMessage={blockMessage}
            isBlocking={isBlocking}
            onMassBlock={handleMassBlock}
          />
        </div>
      )}
    </div>
  );
}
