"use client";

import { RefreshCw, Truck } from "lucide-react";
import { useShipping } from "@/hooks/useShipping";
import ShippingKPIs from "./components/ShippingKPIs";
import ShippingFilters from "./components/ShippingFilters";
import ShippingTable from "./components/ShippingTable";
import ShippingDiagnosticDrawer from "./components/modals/ShippingDiagnosticDrawer";

export default function ShippingSupervisionPage() {
  const {
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
  } = useShipping();

  return (
    <div className="flex-1 flex flex-col space-y-8 relative pb-12">
      {/* 🚀 En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 text-left">
            <Truck className="w-8 h-8 text-emerald-400" />
            Supervision Logistique Active
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-left">
            Auditez les commandes en transit. Résolvez les anomalies de colis en retard (orange) ou bloqués (rouge).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchShippings}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* 📊 Cartes KPI Glassmorphism Premium */}
      <ShippingKPIs shippings={shippings} />

      {/* 🔍 Filtres administratifs complexes */}
      <ShippingFilters
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCarrier={filterCarrier}
        setFilterCarrier={setFilterCarrier}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />

      {/* 📊 Cyber Tableau de transit actif */}
      <ShippingTable
        shippings={shippings}
        loading={loading}
        onSelectShipping={(shipping) => {
          setSelectedShipping(shipping);
          setNewTracking(shipping.trackingNumber);
          setNewInvoiceStatus(shipping.status);
          setIsDrawerOpen(true);
        }}
        onCopyTracking={copyToClipboard}
        onShippingAction={handleShippingAction}
        actionLoading={actionLoading}
      />

      {/* 🚀 VOLET D'INSPECTION DÉTAILLÉ (MODAL DRAWER) */}
      <ShippingDiagnosticDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        shipping={selectedShipping}
        actionLoading={actionLoading}
        isEditingTracking={isEditingTracking}
        setIsEditingTracking={setIsEditingTracking}
        newTracking={newTracking}
        setNewTracking={setNewTracking}
        isEditingStatus={isEditingStatus}
        setIsEditingStatus={setIsEditingStatus}
        newInvoiceStatus={newInvoiceStatus}
        setNewInvoiceStatus={setNewInvoiceStatus}
        onUpdateTracking={handleUpdateTracking}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        onShippingAction={handleShippingAction}
      />
    </div>
  );
}
