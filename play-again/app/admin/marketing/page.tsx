"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import PromoCodeForm from "./components/PromoCodeForm";
import PromoCampaignList from "./components/PromoCampaignList";

export interface PromoCodeAdmin {
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
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

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

  // Création d'un coupon (returns true on success to let child component reset form fields)
  const handleCreateCoupon = async (couponData: {
    code: string;
    discountPercent: string;
    minBasketAmount: string;
    expiresAt: string;
    categoryId: string;
    typeId: string;
  }) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/marketing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponData.code,
          discountPercent: couponData.discountPercent,
          minBasketAmount: couponData.minBasketAmount,
          expiresAt: couponData.expiresAt,
          categoryId: couponData.categoryId || null,
          typeId: couponData.typeId || null,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return false;
      }

      showNotification("success", data.message);
      fetchCoupons();
      return true;
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de création du coupon.");
      return false;
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
        body: JSON.stringify({ couponId }),
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
    <div className="flex-1 flex flex-col space-y-8 relative text-left">
      {/* 🔔 Toast notifications */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
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
        <PromoCodeForm
          categoriesList={categoriesList}
          actionLoading={actionLoading}
          onCreateCoupon={handleCreateCoupon}
        />

        {/* 📋 Visualisateur & Campagnes existantes (2/3) */}
        <div className="lg:col-span-2">
          <PromoCampaignList
            coupons={coupons}
            loading={loading}
            broadcastLoadingId={broadcastLoadingId}
            onBroadcastCoupon={handleBroadcastCoupon}
          />
        </div>
      </div>
    </div>
  );
}
