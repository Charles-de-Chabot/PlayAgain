"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface ShippingItem {
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

/**
 * useShipping manages filtering state, copy to clipboard, invoice statuses, tracking updates,
 * and dispatching warning relance notifications.
 */
export function useShipping() {
  const { showToast } = useToast();

  const [shippings, setShippings] = useState<ShippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCarrier, setFilterCarrier] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [selectedShipping, setSelectedShipping] = useState<ShippingItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Manual edition inside detail drawer
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [newTracking, setNewTracking] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newInvoiceStatus, setNewInvoiceStatus] = useState("");

  const fetchShippings = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (filterCarrier) queryParams.append("carrier", filterCarrier);
      if (filterStatus) queryParams.append("status", filterStatus);

      const res = await fetch(`/api/admin/shipping?${queryParams.toString()}`);
      const data = await res.json();
      if (data.shippings) {
        const sorted = [...data.shippings];
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
      showToast("error", "Impossible de charger la supervision logistique.");
    } finally {
      setLoading(false);
    }
  }, [search, filterCarrier, filterStatus, sortBy, showToast]);

  // Debounce API calls when filter inputs change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchShippings();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchShippings]);

  // Close dropdown menus on clicking outside window
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Numéro de suivi copié !");
  }, [showToast]);

  const handleShippingAction = useCallback(async (invoiceId: number, action: "WARN_SELLER" | "POSTPONE_VALIDATION") => {
    try {
      setActionLoading(`${invoiceId}-${action}`);
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, invoiceId }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("error", data.error);
        return;
      }

      showToast("success", data.message);
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur technique lors de l'exécution de l'action.");
    } finally {
      setActionLoading(null);
    }
  }, [showToast]);

  const handleUpdateTracking = useCallback(async () => {
    if (!selectedShipping || !newTracking.trim()) return;
    try {
      setActionLoading("update-tracking");
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TRACKING",
          invoiceId: selectedShipping.invoiceId,
          metadata: { trackingNumber: newTracking },
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("error", data.error);
        return;
      }

      showToast("success", data.message);
      setIsEditingTracking(false);

      const updatedItem = {
        ...selectedShipping,
        trackingNumber: newTracking,
        carrier: newTracking.startsWith("MR-") ? "Mondial Relay" : "Colissimo",
        carrierCode: newTracking.startsWith("MR-") ? "MR" : "CC",
      };

      setSelectedShipping(updatedItem);
      fetchShippings();
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur lors de la mise à jour du suivi.");
    } finally {
      setActionLoading(null);
    }
  }, [selectedShipping, newTracking, fetchShippings, showToast]);

  const handleUpdateInvoiceStatus = useCallback(async () => {
    if (!selectedShipping || !newInvoiceStatus) return;
    try {
      setActionLoading("update-status");
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          invoiceId: selectedShipping.invoiceId,
          metadata: { status: newInvoiceStatus },
        }),
      });
      const data = await res.json();

      if (data.error) {
        showToast("error", data.error);
        return;
      }

      showToast("success", data.message);
      setIsEditingStatus(false);

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
        anomalySeverity: newSeverity,
      });
      fetchShippings();
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur lors de la mise à jour de l'état.");
    } finally {
      setActionLoading(null);
    }
  }, [selectedShipping, newInvoiceStatus, fetchShippings, showToast]);

  return {
    shippings,
    loading,
    search,
    setSearch,
    filterCarrier,
    setFilterCarrier,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    activeDropdown,
    setActiveDropdown,
    selectedShipping,
    setSelectedShipping,
    isDrawerOpen,
    setIsDrawerOpen,
    actionLoading,
    isEditingTracking,
    setIsEditingTracking,
    newTracking,
    setNewTracking,
    isEditingStatus,
    setIsEditingStatus,
    newInvoiceStatus,
    setNewInvoiceStatus,
    fetchShippings,
    copyToClipboard,
    handleShippingAction,
    handleUpdateTracking,
    handleUpdateInvoiceStatus,
  };
}
