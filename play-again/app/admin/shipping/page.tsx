"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  X, 
  Truck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Loader2,
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  ArrowUpDown, 
  ChevronRight,
  Copy,
  Mail,
  Phone,
  RefreshCw,
  Send,
  AlertOctagon,
  Package,
  Edit2,
  Check
} from "lucide-react";

interface ShippingItem {
  invoiceId: number;
  invoiceDate: string;
  totalPrice: number;
  status: string;
  trackingNumber: string;
  carrier: string;
  carrierCode: string;
  carrierStatus: "LABEL_PRINTED_NOT_SHIPPED" | "BLOCKED_IN_HUB" | "LOST" | "IN_TRANSIT" | "DELIVERED" | "DISPUTED";
  carrierStatusLabel: string;
  daysSincePurchase: number;
  anomalySeverity: "NONE" | "WARNING" | "CRITICAL";
  product: {
    id: number;
    title: string;
    price: number;
  } | null;
  seller: {
    id: number;
    username: string | null;
    email: string;
    phone: string | null;
  } | null;
  buyer: {
    id: number;
    username: string | null;
    email: string;
    phone: string | null;
  } | null;
}

export default function ShippingSupervisionPage() {
  const [shippings, setShippings] = useState<ShippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCarrier, setFilterCarrier] = useState(""); // "", "MR", "CC"
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "NONE", "WARNING", "CRITICAL"
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedShipping, setSelectedShipping] = useState<ShippingItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pour l'édition manuelle dans le tiroir
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [newTracking, setNewTracking] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newInvoiceStatus, setNewInvoiceStatus] = useState("");

  const fetchShippings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (filterCarrier) queryParams.append("carrier", filterCarrier);
      if (filterStatus) queryParams.append("status", filterStatus);

      const res = await fetch(`/api/admin/shipping?${queryParams.toString()}`);
      const data = await res.json();
      if (data.shippings) {
        let sorted = [...data.shippings];
        if (sortBy === "date_desc") {
          sorted.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        } else if (sortBy === "date_asc") {
          sorted.sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
        } else if (sortBy === "delay_desc") {
          sorted.sort((a, b) => b.daysSincePurchase - a.daysSincePurchase);
        }
        setShippings(sorted);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger la supervision logistique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchShippings();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, filterCarrier, filterStatus, sortBy]);

  // Fermer les menus si clic en dehors
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("success", "Numéro de suivi copié !");
  };

  const handleShippingAction = async (invoiceId: number, action: "WARN_SELLER" | "POSTPONE_VALIDATION") => {
    try {
      setActionLoading(`${invoiceId}-${action}`);
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, invoiceId })
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      
      // Mettre à jour l'élément local si sélectionné
      if (selectedShipping?.invoiceId === invoiceId) {
        // Optionnel : on peut ajouter des indicateurs d'action effectuée
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique lors de l'exécution de l'action.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedShipping || !newTracking.trim()) return;
    try {
      setActionLoading("update-tracking");
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TRACKING",
          invoiceId: selectedShipping.invoiceId,
          metadata: { trackingNumber: newTracking }
        })
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setIsEditingTracking(false);
      
      // Actualiser les données locales
      setSelectedShipping({
        ...selectedShipping,
        trackingNumber: newTracking,
        carrier: newTracking.startsWith("MR-") ? "Mondial Relay" : "Colissimo",
        carrierCode: newTracking.startsWith("MR-") ? "MR" : "CC"
      });
      fetchShippings();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur lors de la mise à jour du suivi.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateInvoiceStatus = async () => {
    if (!selectedShipping || !newInvoiceStatus) return;
    try {
      setActionLoading("update-status");
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          invoiceId: selectedShipping.invoiceId,
          metadata: { status: newInvoiceStatus }
        })
      });
      const data = await res.json();

      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setIsEditingStatus(false);
      
      // Re-calculer les statuts logistiques pour le drawer
      let newCarrierStatus = selectedShipping.carrierStatus;
      let newCarrierLabel = selectedShipping.carrierStatusLabel;
      let newSeverity = selectedShipping.anomalySeverity;

      if (newInvoiceStatus === "DELIVERED" || newInvoiceStatus === "COMPLETED") {
        newCarrierStatus = "DELIVERED";
        newCarrierLabel = "Livré";
        newSeverity = "NONE";
      } else if (newInvoiceStatus === "SHIPPED") {
        newCarrierStatus = "IN_TRANSIT";
        newCarrierLabel = "En cours d'acheminement";
        newSeverity = "NONE";
      } else if (newInvoiceStatus === "PAID") {
        newCarrierStatus = "IN_TRANSIT";
        newCarrierLabel = "Prêt à être déposé";
        newSeverity = "NONE";
      }

      setSelectedShipping({
        ...selectedShipping,
        status: newInvoiceStatus,
        carrierStatus: newCarrierStatus,
        carrierStatusLabel: newCarrierLabel,
        anomalySeverity: newSeverity
      });
      fetchShippings();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur lors de la mise à jour de l'état.");
    } finally {
      setActionLoading(null);
    }
  };

  // KPIs
  const totalShippings = shippings.length;
  const lateDeposits = shippings.filter(s => s.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED").length;
  const blockedPackages = shippings.filter(s => s.carrierStatus === "BLOCKED_IN_HUB" || s.carrierStatus === "LOST").length;
  
  const mrPackages = shippings.filter(s => s.carrierCode === "MR").length;
  const ccPackages = shippings.filter(s => s.carrierCode === "CC").length;

  return (
    <div className="flex-1 flex flex-col space-y-8 relative pb-12">
      
      {/* 🔔 Notifications Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-400" />
            Supervision Logistique Active
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Auditez les commandes en transit. Résolvez les anomalies de colis en retard (orange) ou bloqués (rouge).
          </p>
        </div>
        <button 
          onClick={fetchShippings}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* 📊 Cartes KPI Glassmorphism Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : Total */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.05)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">En transit actif</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalShippings}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold">Colis suivis en temps réel</span>
          </div>
        </div>

        {/* KPI 2 : Retards dépôt */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-amber-500/30 hover:shadow-[0_0_25px_rgba(245,158,11,0.05)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retards de Dépôt</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-400">{lateDeposits}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold">Non déposés vendeur &gt; 5j</span>
          </div>
        </div>

        {/* KPI 3 : Bloqués ou perdus */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.08)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Colis Bloqués / Perdus</span>
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-red-400">{blockedPackages}</span>
            <span className="text-xs text-slate-500 block mt-1 font-semibold">Bloqués en hub routier &gt; 7j</span>
          </div>
        </div>

        {/* KPI 4 : Répartition */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,91,255,0.05)]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transporteurs</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-white">{mrPackages}</span>
              <span className="text-[9px] font-black text-pink-400 block tracking-wider">Mondial Relay</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-2xl font-black text-white">{ccPackages}</span>
              <span className="text-[9px] font-black text-amber-300 block tracking-wider">Colissimo</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🔍 Filtres administratifs complexes */}
      <div className="flex flex-col gap-4 p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-lg relative z-20">
        
        {/* Ligne 1 : Recherche & Tri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Recherche */}
          <div className="md:col-span-2 relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par numéro de suivi, e-mail, pseudo de membre, nom d'article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 transition-all font-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Tri */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "sortBy" ? null : "sortBy")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "sortBy" ? "border-brand-accent/50 text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {sortBy === "date_desc" && "Tri : Plus récent"}
                  {sortBy === "date_asc" && "Tri : Plus ancien"}
                  {sortBy === "delay_desc" && "Tri : Plus long retard"}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "sortBy" ? "rotate-90 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant Tri */}
            {activeDropdown === "sortBy" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "date_desc", label: "Date : Commande récente" },
                    { value: "date_asc", label: "Date : Commande ancienne" },
                    { value: "delay_desc", label: "Temps : Plus long transit" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        sortBy === option.value 
                          ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ligne 2 : Filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Filtre Gravité Anomalie */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "status" ? "border-brand-accent/50 text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterStatus === "ALL" && "Anomalies : Toutes les expéditions"}
                  {filterStatus === "NONE" && "Expéditions : En transit (Sans anomalies)"}
                  {filterStatus === "WARNING" && "Expéditions : Retards (Warning)"}
                  {filterStatus === "CRITICAL" && "Expéditions : Bloqués/Perdus (Critical)"}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "status" ? "rotate-90 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant Gravité */}
            {activeDropdown === "status" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "ALL", label: "Toutes les expéditions" },
                    { value: "NONE", label: "En transit (Sans anomalies)" },
                    { value: "WARNING", label: "Retards (Warning) - Non déposés" },
                    { value: "CRITICAL", label: "Bloqués / Perdus (Critical) - Hub" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        filterStatus === option.value 
                          ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {filterStatus === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtre Transporteur */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "carrier" ? null : "carrier")}
              className={`w-full flex items-center justify-between bg-black/40 border ${
                activeDropdown === "carrier" ? "border-brand-accent/50 text-white" : "border-white/10 text-slate-300 hover:border-white/20"
              } rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterCarrier === "" && "Transporteur : Tous"}
                  {filterCarrier === "MR" && "Mondial Relay uniquement"}
                  {filterCarrier === "CC" && "Colissimo uniquement"}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${activeDropdown === "carrier" ? "rotate-90 text-white" : ""}`} />
            </button>

            {/* Menu Déroulant Transporteur */}
            {activeDropdown === "carrier" && (
              <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0E1322]/95 border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xl">
                <div className="p-1 space-y-0.5">
                  {[
                    { value: "", label: "Tous" },
                    { value: "MR", label: "Mondial Relay" },
                    { value: "CC", label: "Colissimo" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterCarrier(option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg font-medium transition-all ${
                        filterCarrier === option.value 
                          ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" 
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {filterCarrier === option.value && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 📊 Cyber Tableau de transit actif */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Commande &amp; Article</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Expéditeur (Vendeur)</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destinataire (Acheteur)</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Transporteur &amp; Suivi</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">État Logistique</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">Actions Relance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold">Récupération des flux de transit...</span>
                    </div>
                  </td>
                </tr>
              ) : shippings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <span className="text-xs text-slate-500 font-bold">Aucune expédition logistique en anomalie détectée.</span>
                  </td>
                </tr>
              ) : (
                shippings.map((shipping) => (
                  <tr 
                    key={shipping.invoiceId} 
                    onClick={() => {
                      setSelectedShipping(shipping);
                      setNewTracking(shipping.trackingNumber);
                      setNewInvoiceStatus(shipping.status);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-white/[0.01] active:bg-white/[0.02] cursor-pointer transition-colors duration-200"
                  >
                    {/* Commande / Produit */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">
                          Cmd #{shipping.invoiceId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px] mt-0.5" title={shipping.product?.title || ""}>
                          {shipping.product?.title || "Article inconnu"}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500 font-bold">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(shipping.invoiceDate).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </td>

                    {/* Vendeur (Expéditeur) */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {shipping.seller?.username || "Sans pseudo"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {shipping.seller?.email}
                        </span>
                      </div>
                    </td>

                    {/* Acheteur (Destinataire) */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">
                          {shipping.buyer?.username || "Sans pseudo"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {shipping.buyer?.email}
                        </span>
                      </div>
                    </td>

                    {/* Transporteur & Suivi */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-block self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          shipping.carrierCode === "MR" 
                            ? "bg-pink-700/10 border-pink-700/20 text-pink-400 shadow-[0_0_8px_rgba(219,39,119,0.05)]" 
                            : shipping.carrierCode === "CC"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}>
                          {shipping.carrier || "À définir"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] font-mono font-bold ${
                            shipping.trackingNumber ? "text-slate-300" : "text-slate-500 italic"
                          }`}>
                            {shipping.trackingNumber || "Non renseigné"}
                          </span>
                          {shipping.trackingNumber && (
                            <button 
                              onClick={() => copyToClipboard(shipping.trackingNumber)}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-90 transition-all text-slate-400 hover:text-white"
                              title="Copier le n° de suivi"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* État Logistique */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          shipping.carrierStatus === "DELIVERED" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]" 
                            : shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : shipping.carrierStatus === "DISPUTED"
                            ? "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                            : "bg-red-500/15 border-red-500/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse"
                        }`}>
                          {shipping.carrierStatus === "DELIVERED" && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          {shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && <Clock className="w-3 h-3 text-amber-400" />}
                          {shipping.carrierStatus === "DISPUTED" && <AlertOctagon className="w-3 h-3 text-red-400" />}
                          {(shipping.carrierStatus === "BLOCKED_IN_HUB" || shipping.carrierStatus === "LOST") && <ShieldAlert className="w-3 h-3 text-red-400" />}
                          
                          <span>{shipping.carrierStatusLabel}</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold block">
                          Depuis {shipping.daysSincePurchase} jours
                        </span>
                      </div>
                    </td>

                    {/* Actions de Relance */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        {/* Avertir le vendeur */}
                        {shipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && (
                          <button
                            onClick={() => handleShippingAction(shipping.invoiceId, "WARN_SELLER")}
                            disabled={actionLoading === `${shipping.invoiceId}-WARN_SELLER`}
                            className="bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 border border-amber-500/20 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(245,158,11,0.15)] disabled:opacity-50"
                          >
                            {actionLoading === `${shipping.invoiceId}-WARN_SELLER` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Relancer vendeur</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Repousser validation */}
                        {(shipping.carrierStatus === "BLOCKED_IN_HUB" || shipping.carrierStatus === "LOST") && (
                          <button
                            onClick={() => handleShippingAction(shipping.invoiceId, "POSTPONE_VALIDATION")}
                            disabled={actionLoading === `${shipping.invoiceId}-POSTPONE_VALIDATION`}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-400 border border-cyan-500/20 font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] disabled:opacity-50"
                          >
                            {actionLoading === `${shipping.invoiceId}-POSTPONE_VALIDATION` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Repousser validation</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Sans action requise */}
                        {shipping.carrierStatus === "DELIVERED" && (
                          <span className="text-[10px] text-slate-500 font-semibold italic">
                            Aucune action requise
                          </span>
                        )}
                        
                        {shipping.carrierStatus === "IN_TRANSIT" && (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> Normal
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 VOLET D'INSPECTION DÉTAILLÉ (MODAL DRAWER) */}
      {isDrawerOpen && selectedShipping && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Overlay flouté */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Tiroir */}
          <div className="w-full max-w-lg bg-[#0C101D] border-l border-white/[0.08] h-full relative z-10 flex flex-col p-6 shadow-2xl justify-between overflow-y-auto custom-scrollbar">
            
            <div className="space-y-6">
              {/* En-tête Tiroir */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                    Diagnostic Colis #{selectedShipping.invoiceId}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Produit */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative overflow-hidden">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Article transité</span>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {selectedShipping.product?.title || "Produit inconnu"}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400 block mt-1">
                      Prix produit : {selectedShipping.product?.price} €
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Montant total</span>
                    <span className="text-sm font-black text-emerald-400">{selectedShipping.totalPrice} €</span>
                  </div>
                </div>
              </div>

              {/* Suivi et transporteur */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Suivi Transporteur</h4>
                
                <div className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-3">
                  
                  {/* Transporteur */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Transporteur officiel</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      selectedShipping.carrierCode === "MR" 
                        ? "bg-pink-700/10 border-pink-700/20 text-pink-400" 
                        : selectedShipping.carrierCode === "CC"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      {selectedShipping.carrier || "À définir"}
                    </span>
                  </div>

                  {/* Numéro de suivi éditable */}
                  <div className="flex justify-between items-center text-xs border-t border-white/[0.04] pt-3">
                    <span className="text-slate-400 font-bold">Numéro de suivi</span>
                    {isEditingTracking ? (
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="text"
                          value={newTracking}
                          onChange={(e) => setNewTracking(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          placeholder="Ex: MR-12345A ou CC-54321FR"
                        />
                        <button 
                          onClick={handleUpdateTracking}
                          disabled={actionLoading === "update-tracking"}
                          className="p-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setIsEditingTracking(false)}
                          className="p-1 rounded bg-white/5 border border-white/10 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono font-bold">
                        <span className={selectedShipping.trackingNumber ? "text-white" : "text-slate-500 italic"}>
                          {selectedShipping.trackingNumber || "Non renseigné"}
                        </span>
                        <button 
                          onClick={() => setIsEditingTracking(true)}
                          className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Statut de Facturation éditable */}
                  <div className="flex justify-between items-center text-xs border-t border-white/[0.04] pt-3">
                    <span className="text-slate-400 font-bold">État Facture (BDD)</span>
                    {isEditingStatus ? (
                      <div className="flex items-center gap-1.5">
                        <select 
                          value={newInvoiceStatus}
                          onChange={(e) => setNewInvoiceStatus(e.target.value)}
                          className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="DISPUTED">DISPUTED</option>
                        </select>
                        <button 
                          onClick={handleUpdateInvoiceStatus}
                          disabled={actionLoading === "update-status"}
                          className="p-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setIsEditingStatus(false)}
                          className="p-1 rounded bg-white/5 border border-white/10 text-slate-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono text-white font-bold">
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white/5 border border-white/10">{selectedShipping.status}</span>
                        <button 
                          onClick={() => setIsEditingStatus(true)}
                          className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Timeline logistique interactive */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ligne Temporelle Logistique</h4>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  
                  {/* Étape 1 : Paiement */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0C101D] flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Commande payée &amp; validée</span>
                      <span className="text-[10px] text-slate-500 font-semibold block">Prise en compte par le système</span>
                    </div>
                  </div>

                  {/* Étape 2 : Étiquette imprimée */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#0C101D] flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Bordereau de transport généré</span>
                      <span className="text-[10px] text-slate-500 font-semibold block">Étiquette prête pour l'expédition</span>
                    </div>
                  </div>

                  {/* Étape 3 : Dépôt Colis */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
                      selectedShipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED"
                        ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        : (selectedShipping.status !== "PAID" ? "bg-emerald-500" : "bg-slate-700")
                    }`} />
                    <div>
                      <span className="text-xs font-bold text-white block">Dépôt du colis en point relais / agence</span>
                      {selectedShipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" ? (
                        <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                          ⚠️ Anomalie : Vendeur n'a pas déposé le colis depuis {selectedShipping.daysSincePurchase} jours.
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold block">Effectué avec succès par le vendeur</span>
                      )}
                    </div>
                  </div>

                  {/* Étape 4 : Transit Hub */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
                      selectedShipping.carrierStatus === "BLOCKED_IN_HUB" || selectedShipping.carrierStatus === "LOST"
                        ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                        : (selectedShipping.status === "DELIVERED" || selectedShipping.status === "COMPLETED" ? "bg-emerald-500" : (selectedShipping.status === "SHIPPED" ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]" : "bg-slate-700"))
                    }`} />
                    <div>
                      <span className="text-xs font-bold text-white block">Transit en plate-forme logistique</span>
                      {selectedShipping.carrierStatus === "BLOCKED_IN_HUB" || selectedShipping.carrierStatus === "LOST" ? (
                        <span className="text-[10px] text-red-400 font-bold block mt-0.5">
                          ❌ Bloqué / Suspect : Colis immobile en agence de transit depuis {selectedShipping.daysSincePurchase} jours.
                        </span>
                      ) : selectedShipping.status === "SHIPPED" ? (
                        <span className="text-[10px] text-cyan-400 font-semibold block">En cours d'acheminement</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold block">Acheminement plateforme</span>
                      )}
                    </div>
                  </div>

                  {/* Étape 5 : Livraison finale */}
                  <div className="relative">
                    <span className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-[#0C101D] flex items-center justify-center ${
                      selectedShipping.carrierStatus === "DELIVERED" ? "bg-emerald-500" : "bg-slate-700"
                    }`} />
                    <div>
                      <span className="text-xs font-bold text-white block">Livraison et validation de commande</span>
                      {selectedShipping.carrierStatus === "DELIVERED" ? (
                        <span className="text-[10px] text-emerald-400 font-bold block">Colis livré et validé</span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold block">En attente de réception</span>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Coordonnées Vendeur & Acheteur */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Expéditeur */}
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Expéditeur</span>
                  <span className="text-xs font-bold text-white block">{selectedShipping.seller?.username || "Vendeur"}</span>
                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-600" /> <span className="truncate">{selectedShipping.seller?.email}</span></div>
                    {selectedShipping.seller?.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-600" /> <span>{selectedShipping.seller.phone}</span></div>}
                  </div>
                </div>

                {/* Destinataire */}
                <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl space-y-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Destinataire</span>
                  <span className="text-xs font-bold text-slate-200 block">{selectedShipping.buyer?.username || "Acheteur"}</span>
                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-600" /> <span className="truncate">{selectedShipping.buyer?.email}</span></div>
                    {selectedShipping.buyer?.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-600" /> <span>{selectedShipping.buyer.phone}</span></div>}
                  </div>
                </div>

              </div>

            </div>

            {/* Actions de Modération */}
            <div className="border-t border-white/[0.06] pt-4 mt-6 space-y-3">
              <span className="text-[9px] text-slate-500 font-bold block text-center leading-tight">
                🛡️ L'envoi de relance administrative utilise l'API de notification in-app en temps réel.
              </span>
              
              {selectedShipping.carrierStatus === "LABEL_PRINTED_NOT_SHIPPED" && (
                <button
                  onClick={() => handleShippingAction(selectedShipping.invoiceId, "WARN_SELLER")}
                  disabled={actionLoading !== null}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 active:scale-98"
                >
                  {actionLoading === `${selectedShipping.invoiceId}-WARN_SELLER` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Relancer le Vendeur (Retard de Dépôt)</span>
                    </>
                  )}
                </button>
              )}

              {(selectedShipping.carrierStatus === "BLOCKED_IN_HUB" || selectedShipping.carrierStatus === "LOST") && (
                <button
                  onClick={() => handleShippingAction(selectedShipping.invoiceId, "POSTPONE_VALIDATION")}
                  disabled={actionLoading !== null}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 active:scale-98"
                >
                  {actionLoading === `${selectedShipping.invoiceId}-POSTPONE_VALIDATION` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Repousser la Validation (Protéger les Fonds)</span>
                    </>
                  )}
                </button>
              )}

              {selectedShipping.carrierStatus === "DELIVERED" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center p-3 rounded-xl font-bold">
                  ✓ Ce colis a été livré. Aucune mesure d'arbitrage logistique n'est requise.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
