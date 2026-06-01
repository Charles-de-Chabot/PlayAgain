"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCcw, 
  DollarSign, 
  TrendingUp, 
  Loader2, 
  ShieldAlert, 
  ExternalLink, 
  XCircle, 
  MessageSquare,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AddressItem {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
}

interface InvoiceItemAdmin {
  id: number;
  unit_price: number;
  product: {
    id: number;
    title: string;
    description: string | null;
    state: string;
    price: number;
    user_id: number;
    age?: number | null;
    accessory_included?: boolean;
    targetGender?: string;
    levelCategory?: string;
    category?: { label: string } | null;
    type?: { label: string } | null;
    brand?: { label: string } | null;
    size?: { label: string } | null;
    user: {
      id: number;
      username: string | null;
      firstname: string | null;
      lastname: string | null;
      email: string;
      phone: string | null;
      profile_picture: string | null;
      is_certified: boolean;
      created_at: string;
      stripeConnectId: string | null;
      addresses?: AddressItem[] | null;
    };
    media: Array<{
      url: string;
    }>;
  };
}

interface InvoiceAdmin {
  id: number;
  user_id: number;
  total_price: number;
  commission: number | null;
  shipping_fee: number | null;
  payment_intent_id: string | null;
  is_disputed: boolean;
  invoice_date: string;
  status: string;
  tracking_number: string | null;
  delivered_at: string | null;
  address?: AddressItem | null;
  user: {
    id: number;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string;
    phone: string | null;
    profile_picture: string | null;
    is_certified: boolean;
    created_at: string;
    addresses?: AddressItem[] | null;
  };
  items: InvoiceItemAdmin[];
}

interface KPIs {
  totalEscrowVolume: number;
  totalCommissions: number;
  openDisputes: number;
  resolutionRate: number;
}

