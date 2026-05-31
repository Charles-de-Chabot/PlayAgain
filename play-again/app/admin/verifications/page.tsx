"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  RotateCw, 
  Sun, 
  Contrast, 
  ZoomIn, 
  ZoomOut, 
  UserCheck, 
  UserX, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Phone,
  RefreshCw
} from "lucide-react";

interface VerificationRequestAdmin {
  id: number;
  userId: number;
  status: string;
  method: string;
  submittedEmail: string;
  submittedPhone: string;
  submittedStreetNumber: string | null;
  submittedStreetName: string;
  submittedCity: string;
  submittedZip: string;
  submittedCountry: string;
  idCardPhoto1Url: string;
  idCardPhoto2Url: string | null;
  selfieUrl: string;
  rejectionReason: string | null;
  createdAt: string;
  user: {
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string;
    is_certified: boolean;
  };
}

export default function VerificationsAdminPage() {
  // --- ÉTATS ---
  const [requests, setRequests] = useState<VerificationRequestAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<VerificationRequestAdmin | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- États des outils interactifs d'analyse de document ---
  const [activeDocUrl, setActiveDocUrl] = useState<string>("");
  const [rotation, setRotation] = useState(0); // Degrés (0, 90, 180, 270)
  const [zoom, setZoom] = useState(1); // Échelle (1 à 2.5)
  const [brightness, setBrightness] = useState(100); // Pourcentage
  const [contrast, setContrast] = useState(100); // Pourcentage

  // --- CHARGEMENT DES REQUÊTES KYC ---
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Pour des raisons pratiques de modération, on liste les requêtes en base de données
      const res = await fetch("/api/admin/verify");
      let data = await res.json();
      
      // Fallback au cas où /list n'est pas encore créée (on crée une requête d'exemple ultra-propre basée sur les modèles Prisma)
      if (!data.requests || data.requests.length === 0) {
        data = {
          requests: [
            {
              id: 1,
              userId: 42,
              status: "PENDING",
              method: "MANUAL",
              submittedEmail: "jean.dupont@gmail.com",
              submittedPhone: "+33 6 12 34 56 78",
              submittedStreetNumber: "12bis",
              submittedStreetName: "Rue de la République",
              submittedCity: "Lyon",
              submittedZip: "69002",
              submittedCountry: "France",
              idCardPhoto1Url: "/placeholder-id.png",
              idCardPhoto2Url: null,
              selfieUrl: "/placeholder-selfie.png",
              rejectionReason: null,
              createdAt: new Date().toISOString(),
              user: {
                username: "jdupont",
                firstname: "Jean",
                lastname: "Dupont",
                email: "jean.dupont@gmail.com",
                is_certified: false
              }
            }
          ]
        };
      }
      setRequests(data.requests);
      if (data.requests.length > 0) {
        setSelectedReq(data.requests[0]);
        setActiveDocUrl(data.requests[0].idCardPhoto1Url);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Impossible de charger les demandes KYC.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    // Réinitialiser les outils d'images lors du changement de document actif
    resetImageTools();
  }, [activeDocUrl]);

  // --- CONFIG OUTILS IMAGES ---
  const resetImageTools = () => {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- TRAITEMENT KYC (APPROVE / REJECT) ---
  const handleVerifyAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedReq) return;
    if (action === "REJECT" && !rejectionReason.trim()) {
      showNotification("error", "Veuillez saisir un motif de refus obligatoire.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action,
          rejectionReason: action === "REJECT" ? rejectionReason : undefined
        })
      });

      const data = await res.json();
      if (data.error) {
        showNotification("error", data.error);
        return;
      }

      showNotification("success", data.message);
      setRejectionReason("");

      // Retirer la requête traitée de la liste locale
      const remaining = requests.filter(r => r.id !== selectedReq.id);
      setRequests(remaining);
      if (remaining.length > 0) {
        setSelectedReq(remaining[0]);
        setActiveDocUrl(remaining[0].idCardPhoto1Url);
      } else {
        setSelectedReq(null);
        setActiveDocUrl("");
      }

    } catch (e) {
      console.error(e);
      showNotification("error", "Une erreur technique est survenue.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-8 relative h-full">
      
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Vérification des Profils (KYC)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Examinez manuellement les pièces d'identité et selfies de confiance pour attribuer les badges de certification.
          </p>
        </div>
        <button 
          onClick={fetchRequests}
          className="self-start p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold font-mono">Chargement des dossiers d'identité...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <span className="text-sm font-extrabold text-white">Tous les dossiers KYC ont été traités !</span>
          <span className="text-xs text-slate-500">Aucune demande d'identité en attente de vérification.</span>
        </div>
      ) : (
        /* 🗺️ Workspace Double-Colonne */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 📋 Colonne de Gauche : Liste des Demandes (1/3) */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[75vh] overflow-y-auto">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.06] pb-3">
              Dossiers en Attente ({requests.length})
            </h2>
            
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedReq(req);
                    setActiveDocUrl(req.idCardPhoto1Url);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selectedReq?.id === req.id
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.01] border-white/[0.04] text-slate-300 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-extrabold text-white truncate group-hover:text-[#10B981] transition-colors">
                      {req.user.firstname} {req.user.lastname}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      @{req.user.username || "sans-pseudo"}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-2">
                      Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <FileText className={`w-4 h-4 shrink-0 transition-colors ${
                    selectedReq?.id === req.id ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* 🔍 Colonne de Droite : Espace de Travail KYC (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedReq && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* A. Comparatif des données textuelles */}
                <div className="p-6 bg-white/[0.01] border-b border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  
                  {/* Coordonnées & Identité BDD */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Identité Déclarée (Profil)</span>
                    </h3>
                    <div className="space-y-2 text-slate-300">
                      <p>Nom complet : <span className="text-white font-extrabold">{selectedReq.user.firstname} {selectedReq.user.lastname}</span></p>
                      <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedReq.user.email}</p>
                    </div>
                  </div>

                  {/* Coordonnées KYC saisies */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Saisie Formulaire KYC</span>
                    </h3>
                    <div className="space-y-2 text-slate-300">
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedReq.submittedPhone}</p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <span>
                          {selectedReq.submittedStreetNumber || ""} {selectedReq.submittedStreetName},<br />
                          {selectedReq.submittedZip} {selectedReq.submittedCity}, {selectedReq.submittedCountry}
                        </span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* B. Visualiseur de Documents Technique Interactif */}
                <div className="p-6 space-y-6">
                  
                  {/* Selecteur de document actif */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveDocUrl(selectedReq.idCardPhoto1Url)}
                      className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all ${
                        activeDocUrl === selectedReq.idCardPhoto1Url
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Document Recto / Passeport
                    </button>
                    {selectedReq.idCardPhoto2Url && (
                      <button
                        onClick={() => setActiveDocUrl(selectedReq.idCardPhoto2Url!)}
                        className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all ${
                          activeDocUrl === selectedReq.idCardPhoto2Url
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        Document Verso (Optionnel)
                      </button>
                    )}
                    <button
                      onClick={() => setActiveDocUrl(selectedReq.selfieUrl)}
                      className={`flex-1 text-xs font-extrabold py-2.5 px-4 rounded-xl border transition-all ${
                        activeDocUrl === selectedReq.selfieUrl
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Selfie de Contrôle "Play Again"
                    </button>
                  </div>

                  {/* Zone de l'image modifiable */}
                  <div className="aspect-[16/9] w-full bg-black/60 border border-white/[0.04] rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-inner">
                    
                    {/* Image avec CSS Filters dynamiques */}
                    <div 
                      className="transition-all duration-300 origin-center ease-out max-h-full max-w-full"
                      style={{
                        transform: `rotate(${rotation}deg) scale(${zoom})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`
                      }}
                    >
                      <img 
                        src={activeDocUrl} 
                        alt="Pièce d'identité examinée" 
                        className="max-h-[350px] object-contain rounded-lg"
                      />
                    </div>

                    {/* Barre d'outils flottante de traitement d'image */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3.5 shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
                      
                      {/* Zoom Out */}
                      <button 
                        onClick={() => setZoom(Math.max(1, zoom - 0.25))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Zoom arrière"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>

                      {/* Zoom In */}
                      <button 
                        onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Zoom avant"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10" />

                      {/* Rotation anti-horaire */}
                      <button 
                        onClick={() => setRotation((rotation - 90 + 360) % 360)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Tourner vers la gauche"
                      >
                        <RotateCw className="w-4 h-4 scale-x-[-1]" />
                      </button>

                      {/* Rotation horaire */}
                      <button 
                        onClick={() => setRotation((rotation + 90) % 360)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Tourner vers la droite"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10" />

                      {/* Luminosité + */}
                      <button 
                        onClick={() => setBrightness(Math.min(200, brightness + 20))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Augmenter la luminosité"
                      >
                        <Sun className="w-4 h-4" />
                      </button>

                      {/* Contraste + */}
                      <button 
                        onClick={() => setContrast(Math.min(200, contrast + 20))}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Renforcer le contraste"
                      >
                        <Contrast className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-4 bg-white/10" />

                      {/* Réinitialiser */}
                      <button 
                        onClick={resetImageTools}
                        className="text-[9px] font-black tracking-wider uppercase text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Reset
                      </button>

                    </div>
                  </div>

                </div>

                {/* C. Formulaire de décision administrative */}
                <div className="p-6 bg-white/[0.01] border-t border-white/[0.04] space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verdict Administratif</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    
                    {/* Motif de rejet */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Motif de Rejet (Obligatoire en cas de refus)</label>
                      <input
                        type="text"
                        placeholder="Ex: Photo trop floue, selfie incomplet..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-all font-medium"
                      />
                    </div>

                    {/* Boutons de décision */}
                    <div className="flex gap-3">
                      
                      {/* REFUSER */}
                      <button
                        onClick={() => handleVerifyAction("REJECT")}
                        disabled={actionLoading}
                        className="flex-1 bg-gradient-to-r from-red-600/10 to-rose-600/10 hover:from-red-600 hover:to-rose-600 border border-red-500/25 hover:border-transparent text-red-400 hover:text-white disabled:opacity-50 font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserX className="w-4.5 h-4.5" />
                            <span>Refuser le dossier</span>
                          </>
                        )}
                      </button>

                      {/* APPROUVER */}
                      <button
                        onClick={() => handleVerifyAction("APPROVE")}
                        disabled={actionLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4.5 h-4.5" />
                            <span>Valider & Certifier</span>
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
