"use client";

import React from "react";
import { CreditCard, Loader2, ChevronRight } from "lucide-react";
import { InvoiceAdmin } from "@/hooks/useTransactions";

export interface TransactionsTableProps {
  loading: boolean;
  filteredInvoices: InvoiceAdmin[];
  onSelectInvoice: (inv: InvoiceAdmin) => void;
}

/**
 * TransactionsTable renders the tabular summary of invoices.
 */
export default function TransactionsTable({
  loading,
  filteredInvoices,
  onSelectInvoice,
}: TransactionsTableProps) {
  return (
    <div className="bg-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl relative">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
          <span className="text-xs text-slate-400 font-bold select-none">
            Récupération des transactions...
          </span>
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Facture
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Article de Sport
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Acheteur
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Vendeur
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Montant
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Statut
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Date
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none text-right">
                  Arbitrage
                </th>
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
                    onClick={() => onSelectInvoice(inv)}
                  >
                    {/* Facture ID */}
                    <td className="p-4 align-middle">
                      <span className="font-extrabold text-white text-xs block group-hover:text-brand-accent transition-colors">
                        PA-INV-{inv.id.toString().padStart(6, "0")}
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
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                N/A
                              </div>
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
                      <span className="text-xs font-bold text-white block">{sellerName}</span>
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                          product?.user?.stripeConnectId
                            ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}
                      >
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
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border select-none ${
                          inv.status === "DISPUTED"
                            ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                            : inv.status === "COMPLETED"
                            ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                            : inv.status === "CANCELLED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${
                            inv.status === "DISPUTED"
                              ? "bg-red-400 animate-pulse"
                              : inv.status === "COMPLETED"
                              ? "bg-brand-accent"
                              : inv.status === "CANCELLED"
                              ? "bg-blue-400"
                              : "bg-amber-400 animate-pulse"
                          }`}
                        />
                        {inv.status === "DISPUTED" ? "Litige" : inv.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 align-middle text-xs text-slate-500 font-medium">
                      {new Date(inv.invoice_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Action */}
                    <td className="p-4 align-middle text-right">
                      <button
                        type="button"
                        className="inline-flex p-2 rounded-xl bg-white/5 hover:bg-brand-accent hover:text-black text-slate-400 border border-white/5 hover:border-transparent transition-all select-none cursor-pointer"
                      >
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
  );
}