export default function AdminTransactionsPage() {
  const [invoices, setInvoices] = useState<InvoiceAdmin[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalEscrowVolume: 0,
    totalCommissions: 0,
    openDisputes: 0,
    resolutionRate: 100
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "DISPUTED" | "COMPLETED" | "CANCELLED">("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceAdmin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    action: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER" | null;
  }>({ show: false, action: null });
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [panelsExpanded, setPanelsExpanded] = useState(false);
  const [articleExpanded, setArticleExpanded] = useState(false);
  const [editingTracking, setEditingTracking] = useState(false);
  const [tempTracking, setTempTracking] = useState("");

  useEffect(() => {
    if (selectedInvoice) {
      setPanelsExpanded(false);
      setArticleExpanded(false);
      setEditingTracking(false);
      setTempTracking(selectedInvoice.tracking_number || "");
    }
  }, [selectedInvoice]);

  const handleUpdateTracking = async () => {
    if (!selectedInvoice) return;
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          trackingNumber: tempTracking
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("success", "Numéro de suivi mis à jour !");
        setEditingTracking(false);
        const updatedInv = { ...selectedInvoice, tracking_number: tempTracking || null };
        setSelectedInvoice(updatedInv);
        setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? updatedInv : inv));
      } else {
        showNotification("error", data.error || "Impossible de mettre à jour le numéro de suivi.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Une erreur est survenue lors de la mise à jour.");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const disputesOnly = filterType === "DISPUTED";
      const res = await fetch(`/api/admin/transactions?disputesOnly=${disputesOnly}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.invoices) {
        // Filtrer côté client pour les autres types d'onglets pour plus de réactivité
        let filtered = data.invoices;
        if (filterType === "COMPLETED") {
          filtered = data.invoices.filter((inv: any) => inv.status === "COMPLETED");
        } else if (filterType === "CANCELLED") {
          filtered = data.invoices.filter((inv: any) => inv.status === "CANCELLED");
        }
        setInvoices(filtered);
      }
      if (data.kpis) {
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Impossible de charger les transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const [explanationMessage, setExplanationMessage] = useState("");

  const handleArbitrage = async () => {
    if (!selectedInvoice || !confirmModal.action) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/transactions/${selectedInvoice.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: confirmModal.action,
          explanation: explanationMessage
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(
          "success",
          confirmModal.action === "RELEASE_TO_SELLER"
            ? `Les fonds de la facture #${selectedInvoice.id} ont bien été versés au vendeur.`
            : `L'acheteur a été remboursé avec succès pour la commande #${selectedInvoice.id}.`
        );
        setConfirmModal({ show: false, action: null });
        setExplanationMessage("");
        setSelectedInvoice(null);
        fetchTransactions(); // Recharger
      } else {
        showNotification("error", data.error || "Une erreur est survenue lors de l'arbitrage.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Une erreur réseau est survenue.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.toLowerCase();
    if (!term) return true;

    const invoiceIdMatch = `PA-INV-${String(inv.id).padStart(6, '0')}`.toLowerCase().includes(term) || `#${inv.id}`.includes(term) || String(inv.id).includes(term);
    const buyerMatch = (inv.user?.username || "").toLowerCase().includes(term) || 
                       (inv.user?.firstname || "").toLowerCase().includes(term) || 
                       (inv.user?.lastname || "").toLowerCase().includes(term) ||
                       inv.user?.email.toLowerCase().includes(term);

    const item = inv.items?.[0];
    const productMatch = item ? item.product.title.toLowerCase().includes(term) : false;
    const sellerMatch = item && item.product.user?.username 
      ? item.product.user.username.toLowerCase().includes(term) 
      : false;

    return invoiceIdMatch || buyerMatch || productMatch || sellerMatch;
  });

  return (
    <div className="space-y-8 select-none relative">
      {/* 1. Alerte Notification Flottante */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-slide-in ${
          notification.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20" 
            : "bg-red-950/80 border-red-500/30 text-red-300 shadow-red-950/20"
        }`}>
          {notification.type === "success" ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 2. En-tête de la Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-brand-accent/80 select-none">
            <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-ping" />
            Espace Médiation
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Flux & Litiges
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
            Supervisez les fonds sous séquestre sécurisé et intervenez de manière décisive pour arbitrer les contestations acheteurs-vendeurs.
          </p>
        </div>
        
        <button 
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs font-bold text-white transition-all disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      {/* 3. Bandeau KPI Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-primary/10 blur-xl group-hover:bg-brand-primary/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sous Séquestre</span>
            <div className="p-2 rounded-xl bg-white/5 text-brand-primary border border-white/5">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{kpis.totalEscrowVolume.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</div>
            <p className="text-[10px] text-slate-500 mt-1">Fonds gelés en cours d'expédition/litige</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-brand-accent/10 blur-xl group-hover:bg-brand-accent/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commissions PlayAgain</span>
            <div className="p-2 rounded-xl bg-white/5 text-brand-accent border border-white/5">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-brand-accent">{kpis.totalCommissions.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</div>
            <p className="text-[10px] text-slate-500 mt-1">Gains nets perçus par la plateforme</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-red-500/10 blur-xl group-hover:bg-red-500/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Litiges Actifs</span>
            <div className={`p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 ${kpis.openDisputes > 0 ? "animate-pulse" : ""}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-red-500">{kpis.openDisputes}</div>
            <p className="text-[10px] text-slate-500 mt-1">Dossiers de réclamation ouverts</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="relative group overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-white/[0.12] transition-all duration-300">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/15 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Taux de Résolution</span>
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-white/5">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-400">{kpis.resolutionRate} %</div>
            <p className="text-[10px] text-slate-500 mt-1">Pourcentage de litiges réglés</p>
          </div>
        </div>
      </div>

      {/* 4. Barre d'outils de filtrage et recherche */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/[0.01] backdrop-blur-md p-4 rounded-2xl border border-white/[0.06]">
        {/* Barre de Recherche */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par ID, acheteur, vendeur, produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-black/40 border border-white/[0.08] hover:border-white/[0.15] focus:border-brand-accent/50 text-white rounded-xl py-3 pl-10 pr-4 outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Filtres de Status (Tabs) */}
        <div className="flex items-center gap-1.5 bg-black/30 border border-white/[0.06] p-1.5 rounded-xl select-none self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterType("ALL")}
            className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              filterType === "ALL" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType("DISPUTED")}
            className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              filterType === "DISPUTED" 
                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                : "text-slate-400 hover:text-red-400"
            }`}
          >
            Litiges Ouverts
          </button>
          <button
            onClick={() => setFilterType("COMPLETED")}
            className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              filterType === "COMPLETED" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            Finalisés
          </button>
          <button
            onClick={() => setFilterType("CANCELLED")}
            className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              filterType === "CANCELLED" 
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                : "text-slate-400 hover:text-blue-400"
            }`}
          >
            Remboursés
          </button>
        </div>
      </div>

      {/* 5. Grille de suivi des Transactions */}
      <div className="bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
            <span className="text-xs text-slate-400 font-bold select-none">Récupération des transactions...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <CreditCard className="h-10 w-10 text-slate-600 mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">Aucune transaction trouvée</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Il n'y a actuellement aucune commande correspondant aux critères de recherche ou de filtre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Facture</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Article de Sport</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Acheteur</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Vendeur</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Montant</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Statut</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none text-right">Arbitrage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredInvoices.map((inv) => {
                  const item = inv.items?.[0];
                  const product = item?.product;
                  const sellerName = product?.user?.username || "Inconnu";
                  const productMedia = product?.media?.[0]?.url;

                  return (
                    <tr 
                      key={inv.id}
                      className={`hover:bg-white/[0.01] transition-colors group cursor-pointer ${
                        inv.status === "DISPUTED" ? "bg-red-500/[0.02]" : ""
                      }`}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      {/* Facture ID */}
                      <td className="p-4 align-middle">
                        <span className="font-extrabold text-white text-xs block group-hover:text-brand-accent transition-colors">
                          PA-INV-{inv.id.toString().padStart(6, '0')}
                        </span>
                        {inv.tracking_number && (
                          <span className="text-[9px] text-slate-500 mt-0.5 block tracking-wider font-mono">
                            📦 {inv.tracking_number}
                          </span>
                        )}
                      </td>

                      {/* Produit */}
                      <td className="p-4 align-middle">
                        {product ? (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950">
                              {productMedia ? (
                                <img
                                  src={productMedia}
                                  alt={product.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600 font-bold">N/A</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate max-w-[180px]">
                                {product.title}
                              </span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold mt-0.5">
                                État: {product.state}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Article supprimé</span>
                        )}
                      </td>

                      {/* Acheteur */}
                      <td className="p-4 align-middle">
                        <span className="text-xs font-bold text-white block">
                          {inv.user?.username || "Acheteur"}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">
                          {inv.user?.email}
                        </span>
                      </td>

                      {/* Vendeur */}
                      <td className="p-4 align-middle">
                        <span className="text-xs font-bold text-white block">
                          {sellerName}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                          product?.user?.stripeConnectId 
                            ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20" 
                            : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}>
                          {product?.user?.stripeConnectId ? "Connecté" : "Non Config."}
                        </span>
                      </td>

                      {/* Montant */}
                      <td className="p-4 align-middle font-mono">
                        <span className="text-xs font-extrabold text-white block">
                          {Number(inv.total_price).toFixed(2)} €
                        </span>
                        {inv.commission && (
                          <span className="text-[9px] text-brand-accent block mt-0.5 font-bold">
                            Com: {Number(inv.commission).toFixed(2)} €
                          </span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border select-none ${
                          inv.status === "DISPUTED"
                            ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                            : inv.status === "COMPLETED"
                            ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                            : inv.status === "CANCELLED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${
                            inv.status === "DISPUTED"
                              ? "bg-red-400 animate-pulse"
                              : inv.status === "COMPLETED"
                              ? "bg-brand-accent"
                              : inv.status === "CANCELLED"
                              ? "bg-blue-400"
                              : "bg-amber-400 animate-pulse"
                          }`} />
                          {inv.status === "DISPUTED" ? "Litige" : inv.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 align-middle text-xs text-slate-500 font-medium">
                        {new Date(inv.invoice_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Action */}
                      <td className="p-4 align-middle text-right">
                        <button className="inline-flex p-2 rounded-xl bg-white/5 hover:bg-brand-accent hover:text-black text-slate-400 border border-white/5 hover:border-transparent transition-all select-none cursor-pointer">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. MODAL INTERACTIF DE MÉDIATION & LITIGES (Drawer latéral) */}
      {selectedInvoice && (() => {
        const buyer = selectedInvoice.user;
        const seller = selectedInvoice.items?.[0]?.product?.user;
        const address = selectedInvoice.address;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            {/* Overlay flou */}
            <div 
              onClick={() => setSelectedInvoice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
            />

            {/* Drawer Panel */}
            <div className="w-full max-w-4xl h-full bg-[#0B0F19]/95 border-l border-white/[0.08] backdrop-blur-2xl shadow-2xl flex flex-col relative z-10 transition-all duration-300 animate-slide-left p-6 overflow-y-auto">
              {/* Bouton fermeture */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-brand-accent" />
                  <h2 className="text-md font-black text-white uppercase tracking-wider">Arbitrage & Profils Protagonistes</h2>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Corps du Dossier */}
              <div className="flex-1 space-y-6 py-6 text-left">
                {/* Détails de la Commande */}
                <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500">Commande</span>
                    <span className="text-xs font-bold text-white">PA-INV-{selectedInvoice.id.toString().padStart(6, '0')}</span>
                  </div>
                  
                  {selectedInvoice.items?.[0] && (
                    <div className="flex gap-3 bg-black/40 border border-white/[0.04] p-2.5 rounded-xl">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950">
                        {selectedInvoice.items[0].product.media?.[0]?.url ? (
                          <img 
                            src={selectedInvoice.items[0].product.media[0].url} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600 font-bold">N/A</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">
                          {selectedInvoice.items[0].product.title}
                        </div>
                        <div className="text-[10px] text-brand-accent font-bold mt-0.5">
                          {Number(selectedInvoice.items[0].product.price).toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-400">Total (TTC + Séquestre) :</span>
                    <span className="font-extrabold text-white font-mono">{Number(selectedInvoice.total_price).toFixed(2)} €</span>
                  </div>
                  
                  {selectedInvoice.commission && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Commissions PlayAgain :</span>
                      <span className="font-bold text-brand-accent font-mono">{Number(selectedInvoice.commission).toFixed(2)} €</span>
                    </div>
                  )}

                  {/* Bouton Accordéon pour les détails de l'article & livraison */}
                  <div className="border-t border-white/[0.06] pt-3 mt-1">
                    <button
                      onClick={() => setArticleExpanded(!articleExpanded)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none group"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                        Détails du Produit & Suivi
                      </span>
                      {articleExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      )}
                    </button>

                    {articleExpanded && (
                      <div className="mt-3 space-y-4 animate-fadeIn">
                        {/* 1. SUIVI & LIVRAISON */}
                        <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Suivi & Livraison</span>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <span className="text-slate-500 block">Frais de livraison :</span>
                              <span className="font-semibold text-slate-300 font-mono">
                                {selectedInvoice.shipping_fee && Number(selectedInvoice.shipping_fee) > 0 
                                  ? `${Number(selectedInvoice.shipping_fee).toFixed(2)} €` 
                                  : "Offerts / Remise en main propre"}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-slate-500 block mb-1">Numéro de suivi :</span>
                              {editingTracking ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <input
                                    type="text"
                                    value={tempTracking}
                                    onChange={(e) => setTempTracking(e.target.value)}
                                    placeholder="Ex: FR123456789"
                                    className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 w-full"
                                  />
                                  <button
                                    onClick={handleUpdateTracking}
                                    className="px-2 py-1 bg-brand-accent hover:bg-brand-accent/80 text-black text-[10px] font-bold rounded cursor-pointer transition-colors"
                                  >
                                    Sauver
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingTracking(false);
                                      setTempTracking(selectedInvoice.tracking_number || "");
                                    }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] rounded cursor-pointer transition-colors"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`font-mono font-bold ${selectedInvoice.tracking_number ? 'text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded border border-brand-accent/10' : 'text-slate-500 italic'}`}>
                                    {selectedInvoice.tracking_number || "Non renseigné"}
                                  </span>
                                  <button
                                    onClick={() => setEditingTracking(true)}
                                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                                  >
                                    [Modifier]
                                  </button>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-slate-500 block">Date d'achat :</span>
                              <span className="font-semibold text-slate-300">
                                {new Date(selectedInvoice.invoice_date).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Date de livraison :</span>
                              <span className="font-semibold text-slate-300">
                                {selectedInvoice.delivered_at 
                                  ? new Date(selectedInvoice.delivered_at).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' }) 
                                  : "En cours de livraison / À valider"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. DESCRIPTION */}
                        {selectedInvoice.items?.[0]?.product && (
                          <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Description</span>
                            <p className="text-slate-300 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                              {selectedInvoice.items[0].product.description || "Aucune description fournie par le vendeur."}
                            </p>
                          </div>
                        )}

                        {/* 3. SPECIFICATIONS TECHNIQUES */}
                        {selectedInvoice.items?.[0]?.product && (() => {
                          const prod = selectedInvoice.items[0].product;
                          return (
                            <div className="space-y-2 text-xs bg-black/40 border border-white/[0.04] p-3.5 rounded-xl">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Spécifications Techniques</span>
                              
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Marque :</span>
                                  <span className="font-semibold text-slate-300">{prod.brand?.label || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Catégorie :</span>
                                  <span className="font-semibold text-slate-300">{prod.category?.label || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Type :</span>
                                  <span className="font-semibold text-slate-300">{prod.type?.label || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Taille :</span>
                                  <span className="font-semibold text-slate-300">{prod.size?.label || "Non spécifiée"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Année de fabrication :</span>
                                  <span className="font-semibold text-slate-300 font-mono">{prod.age || "Non spécifiée"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Accessoires inclus :</span>
                                  <span className="font-semibold text-slate-300">{prod.accessory_included ? "Oui" : "Non"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Genre ciblé :</span>
                                  <span className="font-semibold text-slate-300">
                                    {prod.targetGender === "MALE" ? "Homme" : prod.targetGender === "FEMALE" ? "Femme" : "Unisexe"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Niveau requis :</span>
                                  <span className="font-semibold text-slate-300">
                                    {prod.levelCategory === "BEGINNER" ? "Débutant" : prod.levelCategory === "INTERMEDIATE" ? "Intermédiaire" : prod.levelCategory === "ADVANCED" ? "Confirmé" : prod.levelCategory === "EXPERT" ? "Expert" : prod.levelCategory || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Double bandeau côte à côte (Acheteur et Vendeur) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* --- ACHETEUR --- */}
                  <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                    <button 
                      onClick={() => setPanelsExpanded(!panelsExpanded)}
                      className="w-full flex items-center justify-between border-b border-white/[0.06] pb-3 text-left focus:outline-none group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {buyer?.profile_picture ? (
                              <img src={buyer.profile_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-slate-400 font-mono">
                                {(buyer?.username || buyer?.email || "AC").substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                              Acheteur
                              {buyer?.is_certified && (
                                <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">@{buyer?.username || "client"} ({buyer?.firstname || ""} {buyer?.lastname || ""})</span>
                          </div>
                        </div>
                      </div>
                      {panelsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      )}
                    </button>

                    {panelsExpanded && (
                      <div className="space-y-4 pt-1 animate-fadeIn">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Email :</span>
                            <a href={`mailto:${buyer?.email}`} className="text-slate-300 hover:text-brand-accent transition-colors font-semibold font-mono">{buyer?.email}</a>
                          </div>
                          {buyer?.phone && (
                            <div>
                              <span className="text-slate-500 block">Téléphone :</span>
                              <span className="text-slate-300 font-mono font-semibold">{buyer.phone}</span>
                            </div>
                          )}
                          {buyer?.created_at && (
                            <div>
                              <span className="text-slate-500 block">Membre depuis :</span>
                              <span className="text-slate-300 font-semibold">{new Date(buyer.created_at).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Adresse de Livraison */}
                        <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Adresse de Livraison</span>
                          {address || (buyer?.addresses && buyer.addresses.length > 0) ? (() => {
                            const addr = address || buyer?.addresses?.[0];
                            if (!addr) return null;
                            return (
                              <div className="text-xs text-slate-300 space-y-0.5 leading-relaxed font-medium">
                                <div className="font-semibold text-white">{buyer?.firstname || buyer?.username} {buyer?.lastname || ""}</div>
                                <div>{addr.street_number || ""} {addr.street_name}</div>
                                <div>{addr.zip_code} {addr.city}</div>
                                <div className="uppercase font-bold text-[10px] text-slate-400 tracking-wider mt-1">{addr.country}</div>
                              </div>
                            );
                          })() : (
                            <span className="text-xs text-slate-500 italic">Aucune adresse renseignée ou remise en main propre</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* --- VENDEUR --- */}
                  <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                    <button 
                      onClick={() => setPanelsExpanded(!panelsExpanded)}
                      className="w-full flex items-center justify-between border-b border-white/[0.06] pb-3 text-left focus:outline-none group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {seller?.profile_picture ? (
                              <img src={seller.profile_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-slate-400 font-mono">
                                {(seller?.username || seller?.email || "VE").substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                              Vendeur
                              {seller?.is_certified && (
                                <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">@{seller?.username || "vendeur"} ({seller?.firstname || ""} {seller?.lastname || ""})</span>
                          </div>
                        </div>
                      </div>
                      {panelsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      )}
                    </button>

                    {panelsExpanded && (
                      <div className="space-y-4 pt-1 animate-fadeIn">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-500 block">Email :</span>
                            <a href={`mailto:${seller?.email}`} className="text-slate-300 hover:text-brand-accent transition-colors font-semibold font-mono">{seller?.email}</a>
                          </div>
                          {seller?.phone && (
                            <div>
                              <span className="text-slate-500 block">Téléphone :</span>
                              <span className="text-slate-300 font-mono font-semibold">{seller.phone}</span>
                            </div>
                          )}
                          {seller?.created_at && (
                            <div>
                              <span className="text-slate-500 block">Membre depuis :</span>
                              <span className="text-slate-300 font-semibold">{new Date(seller.created_at).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Adresse Renseignée */}
                        <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Adresse du Vendeur</span>
                          {seller?.addresses && seller.addresses.length > 0 ? (() => {
                            const addr = seller.addresses[0];
                            return (
                              <div className="text-xs text-slate-300 space-y-0.5 leading-relaxed font-medium">
                                <div className="font-semibold text-white">{seller?.firstname || seller?.username} {seller?.lastname || ""}</div>
                                <div>{addr.street_number || ""} {addr.street_name}</div>
                                <div>{addr.zip_code} {addr.city}</div>
                                <div className="uppercase font-bold text-[10px] text-slate-400 tracking-wider mt-1">{addr.country}</div>
                              </div>
                            );
                          })() : (
                            <span className="text-xs text-slate-500 italic">Aucune adresse renseignée par le vendeur</span>
                          )}
                        </div>

                        {/* Statut Financier Stripe */}
                        <div className="bg-black/30 border border-white/[0.04] p-3.5 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block font-bold">Statut Bancaire Stripe Connect</span>
                          {seller?.stripeConnectId ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span>Compte Connecté & Prêt</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 truncate bg-black/40 px-2 py-1 rounded border border-white/[0.02]">
                                ID: {seller.stripeConnectId}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                              <span>Non Configuré (Virement Impossible)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dossier de Réclamation / Raison */}
                {selectedInvoice.status === "DISPUTED" && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold">
                      <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
                      Motif déclaré du litige
                    </div>
                    <p className="text-xs text-red-200/80 leading-relaxed italic bg-black/40 border border-white/[0.02] p-3 rounded-xl">
                      "L'acheteur a signalé un problème ou ouvert un litige concernant la commande #${selectedInvoice.id}."
                    </p>
                  </div>
                )}

                {/* Redirection vers le support / chat de médiation */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Actions de Médiation</span>
                  <Link 
                    href="/admin/support"
                    className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-xl py-3 px-4 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-accent" />
                      Ouvrir le Support Helpdesk
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                </div>
              </div>

              {/* Zone de Décisions d'arbitrage */}
              {selectedInvoice.status === "DISPUTED" ? (
                <div className="pt-4 border-t border-white/[0.08] space-y-3 shrink-0">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold text-center block mb-2 select-none">
                    Verdict Administratif Souverain
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Rembourser l'acheteur */}
                    <button
                      onClick={() => setConfirmModal({ show: true, action: "REFUND_TO_BUYER" })}
                      className="bg-red-600 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] text-white font-black text-xs py-3.5 px-3 rounded-xl border border-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      Rembourser l'Acheteur
                    </button>

                    {/* Débloquer pour le vendeur */}
                    <button
                      onClick={() => setConfirmModal({ show: true, action: "RELEASE_TO_SELLER" })}
                      className="bg-brand-accent hover:bg-brand-accent/90 hover:shadow-[0_0_15px_rgba(198,255,52,0.3)] text-black font-black text-xs py-3.5 px-3 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Débloquer les Fonds
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-slate-500 py-2 select-none font-medium">
                  Cette transaction a déjà été traitée (Statut: {selectedInvoice.status}).
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 7. DIALOG DE DOUBLE CONFIRMATION SÉCURISÉE */}
      {confirmModal.show && selectedInvoice && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            onClick={() => {
              setConfirmModal({ show: false, action: null });
              setExplanationMessage("");
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <div className="w-full max-w-sm bg-[#0C101B] border border-white/[0.08] rounded-3xl p-6 text-center shadow-2xl relative z-10 animate-scale-in">
            <div className={`inline-flex p-3 rounded-2xl mb-4 border ${
              confirmModal.action === "RELEASE_TO_SELLER" 
                ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-md font-black text-white tracking-tight uppercase">
              {confirmModal.action === "RELEASE_TO_SELLER" 
                ? "Confirmer le Virement" 
                : "Confirmer le Remboursement"
              }
            </h3>

            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {confirmModal.action === "RELEASE_TO_SELLER"
                ? `Êtes-vous certain de vouloir verser les fonds de la commande #${selectedInvoice.id} (${selectedInvoice.total_price} €) au vendeur ${selectedInvoice.items?.[0]?.product?.user?.username} ? Cette action est irréversible.`
                : `Êtes-vous certain de vouloir rembourser intégralement l'acheteur ${selectedInvoice.user?.username} d'un montant de ${selectedInvoice.total_price} € ? Cette action est irréversible.`
              }
            </p>

            {/* Saisie d'un message d'explication de la décision */}
            <div className="mt-4 text-left">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Message d'explication (optionnel) :
              </label>
              <textarea
                value={explanationMessage}
                onChange={(e) => setExplanationMessage(e.target.value)}
                placeholder="Ex: Le colis a été livré complet / L'acheteur a retourné un produit défectueux..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => {
                  setConfirmModal({ show: false, action: null });
                  setExplanationMessage("");
                }}
                disabled={actionLoading}
                className="w-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                Annuler
              </button>

              <button
                onClick={handleArbitrage}
                disabled={actionLoading}
                className={`w-full font-black text-xs py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  confirmModal.action === "RELEASE_TO_SELLER"
                    ? "bg-brand-accent text-black hover:bg-brand-accent/90"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmModal.action === "RELEASE_TO_SELLER" ? "Valider" : "Rembourser"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
