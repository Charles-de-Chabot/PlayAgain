"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface AddressItem {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
}

export interface InvoiceItemAdmin {
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

export interface InvoiceAdmin {
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

export interface KPIs {
  totalEscrowVolume: number;
  totalCommissions: number;
  openDisputes: number;
  resolutionRate: number;
}

/**
 * Custom hook useTransactions handles the state and operations for listing, filtering,
 * updating tracking information, and resolving dispute mediations.
 */
export function useTransactions() {
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<InvoiceAdmin[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalEscrowVolume: 0,
    totalCommissions: 0,
    openDisputes: 0,
    resolutionRate: 100,
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

  // Accordion details
  const [panelsExpanded, setPanelsExpanded] = useState(false);
  const [articleExpanded, setArticleExpanded] = useState(false);
  const [editingTracking, setEditingTracking] = useState(false);
  const [tempTracking, setTempTracking] = useState("");
  const [explanationMessage, setExplanationMessage] = useState("");

  // Sync details on invoice selection
  useEffect(() => {
    if (selectedInvoice) {
      setPanelsExpanded(false);
      setArticleExpanded(false);
      setEditingTracking(false);
      setTempTracking(selectedInvoice.tracking_number || "");
    }
  }, [selectedInvoice]);

  // Retrieve Transactions list
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const disputesOnly = filterType === "DISPUTED";
      const res = await fetch(`/api/admin/transactions?disputesOnly=${disputesOnly}&t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.invoices) {
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
      showToast("error", "Impossible de charger les transactions.");
    } finally {
      setLoading(false);
    }
  }, [filterType, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Update tracking number
  const handleUpdateTracking = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          trackingNumber: tempTracking,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Numéro de suivi mis à jour !");
        setEditingTracking(false);
        const updatedInv = { ...selectedInvoice, tracking_number: tempTracking || null };
        setSelectedInvoice(updatedInv);
        setInvoices((prev) => prev.map((inv) => (inv.id === selectedInvoice.id ? updatedInv : inv)));
      } else {
        showToast("error", data.error || "Impossible de mettre à jour le numéro de suivi.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Une erreur est survenue lors de la mise à jour.");
    }
  }, [selectedInvoice, tempTracking, showToast]);

  // Resolve Arbitration
  const handleArbitrage = useCallback(async () => {
    if (!selectedInvoice || !confirmModal.action) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/transactions/${selectedInvoice.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: confirmModal.action,
          explanation: explanationMessage,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          "success",
          confirmModal.action === "RELEASE_TO_SELLER"
            ? `Les fonds de la facture #${selectedInvoice.id} ont bien été versés au vendeur.`
            : `L'acheteur a été remboursé avec succès pour la commande #${selectedInvoice.id}.`
        );
        setConfirmModal({ show: false, action: null });
        setExplanationMessage("");
        setSelectedInvoice(null);
        fetchTransactions();
      } else {
        showToast("error", data.error || "Une erreur est survenue lors de l'arbitrage.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Une erreur réseau est survenue.");
    } finally {
      setActionLoading(false);
    }
  }, [selectedInvoice, confirmModal.action, explanationMessage, fetchTransactions, showToast]);

  // Computed Search Filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = search.toLowerCase().trim();
      if (!term) return true;

      const invoiceIdMatch =
        `PA-INV-${String(inv.id).padStart(6, "0")}`.toLowerCase().includes(term) ||
        `#${inv.id}`.includes(term) ||
        String(inv.id).includes(term);

      const buyerMatch =
        (inv.user?.username || "").toLowerCase().includes(term) ||
        (inv.user?.firstname || "").toLowerCase().includes(term) ||
        (inv.user?.lastname || "").toLowerCase().includes(term) ||
        inv.user?.email.toLowerCase().includes(term);

      const item = inv.items?.[0];
      const productMatch = item ? item.product.title.toLowerCase().includes(term) : false;
      const sellerMatch = item && item.product.user?.username ? item.product.user.username.toLowerCase().includes(term) : false;

      return invoiceIdMatch || buyerMatch || productMatch || sellerMatch;
    });
  }, [invoices, search]);

  return {
    invoices,
    kpis,
    loading,
    search,
    setSearch,
    filterType,
    setFilterType,
    selectedInvoice,
    setSelectedInvoice,
    actionLoading,
    confirmModal,
    setConfirmModal,
    panelsExpanded,
    setPanelsExpanded,
    articleExpanded,
    setArticleExpanded,
    editingTracking,
    setEditingTracking,
    tempTracking,
    setTempTracking,
    explanationMessage,
    setExplanationMessage,
    filteredInvoices,
    fetchTransactions,
    handleUpdateTracking,
    handleArbitrage,
  };
}
