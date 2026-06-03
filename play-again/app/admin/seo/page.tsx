"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import SeoBaliseForm from "./components/SeoBaliseForm";
import GoogleSerpSimulator from "./components/GoogleSerpSimulator";

interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
}

interface SeoConfigs {
  [key: string]: SeoConfig;
}

export default function SeoAdminPage() {
  // --- ÉTATS ---
  const [configs, setConfigs] = useState<SeoConfigs>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("home");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Formulaire d'édition
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  // --- CHARGEMENT DES CONFIGS ---
  const fetchSeo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      if (data.configs) {
        setConfigs(data.configs);

        // Charger la page sélectionnée initialement
        const current = data.configs[selectedPage];
        if (current) {
          setTitle(current.title);
          setDescription(current.description);
          setKeywords(current.keywords);
        }
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger la console SEO.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  // Mettre à jour le formulaire lorsque la page sélectionnée change
  useEffect(() => {
    const current = configs[selectedPage];
    if (current) {
      setTitle(current.title);
      setDescription(current.description);
      setKeywords(current.keywords);
    } else {
      setTitle("");
      setDescription("");
      setKeywords("");
    }
  }, [selectedPage, configs]);

  // --- ACTIONS ---
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !keywords.trim()) {
      showNotification("error", "Veuillez remplir tous les champs avant de sauvegarder.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: selectedPage,
          title,
          description,
          keywords,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);

      // Mettre à jour l'état local
      setConfigs((prev) => ({
        ...prev,
        [selectedPage]: { title, description, keywords },
      }));
    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de sauvegarde.");
    } finally {
      setActionLoading(false);
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
          Console SEO & Métadonnées Dynamiques
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Ajustez le titre de vos pages, les balises de descriptions et analysez en temps réel leur rendu dans les résultats de recherche Google.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Synchronisation avec les indexeurs...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* A. Formulaire d'édition de balises (3/5) */}
          <SeoBaliseForm
            selectedPage={selectedPage}
            onChangePage={setSelectedPage}
            title={title}
            onChangeTitle={setTitle}
            description={description}
            onChangeDescription={setDescription}
            keywords={keywords}
            onChangeKeywords={setKeywords}
            actionLoading={actionLoading}
            onSaveSeo={handleSaveSeo}
          />

          {/* B. Google SERP Simulator Preview (2/5) */}
          <div className="lg:col-span-2">
            <GoogleSerpSimulator
              selectedPage={selectedPage}
              title={title}
              description={description}
            />
          </div>
        </div>
      )}
    </div>
  );
}
