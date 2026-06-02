"use client";

import { useState, useEffect } from "react";
import { 
  Sliders, 
  History, 
  Sparkles, 
  Euro, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Percent,
  User,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  Info
} from "lucide-react";

interface FinanceConfig {
  commissionRate: number;
  flatFee: number;
}

interface AdminLog {
  id: number;
  adminEmail: string;
  createdAt: string;
  metadata: any;
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

  // Équipement simulateur
  const [simulatorPrice, setSimulatorPrice] = useState<number>(100);
  const [simulatorShipping, setSimulatorShipping] = useState<boolean>(true);
  const [activeTooltip, setActiveTooltip] = useState<"commission" | "flatFee" | null>(null);

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

  // --- Fermeture des tooltips d'informations au clic n'importe où ailleurs ---
  useEffect(() => {
    if (!activeTooltip) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ferme le tooltip si le clic est en dehors du conteneur d'information info-tooltip-container
      if (!target.closest(".info-tooltip-container")) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [activeTooltip]);

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
          flatFee
        })
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

  // --- CALCULS DU SIMULATEUR ---
  const priceInCents = Math.round(simulatorPrice * 100);
  // Formule : Frais fixe + commissionRate%
  const commissionInCents = Math.round((flatFee * 100) + priceInCents * (commissionRate / 100));
  const commissionVal = commissionInCents / 100;
  
  // Livraison : 4.99€ standard, offerte si article > 100€
  const shippingFeeVal = simulatorShipping 
    ? (simulatorPrice > 100 ? 0 : 4.99)
    : 0;

  const totalPaidVal = simulatorPrice + commissionVal + shippingFeeVal;

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      
      {/* 🔔 Toast notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sliders className="w-8 h-8 text-emerald-400" />
            Configuration des Commissions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez les taux de commission, les frais de transaction fixes de la plateforme et simulez l'impact financier en temps réel.
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
          
          {/* ================= GAUCHE : FORMULAIRE DE RÉGLAGES (5/12) ================= */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl relative">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent" />
            
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.06] pb-4">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Règles de Frais de Plateforme</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              
              {/* Variable 1 : Pourcentage de commission */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="relative group/info info-tooltip-container">
                    <label 
                      onClick={() => setActiveTooltip(activeTooltip === "commission" ? null : "commission")}
                      className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-help hover:text-white transition-colors"
                    >
                      <Percent className="w-3.5 h-3.5 text-slate-500" />
                      <span>Commission Variable (%)</span>
                      <Info className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 transition-colors" />
                    </label>

                    {/* Bulle d'information Commission Variable */}
                    <div className={`absolute left-0 bottom-full mb-2 w-64 bg-[#0E1322]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl text-[10px] text-slate-300 font-medium leading-relaxed backdrop-blur-xl z-20 transition-all duration-200 ${
                      activeTooltip === "commission" 
                        ? "block opacity-100 translate-y-0" 
                        : "hidden group-hover/info:block opacity-0 group-hover/info:opacity-100 group-hover/info:translate-y-0"
                    }`}>
                      <span className="font-extrabold text-white block mb-1 text-xs">Commission Variable</span>
                      Prélèvement proportionnel appliqué sur le prix de l'article pour couvrir les frais de fonctionnement de la plateforme, le service d'intermédiation sécurisée et le support technique.
                    </div>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {commissionRate.toFixed(1)} %
                  </span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                    className="appearance-none h-1.5 w-full bg-white/10 rounded-lg cursor-pointer accent-[#10B981] hover:accent-[#059669] transition-all"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
                    <span>0% (Frais offerts)</span>
                    <span>10%</span>
                    <span>20% (Max)</span>
                  </div>
                </div>
              </div>

              {/* Variable 2 : Frais fixes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="relative group/info info-tooltip-container">
                    <label 
                      onClick={() => setActiveTooltip(activeTooltip === "flatFee" ? null : "flatFee")}
                      className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-help hover:text-white transition-colors"
                    >
                      <Euro className="w-3.5 h-3.5 text-slate-500" />
                      <span>Frais Fixes de Traitement (€)</span>
                      <Info className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 transition-colors" />
                    </label>

                    {/* Bulle d'information Frais Fixes */}
                    <div className={`absolute left-0 bottom-full mb-2 w-64 bg-[#0E1322]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl text-[10px] text-slate-300 font-medium leading-relaxed backdrop-blur-xl z-20 transition-all duration-200 ${
                      activeTooltip === "flatFee" 
                        ? "block opacity-100 translate-y-0" 
                        : "hidden group-hover/info:block opacity-0 group-hover/info:opacity-100 group-hover/info:translate-y-0"
                    }`}>
                      <span className="font-extrabold text-white block mb-1 text-xs">Frais Fixes de Traitement</span>
                      Montant forfaitaire appliqué sur chaque transaction pour couvrir les frais de transaction Stripe, la sécurisation des fonds sous séquestre (escrow) et le coût du protocole 3D Secure.
                    </div>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {flatFee.toFixed(2)} €
                  </span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.00"
                    max="5.00"
                    step="0.10"
                    value={flatFee}
                    onChange={(e) => setFlatFee(parseFloat(e.target.value))}
                    className="appearance-none h-1.5 w-full bg-white/10 rounded-lg cursor-pointer accent-[#10B981] hover:accent-[#059669] transition-all"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold">
                    <span>0.00 €</span>
                    <span>2.50 €</span>
                    <span>5.00 € (Max)</span>
                  </div>
                </div>
              </div>

              {/* Avertissement de modifications */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 text-amber-400/90 leading-relaxed font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-300 block mb-1">Impact sur la Production</span>
                  Tout changement sera appliqué **instantanément** sur les futures factures d'achats initiées par les utilisateurs. Les transactions déjà finalisées ne seront pas affectées.
                </div>
              </div>

              {/* Enregistrer les modifications */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-[#10B981] to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-wider text-xs py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <Save className="w-4 h-4 text-black" />
                    <span>Appliquer la configuration</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* ================= DROITE : SIMULATEUR DE VENTE INTERACTIF (7/12) ================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* A. Le Pricing Simulator */}
            <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02)_0%,transparent_65%)]" />
              <div className="absolute top-4 right-4 w-40 h-40 bg-[#10B981]/5 rounded-full filter blur-2xl -z-10" />

              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Simulateur de Tarification (Impact Réel)</span>
                </h3>
                
                {/* Mode Expédition Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Expédition</span>
                  <button
                    onClick={() => setSimulatorShipping(!simulatorShipping)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      simulatorShipping ? "bg-[#10B981]" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        simulatorShipping ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 📊 Visualisation du Split Financier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* 1. Ce que paye l'Acheteur */}
                <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">L'Acheteur paie</span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1 pt-1.5 pb-1.5">
                      {totalPaidVal.toFixed(2)} €
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-400 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Article :</span>
                      <span className="font-bold text-white">{simulatorPrice.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Port ({simulatorShipping ? "Colis" : "Main propre"}) :</span>
                      <span className="font-bold text-slate-300">
                        {shippingFeeVal === 0 ? "Offert" : `${shippingFeeVal.toFixed(2)} €`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Ce que perçoit PlayAgain */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Coins className="w-12 h-12 text-[#10B981]" />
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
                      PlayAgain Perçoit
                    </span>
                    <h4 className="text-2xl font-extrabold font-mono mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#10B981] drop-shadow-[0_0_15px_rgba(16,185,129,0.1)] pt-1.5 pb-1.5">
                      {commissionVal.toFixed(2)} €
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-500/10 text-[10px] text-emerald-400/80 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Frais fixes ({flatFee.toFixed(2)}€) :</span>
                      <span className="font-bold text-white">{flatFee.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux variable ({commissionRate}%) :</span>
                      <span className="font-bold text-white">
                        {((simulatorPrice * commissionRate) / 100).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Ce que reçoit le Vendeur (Input direct d'édition du Prix de vente) */}
                <div className="bg-white/[0.01] border border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div>
                    <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-1">
                      Prix de l'Article (Vendeur Net)
                    </span>
                    <div className="flex items-center gap-2 bg-black/40 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 focus-within:border-cyan-400 focus-within:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all mt-1">
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={simulatorPrice || ""}
                        onChange={(e) => setSimulatorPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="bg-transparent w-full text-right text-base font-mono font-black text-cyan-300 focus:outline-none"
                        placeholder="0"
                      />
                      <span className="text-cyan-400 font-black text-sm font-mono shrink-0">€</span>
                    </div>
                    <span className="text-[8px] text-slate-500 font-bold block mt-1.5 text-right animate-pulse">
                      * Saisissez le prix d'essai ici ✎
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-slate-400 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Net perçu :</span>
                      <span className="font-bold text-white">{simulatorPrice.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-cyan-400/80">
                      <span>Stripe Connect :</span>
                      <span className="font-bold">Automatique</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Comparatif et indicateur d'adéquation */}
              <div className="bg-white/[0.01] border border-white/[0.03] p-4.5 rounded-2xl text-[11px] text-slate-400 space-y-2.5">
                <span className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Performance commerciale et équilibre
                </span>
                <p className="leading-relaxed">
                  Sur un panier moyen d'équipement de seconde main de <span className="text-white font-bold">{simulatorPrice} €</span>, 
                  le taux d'apport de revenus de la commission s'élève à <span className="text-emerald-400 font-bold">{((commissionVal / simulatorPrice) * 100).toFixed(1)}%</span> du prix de vente.
                  Cette marge permet d'assurer la solvabilité de l'assurance Escrow de Stripe tout en restant très compétitive face aux concurrents généralistes (ex: Vinted, Leboncoin).
                </p>
              </div>

            </div>

            {/* B. Historique des modifications (Version History) */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/[0.06] pb-4">
                <History className="w-4 h-4 text-slate-400" />
                <span>Historique d'Audit & Changements de Taux</span>
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-semibold text-xs">
                  Aucun changement de configuration enregistré à ce jour.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {history.map((log) => {
                    const meta = log.metadata as any;
                    return (
                      <div key={log.id} className="flex items-center justify-between p-3.5 bg-black/30 border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-extrabold text-white truncate max-w-[180px] md:max-w-none">{log.adminEmail}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(log.createdAt).toLocaleString("fr-FR")}
                            </p>
                          </div>
                        </div>

                        {meta && (
                          <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                            <div className="flex flex-col text-right">
                              <span className="text-[#10B981] font-bold">%{meta.commissionRate}</span>
                              <span className="text-slate-400">+{meta.flatFee}€</span>
                            </div>
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
