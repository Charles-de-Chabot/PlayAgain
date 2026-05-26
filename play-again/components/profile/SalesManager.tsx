"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Truck, 
  QrCode,
  ArrowUpRight,
  Info,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface Sale {
  id: number;
  status: string;
  totalPrice: number;
  commission: number;
  shippingFee: number;
  addressId: number | null;
  invoiceDate: string;
  buyer: {
    id: number;
    username: string | null;
    profile_picture: string | null;
  } | null;
  product: {
    id: number;
    title: string;
    price: number;
    media: string[];
    category: string;
  } | null;
  conversationId: number | null;
}

interface SalesManagerProps {
  initialSales: Sale[];
}

export function SalesManager({ initialSales }: SalesManagerProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [verificationCodes, setVerificationCodes] = useState<Record<number, string>>({});
  const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // 1. Calcul des indicateurs financiers
  const completedSalesTotal = sales
    .filter(s => s.status === "COMPLETED")
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const escrowSalesTotal = sales
    .filter(s => ["PAID", "SHIPPED", "DELIVERED"].includes(s.status))
    .reduce((sum, s) => sum + s.totalPrice, 0);

  const completedSalesCount = sales.filter(s => s.status === "COMPLETED").length;
  const activeSalesCount = sales.filter(s => ["PAID", "SHIPPED", "DELIVERED", "DISPUTED"].includes(s.status)).length;

  // 2. Handler d'expédition de colis
  const handleMarkAsShipped = async (saleId: number) => {
    setLoadingIds(prev => ({ ...prev, [saleId]: true }));
    setErrors(prev => ({ ...prev, [saleId]: "" }));
    
    try {
      const res = await fetch(`/api/invoices/${saleId}/ship`, {
        method: "POST"
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors du marquage.");
      }
      
      // Mettre à jour l'état local
      setSales(prev => 
        prev.map(s => s.id === saleId ? { ...s, status: "SHIPPED" } : s)
      );
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [saleId]: err.message }));
    } finally {
      setLoadingIds(prev => ({ ...prev, [saleId]: false }));
    }
  };

  // 3. Handler de saisie de code remise main propre
  const handleVerifyCode = async (saleId: number) => {
    const code = verificationCodes[saleId]?.trim().toUpperCase();
    if (!code) return;
    
    setLoadingIds(prev => ({ ...prev, [saleId]: true }));
    setErrors(prev => ({ ...prev, [saleId]: "" }));
    
    try {
      const res = await fetch(`/api/invoices/${saleId}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Code de validation incorrect.");
      }
      
      // Mettre à jour l'état local
      setSales(prev => 
        prev.map(s => s.id === saleId ? { ...s, status: "COMPLETED" } : s)
      );
      setVerificationCodes(prev => {
        const copy = { ...prev };
        delete copy[saleId];
        return copy;
      });
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [saleId]: err.message }));
    } finally {
      setLoadingIds(prev => ({ ...prev, [saleId]: false }));
    }
  };

  const getStatusDetails = (status: string, addressId: number | null) => {
    const isShipping = addressId !== null;
    switch (status) {
      case "PAID":
        return {
          label: isShipping ? "À expédier" : "À remettre",
          colorClass: "text-brand-primary border-brand-primary/20 bg-brand-primary/5",
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case "SHIPPED":
        return {
          label: "Expédié - En cours",
          colorClass: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
          icon: <Truck className="w-3.5 h-3.5" />
        };
      case "DELIVERED":
        return {
          label: "Livré - En attente",
          colorClass: "text-indigo-400 border-indigo-400/20 bg-indigo-400/5",
          icon: <Package className="w-3.5 h-3.5" />
        };
      case "COMPLETED":
        return {
          label: "Vente finalisée",
          colorClass: "text-brand-accent border-brand-accent/20 bg-brand-accent/5",
          icon: <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
        };
      case "DISPUTED":
        return {
          label: "Litige déclaré",
          colorClass: "text-red-500 border-red-500/20 bg-red-500/5",
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: status,
          colorClass: "text-zinc-400 border-white/5 bg-white/2",
          icon: <Info className="w-3.5 h-3.5" />
        };
    }
  };

  return (
    <div className="space-y-8 pb-12 relative z-10">
      
      {/* 📊 Section Indicateurs Financiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA Finalisé */}
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl group hover:border-brand-accent/30 transition-all">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <TrendingUp className="w-16 h-16 text-brand-accent" />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Chiffre d'Affaires</p>
          <p className="text-3xl font-black text-white leading-none tracking-tight">{completedSalesTotal.toFixed(2)} €</p>
          <div className="flex items-center gap-1 mt-3.5 text-[9px] font-bold text-zinc-400">
            <span className="text-brand-accent">{completedSalesCount}</span> {completedSalesCount > 1 ? "ventes finalisées" : "vente finalisée"}
          </div>
        </div>

        {/* Fonds Sécurisés (Séquestre Actif) */}
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl group hover:border-brand-primary/30 transition-all">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <ShieldCheck className="w-16 h-16 text-brand-primary" />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Fonds en Séquestre</p>
          <p className="text-3xl font-black text-brand-primary leading-none tracking-tight">{escrowSalesTotal.toFixed(2)} €</p>
          <div className="flex items-center gap-1 mt-3.5 text-[9px] font-bold text-zinc-400">
            <span className="text-brand-primary animate-pulse">●</span> Transac. sécurisées en cours
          </div>
        </div>

        {/* Ventes Actives */}
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Package className="w-16 h-16 text-zinc-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Ventes en cours</p>
          <p className="text-3xl font-black text-white leading-none tracking-tight">{activeSalesCount}</p>
          <div className="flex items-center gap-1 mt-3.5 text-[9px] font-bold text-zinc-400">
            <span>📦 En attente de livraison/remise</span>
          </div>
        </div>

        {/* Taux de Réussite */}
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-md relative overflow-hidden shadow-2xl group hover:border-brand-accent/30 transition-all">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <CheckCircle2 className="w-16 h-16 text-brand-accent" />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Taux d'Expédition</p>
          <p className="text-3xl font-black text-white leading-none tracking-tight">100 %</p>
          <div className="flex items-center gap-1 mt-3.5 text-[9px] font-bold text-emerald-400">
            <span>✓ Aucun colis perdu</span>
          </div>
        </div>
      </div>

      {/* 📦 Liste des Ventes */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-1">
          Détails des Ventes
        </h2>

        {sales.length === 0 ? (
          <div className="p-12 rounded-[2.5rem] border border-white/5 bg-zinc-950/50 flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-sm font-bold text-zinc-400">Aucune vente enregistrée pour le moment.</p>
            <p className="text-xs text-zinc-650 mt-1">Publiez votre premier équipement sportif pour lancer votre activité.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => {
              const hasAddress = sale.addressId !== null;
              const status = getStatusDetails(sale.status, sale.addressId);
              const isLoading = loadingIds[sale.id] || false;
              const errorMessage = errors[sale.id];

              return (
                <div 
                  key={sale.id}
                  className="p-5 rounded-[2.5rem] bg-zinc-950/80 border border-white/10 backdrop-blur-md flex flex-col gap-5 hover:border-white/20 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Infos Produit */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden relative shrink-0">
                        {sale.product?.media?.[0] ? (
                          <img 
                            src={sale.product.media[0]} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-zinc-550 uppercase tracking-widest block mb-0.5">
                          {sale.product?.category || "Matériel"}
                        </span>
                        <h3 className="font-bold text-white text-base truncate max-w-xs sm:max-w-md">
                          {sale.product?.title || "Équipement sportif"}
                        </h3>
                        <p className="text-xs font-black text-brand-accent mt-0.5">
                          {sale.totalPrice.toFixed(2)} €
                        </p>
                      </div>
                    </div>

                    {/* Statut Badge */}
                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                      <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.colorClass}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Infos Acheteur & Mode de livraison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-bold text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-650">Acheteur :</span>
                      {sale.buyer?.profile_picture && (
                        <img 
                          src={sale.buyer.profile_picture} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover border border-white/10" 
                        />
                      )}
                      <span className="text-white">{sale.buyer?.username || "Acheteur anonyme"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-650">Livraison :</span>
                      <span className="text-white flex items-center gap-1.5">
                        {hasAddress ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Colis Postal sécurisé</span>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-3.5 h-3.5 text-brand-accent" />
                            <span>Remise en mains propres</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Saisie de code main propre */}
                  {!hasAddress && sale.status === "PAID" && (
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-brand-accent/20 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                        <QrCode className="w-16 h-16 text-brand-accent" />
                      </div>
                      <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Validation de la remise physique</p>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        Saisissez le code de sécurité unique fourni de vive voix par l'acheteur pour débloquer immédiatement vos fonds en séquestre.
                      </p>
                      <div className="flex gap-2 relative z-10 max-w-sm mt-1">
                        <input
                          type="text"
                          maxLength={9}
                          value={verificationCodes[sale.id] || ""}
                          onChange={(e) => setVerificationCodes(prev => ({ ...prev, [sale.id]: e.target.value.toUpperCase() }))}
                          placeholder="PA-XXXXXX"
                          disabled={isLoading}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-center font-mono font-black text-sm text-white focus:outline-none focus:border-brand-accent disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleVerifyCode(sale.id)}
                          disabled={isLoading || !verificationCodes[sale.id]?.trim()}
                          className="bg-brand-accent hover:brightness-110 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            "Valider"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Messages d'erreur locaux */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Actions de Vente */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                    <span className="text-[9px] text-zinc-550 font-bold">
                      Vendu le {new Date(sale.invoiceDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Lien Chat */}
                      {sale.conversationId && (
                        <Link href={`/messages/${sale.conversationId}`}>
                          <button className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-white/10 hover:border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">
                            <MessageSquare className="w-4 h-4 text-zinc-500" />
                            <span>Discussion</span>
                          </button>
                        </Link>
                      )}

                      {/* Télécharger le bordereau postal */}
                      {hasAddress && sale.status === "PAID" && (
                        <Link 
                          href={`/api/invoices/${sale.id}/shipping-label`}
                          target="_blank"
                        >
                          <button className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-white/10 hover:border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">
                            <FileText className="w-4 h-4 text-zinc-500" />
                            <span>Bordereau Colissimo</span>
                          </button>
                        </Link>
                      )}

                      {/* Marquer expédié pour les colis */}
                      {hasAddress && sale.status === "PAID" && (
                        <button
                          onClick={() => handleMarkAsShipped(sale.id)}
                          disabled={isLoading}
                          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:brightness-110 text-white border border-brand-primary/20 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-brand-primary/10 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <>
                              <Truck className="w-4 h-4 text-white" />
                              <span>Marquer expédié</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
