"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";

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
          keywords
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      
      // Mettre à jour l'état local
      setConfigs(prev => ({
        ...prev,
        [selectedPage]: { title, description, keywords }
      }));

    } catch (e) {
      console.error(e);
      showNotification("error", "Erreur technique de sauvegarde.");
    } finally {
      setActionLoading(false);
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
        /* 🗺️ Workspace SEO Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* A. Formulaire d'édition de balises (3/5) */}
          <div className="lg:col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Balises SEO HTML</span>
              </h2>

              {/* Sélecteur de page cible */}
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all font-semibold cursor-pointer"
              >
                <option value="home">Page d'Accueil (Home)</option>
                <option value="tennis">Catégorie Tennis</option>
                <option value="padel">Catégorie Padel</option>
                <option value="golf">Catégorie Golf</option>
              </select>
            </div>

            <form onSubmit={handleSaveSeo} className="space-y-4 text-xs">
              
              {/* Balise Titre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Balise Title (&lt;title&gt;)</label>
                  <span className={`text-[9px] font-mono font-bold ${
                    title.length > 60 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {title.length} / 60 char (Recommandé)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Saisissez le titre SEO de la page..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={75}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>

              {/* Balise Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Meta Description (Snippet)</label>
                  <span className={`text-[9px] font-mono font-bold ${
                    description.length > 160 ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {description.length} / 160 char (Recommandé)
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Saisissez la description du site pour les moteurs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Mots clés */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Keywords (Séparés par des virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: sport, tennis, occasion..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>

              {/* Enregistrer */}
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Mettre à jour l'index SEO</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* B. Google SERP Simulator Preview (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#10121A] border border-white/[0.06] rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
              
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Simulateur Google SERP (Desktop)</span>
              </h3>

              {/* Rendu Google Classique en mode sombre */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl flex flex-col space-y-3 select-none leading-relaxed text-left">
                
                {/* Fil d'Ariane URL */}
                <div className="flex items-center gap-1.5 text-xs text-[#b8b8b8] font-normal truncate">
                  <span>https://playagain.fr</span>
                  <ChevronRight className="w-3 h-3 text-[#777]" />
                  <span className="font-semibold text-slate-400">{selectedPage}</span>
                </div>

                {/* Titre Bleu standard de Google au survol */}
                <h4 className="text-lg font-normal text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
                  {title || "Saisissez un titre pour visualiser..."}
                </h4>

                {/* Meta description grise de Google */}
                <p className="text-[13px] text-[#bdc1c6] font-normal leading-relaxed line-clamp-2">
                  {description || "Saisissez une description attractive pour attirer l'oeil de l'internaute dans les résultats du moteur."}
                </p>

              </div>

              {/* Conseils SEO Rapides */}
              <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl space-y-2.5 text-xs text-slate-400">
                <h4 className="font-extrabold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>Règles d'indexation optimales</span>
                </h4>
                <ul className="list-disc list-inside space-y-1.5 font-medium leading-relaxed">
                  <li>Le titre principal doit contenir les mots-clés stratégiques en début de phrase.</li>
                  <li>La description doit inclure un appel à l'action clair (Ex: "Découvrez", "Achetez").</li>
                  <li>Le taux de clic (CTR) augmente de <span className="text-emerald-400 font-bold">+18%</span> si le prix ou la mention "Certifié" apparaît dans le titre.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
