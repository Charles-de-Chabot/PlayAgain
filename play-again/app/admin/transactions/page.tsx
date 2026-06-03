"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionsKPIs from "./components/TransactionsKPIs";
import TransactionsFilters from "./components/TransactionsFilters";
import TransactionsTable from "./components/TransactionsTable";
import TransactionDetailDrawer from "./components/modals/TransactionDetailDrawer";
import ArbitrageConfirmModal from "./components/modals/ArbitrageConfirmModal";

export default function AdminTransactionsPage() {
  const {
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
  } = useTransactions();

  const buyer = selectedInvoice?.user;
  const seller = selectedInvoice?.items?.[0]?.product?.user;

  return (
    <div className="space-y-8 select-none relative">
      {/* 1. En-tête de la Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-brand-accent/80 select-none">
            <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-ping" />
            Espace Médiation
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">Flux & Litiges</h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xl">
            Supervisez les fonds sous séquestre sécurisé et intervenez de manière décisive pour arbitrer les contestations acheteurs-vendeurs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-xs font-bold text-white transition-all disabled:opacity-50 select-none cursor-pointer"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Rafraîchir</span>
        </button>
      </div>

      {/* 2. Bandeau KPI Hero */}
      <TransactionsKPIs kpis={kpis} />

      {/* 3. Barre d'outils de filtrage et recherche */}
      <TransactionsFilters
        search={search}
        setSearch={setSearch}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      {/* 4. Grille de suivi des Transactions */}
      <TransactionsTable
        loading={loading}
        filteredInvoices={filteredInvoices}
        onSelectInvoice={setSelectedInvoice}
      />

      {/* 5. MODAL INTERACTIF DE MÉDIATION & LITIGES (Drawer latéral) */}
      <TransactionDetailDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onRelease={() => setConfirmModal({ show: true, action: "RELEASE_TO_SELLER" })}
        onRefund={() => setConfirmModal({ show: true, action: "REFUND_TO_BUYER" })}
        panelsExpanded={panelsExpanded}
        setPanelsExpanded={setPanelsExpanded}
        articleExpanded={articleExpanded}
        setArticleExpanded={setArticleExpanded}
        editingTracking={editingTracking}
        setEditingTracking={setEditingTracking}
        tempTracking={tempTracking}
        setTempTracking={setTempTracking}
        onUpdateTracking={handleUpdateTracking}
      />

      {/* 6. DIALOG DE DOUBLE CONFIRMATION SÉCURISÉE */}
      <ArbitrageConfirmModal
        isOpen={confirmModal.show}
        onClose={() => {
          setConfirmModal({ show: false, action: null });
          setExplanationMessage("");
        }}
        action={confirmModal.action}
        invoiceId={selectedInvoice?.id || 0}
        totalPrice={selectedInvoice?.total_price || 0}
        usernameSeller={seller?.username || "Vendeur"}
        usernameBuyer={buyer?.username || "Acheteur"}
        explanationMessage={explanationMessage}
        setExplanationMessage={setExplanationMessage}
        actionLoading={actionLoading}
        onSubmit={handleArbitrage}
      />
    </div>
  );
}
