"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  Send, 
  Plus, 
  Calendar, 
  DollarSign, 
  Percent, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock,
  Sparkles
} from "lucide-react";

interface PromoCodeAdmin {
  id: number;
  code: string;
  discountPercent: number;
  minBasketAmount: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function MarketingAdminPage() {
  // --- ÉTATS ---
  const [coupons, setCoupons] = useState<PromoCodeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [broadcastLoadingId, setBroadcastLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Formulaire de création
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [minBasketAmount, setMinBasketAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // --- CHARGEMENT DES COUPONS & SEGMENTS ---
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/marketing/coupons");
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger les codes promos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/marketing/categories");
      const data = await res.json();
      if (data.categories) {
        setCategoriesList(data.categories);
      }
    } catch (e) {
      console.error("Error loading categories:", e);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, []);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Création d'un coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountPercent || !minBasketAmount || !expiresAt) {
      showNotification("error", "Veuillez remplir tous les champs du formulaire.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/marketing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountPercent,
          minBasketAmount,
          expiresAt,
          categoryId: selectedCategory || null,
          typeId: selectedType || null
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      // Réinitialiser le formulaire
      setCode("");
      setDiscountPercent("");
      setMinBasketAmount("");
      setExpiresAt("");
      setSelectedCategory("");
      setSelectedType("");

      // Recharger la liste
      fetchCoupons();
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de création du coupon.");
    } finally {
      setActionLoading(false);
    }
  };

  // Diffusion globale du coupon
  const handleBroadcastCoupon = async (couponId: number) => {
    try {
      setBroadcastLoadingId(couponId);
      const res = await fetch("/api/admin/marketing/coupons/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique lors de la diffusion.");
    } finally {
      setBroadcastLoadingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      
      {/* 🔔 Toast notifications */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* 🚀 En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Moteur de Codes Promos
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Générez des codes de réduction exclusifs et diffusez-les massivement auprès de vos membres par notification in-app en un clic.
        </p>
      </div>

      {/* 🛠️ Section Création (Grid double colonne) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Formulaire de création (1/3) */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Nouveau Code Promo</span>
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Nom du Code</label>
              <input
                type="text"
                placeholder="Ex: TENNIS2026, HOLIDAYS..."
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono font-bold"
              />
            </div>

            {/* Pourcentage de réduction */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Pourcentage de Réduction</label>
              <div className="relative flex items-center">
                <Percent className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Ex: 10"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Montant minimum d'achat */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Panier Minimum (€)</label>
              <div className="relative flex items-center">
                <DollarSign className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 50.00"
                  value={minBasketAmount}
                  onChange={(e) => setMinBasketAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Date d'expiration */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Date d'Expiration</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  onFocus={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
                />
                <style>{`
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                  }
                  input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                  }
                `}</style>
              </div>
            </div>

            {/* Restriction Catégorie */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Restriction Catégorie (Optionnel)</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedType(""); // reset type on category change
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
              >
                <option value="">Toutes les catégories</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Restriction Type de Produit (Affiché seulement si catégorie sélectionnée) */}
            {selectedCategory && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Restriction Type (Optionnel)</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
                >
                  <option value="">Tous les types d'articles</option>
                  {(categoriesList.find((cat) => cat.id === parseInt(selectedCategory))?.types || []).map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bouton de Soumission */}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Enregistrer le code</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 📋 Visualisateur & Campagnes existantes (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3">
              Historique des Campagnes Promotionnelles
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Extraction des campagnes...</span>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center p-16 text-slate-500 font-bold text-xs">
                Aucun code promotionnel enregistré pour le moment.
              </div>
            ) : (
              <div className="space-y-6">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) < new Date();
                  return (
                    <div 
                      key={coupon.id}
                      className="p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-all relative overflow-hidden group"
                    >
                      {/* Ticket Retro-Futuriste en CSS */}
                      <div className="relative flex items-center p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-dashed border-amber-500/30 text-amber-300 font-mono font-extrabold text-sm rounded-xl shrink-0 group-hover:scale-102 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.02)] overflow-hidden min-w-[160px] text-center justify-center">
                        {/* Pointillés latéraux simulant le poinçonnage du ticket */}
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#080B13] border-r border-white/5 rounded-full" />
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#080B13] border-l border-white/5 rounded-full" />
                        
                        <div className="space-y-0.5 z-10">
                          <span className="text-base font-black tracking-widest">{coupon.code}</span>
                          <span className="text-[10px] font-bold block text-amber-400/80">-{coupon.discountPercent}% RÉDUC</span>
                        </div>
                      </div>

                      {/* Conditions de validation du Coupon */}
                      <div className="flex-1 flex flex-col space-y-1 text-xs text-slate-300">
                        <p className="font-extrabold text-white">Conditions de validation :</p>
                        <p>Panier minimum requis : <span className="font-mono text-slate-100 font-extrabold">{parseFloat(coupon.minBasketAmount.toString()).toFixed(2)}€</span></p>
                        
                        {/* Badges de restriction de catégorie / type */}
                        {((coupon as any).category || (coupon as any).type) && (
                          <div className="flex flex-wrap gap-1.5 my-1">
                            {(coupon as any).category && (
                              <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                Catégorie : {(coupon as any).category.label}
                              </span>
                            )}
                            {(coupon as any).type && (
                              <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                Type : {(coupon as any).type.label}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {isExpired 
                              ? `Expiré le ${new Date(coupon.expiresAt).toLocaleDateString("fr-FR")}` 
                              : `Valide jusqu'au ${new Date(coupon.expiresAt).toLocaleDateString("fr-FR")}`}
                          </span>
                        </div>
                      </div>

                      {/* Bouton de Diffusion massive */}
                      <div className="shrink-0 w-full sm:w-auto">
                        {isExpired ? (
                          <div className="px-4 py-2 text-center text-red-400 bg-red-500/5 border border-red-500/15 text-[10px] font-black uppercase rounded-lg">
                            Coupon Expiré
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBroadcastCoupon(coupon.id)}
                            disabled={broadcastLoadingId === coupon.id}
                            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-95 text-black text-xs font-black px-4 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
                          >
                            {broadcastLoadingId === coupon.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                <span>Diffuser l'offre</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
