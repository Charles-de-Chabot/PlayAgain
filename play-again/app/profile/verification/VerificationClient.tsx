"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  Camera, 
  MapPin, 
  Mail, 
  Phone, 
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  FileText,
  Lock
} from "lucide-react";
import { uploadVerificationDocument } from "@/app/actions/verification";
import Link from "next/link";

interface VerificationClientProps {
  user: {
    id: number;
    email: string;
    phone: string | null;
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    stripeConnectId: string | null;
  };
  defaultAddress: {
    id: number;
    street_number: string | null;
    street_name: string;
    city: string;
    zip_code: string;
    country: string;
  } | null;
  latestRequest: {
    id: number;
    status: "PENDING" | "PROCESSING_AI" | "APPROVED" | "REJECTED";
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
    submittedAt: Date;
  } | null;
}

export function VerificationClient({ user, defaultAddress, latestRequest }: VerificationClientProps) {
  const router = useRouter();
  
  // États principaux
  const [currentRequest, setCurrentRequest] = useState(latestRequest);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Formulaire de coordonnées
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  // Formulaire d'adresse
  const [streetNumberInput, setStreetNumberInput] = useState("");
  const [streetNameInput, setStreetNameInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [countryInput, setCountryInput] = useState("");

  // Téléversement d'images (Nom de fichiers sécurisés)
  const [idCard1Url, setIdCard1Url] = useState<string | null>(null);
  const [idCard2Url, setIdCard2Url] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  // Prévisualisations locales (Blob URLs temporaires)
  const [idCard1Preview, setIdCard1Preview] = useState<string | null>(null);
  const [idCard2Preview, setIdCard2Preview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // États de chargement des uploads
  const [uploadingId1, setUploadingId1] = useState(false);
  const [uploadingId2, setUploadingId2] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Gérer l'upload de fichiers images
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id1" | "id2" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Définir l'état de chargement
    if (type === "id1") setUploadingId1(true);
    if (type === "id2") setUploadingId2(true);
    if (type === "selfie") setUploadingSelfie(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadVerificationDocument(formData);
      if (result.success && result.url) {
        const localPreviewUrl = URL.createObjectURL(file);
        if (type === "id1") {
          setIdCard1Url(result.url);
          setIdCard1Preview(localPreviewUrl);
        }
        if (type === "id2") {
          setIdCard2Url(result.url);
          setIdCard2Preview(localPreviewUrl);
        }
        if (type === "selfie") {
          setSelfieUrl(result.url);
          setSelfiePreview(localPreviewUrl);
        }
      } else {
        alert(result.error || "Échec de l'upload du fichier");
      }
    } catch (err: any) {
      alert(err.message || "Erreur de connexion lors du téléversement");
    } finally {
      if (type === "id1") setUploadingId1(false);
      if (type === "id2") setUploadingId2(false);
      if (type === "selfie") setUploadingSelfie(false);
    }
  };

  // Soumission de la demande à l'API
  const handleSubmit = async () => {
    if (!idCard1Url || !selfieUrl) {
      setSubmitError("Veuillez charger les photos obligatoires (Identité Photo 1 et Selfie).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/profile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submittedEmail: emailInput,
          submittedPhone: phoneInput,
          submittedStreetNumber: streetNumberInput || null,
          submittedStreetName: streetNameInput,
          submittedCity: cityInput,
          submittedZip: zipInput,
          submittedCountry: countryInput,
          idCardPhoto1Url: idCard1Url,
          idCardPhoto2Url: idCard2Url || null,
          selfieUrl: selfieUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la soumission");
      }

      // Recharger les données de la demande
      setCurrentRequest(data.request);
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire pour une nouvelle demande (ex: après un rejet)
  const handleReset = () => {
    setCurrentRequest(null);
    setStep(0);
    setEmailInput("");
    setPhoneInput("");
    setStreetNumberInput("");
    setStreetNameInput("");
    setCityInput("");
    setZipInput("");
    setCountryInput("");
    setIdCard1Url(null);
    setIdCard2Url(null);
    setSelfieUrl(null);
    setIdCard1Preview(null);
    setIdCard2Preview(null);
    setSelfiePreview(null);
    setSubmitError(null);
  };

  // --- RENDU CAS DE SUCCÈS (APPROVED) ---
  if (currentRequest?.status === "APPROVED") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-accent/30 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(198,255,52,0.1)] text-center space-y-6">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-brand-accent blur-[60px] opacity-25" />
        
        <div className="inline-flex w-20 h-20 rounded-full bg-brand-accent/10 border border-brand-accent/30 items-center justify-center text-brand-accent animate-bounce">
          <ShieldCheck className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic text-white">
            Votre profil est vérifié !
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Félicitations, vous possédez désormais le badge de confiance sur PlayAgain. Vos annonces sont mises en avant et visibles par toute la communauté.
          </p>
        </div>

        {user.stripeConnectId ? (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/50 border border-brand-accent/20 flex items-center gap-3 justify-center">
            <span className="text-brand-accent text-sm">🟢</span>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-accent italic">
              Compte bancaire certifié Stripe Connect lié
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-3">
            <p className="text-xs text-zinc-400 font-bold">
              Vous êtes vendeur ? Liez un compte Stripe Connect pour débloquer le versement de vos fonds.
            </p>
            <Link 
              href="/profile" 
              className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline"
            >
              Aller lier Stripe
            </Link>
          </div>
        )}

        <div className="pt-6">
          <Link 
            href="/profile" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU CAS EN COURS (PENDING / PROCESSING_AI) ---
  if (currentRequest?.status === "PENDING" || currentRequest?.status === "PROCESSING_AI") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-primary/30 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(125,56,255,0.1)] text-center space-y-8">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-brand-primary blur-[60px] opacity-20" />
        
        <div className="inline-flex w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 items-center justify-center text-brand-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">
            Vérification en cours d'analyse
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Nous avons bien reçu vos documents justificatifs. Notre équipe administrative examine vos coordonnées dans les plus brefs délais.
          </p>
        </div>

        {/* Dynamic visual progress stepper */}
        <div className="max-w-md mx-auto grid grid-cols-3 items-center relative gap-2 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary flex items-center justify-center text-brand-primary font-bold text-xs">
              ✓
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 text-center">Soumission</span>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-brand-primary to-zinc-800" />

          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-brand-primary/50 flex items-center justify-center text-brand-primary font-bold text-xs animate-pulse">
              ⚙️
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-white text-center">Analyse</span>
          </div>

          <div className="h-[2px] bg-zinc-800" />

          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-650 font-bold text-xs">
              🛡️
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 text-center">Certification</span>
          </div>
        </div>

        <div className="pt-6">
          <Link 
            href="/profile" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU CAS REFUSÉ (REJECTED) ---
  if (currentRequest?.status === "REJECTED") {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-red-500/20 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)] text-center space-y-6">
        <div className="inline-flex w-16 h-16 rounded-full bg-red-550/10 border border-red-550/30 items-center justify-center text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight italic text-white">
            Demande de vérification refusée
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Malheureusement, votre dossier n'a pas pu être validé en raison de l'incohérence suivante :
          </p>
        </div>

        {/* Motif du rejet administratif */}
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-left space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
            Motif de l'administrateur :
          </span>
          <p className="text-xs font-bold text-red-200">
            {currentRequest.rejectionReason || "Vos documents ou coordonnées ne correspondent pas aux critères de conformité."}
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleReset}
            className="px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-black transition-all font-black uppercase tracking-widest text-[10px]"
          >
            Soumettre une nouvelle demande
          </button>
          
          <Link 
            href="/profile" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 transition-all font-bold uppercase tracking-widest text-[10px] text-white"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU FORMULAIRE (SI PAS DE DEMANDE OU APRES RESET) ---

  // UX Bloquante : Si l'utilisateur n'a pas configuré d'adresse par défaut (principale)
  if (!defaultAddress) {
    return (
      <div className="w-full p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-brand-primary/20 backdrop-blur-2xl relative overflow-hidden shadow-2xl text-center space-y-6">
        <div className="inline-flex w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 items-center justify-center text-brand-primary">
          <MapPin className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white">
            Adresse principale manquante
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto font-medium">
            Pour certifier votre profil, vous devez d'abord renseigner une adresse principale (par défaut) dans vos paramètres.
          </p>
        </div>

        <div className="pt-6">
          <Link 
            href="/profile/addresses" 
            className="px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-black transition-all font-black uppercase tracking-widest text-[10px] inline-block shadow-[0_0_20px_rgba(125,56,255,0.3)] hover:shadow-[0_0_25px_rgba(125,56,255,0.5)] duration-300"
          >
            Configurer mon adresse principale
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative space-y-8">
      {/* Form header */}
      {step > 0 ? (
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white">
              Certification d'identité
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              Étape {step} sur 4
            </p>
          </div>
          <div className="h-2 w-24 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="border-b border-white/15 pb-6 text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 items-center justify-center text-brand-primary animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic text-white">
              Devenir membre certifié
            </h1>
            <p className="text-xs text-zinc-400 font-medium max-w-md mx-auto">
              Renforcez la confiance au sein de la communauté PlayAgain en certifiant officiellement votre identité.
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* --- ÉTAPE 0 : PAGE EXPLICATIVE D'ACCUEIL --- */}
      {step === 0 && (
        <div className="space-y-8 animate-fade-in">
          {/* Section 1: Pourquoi certifier ? */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
              Pourquoi certifier votre profil ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-brand-primary/20 hover:bg-zinc-900/60 transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm">
                  🛡️
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Badge de confiance</h4>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Obtenez un badge vert visible sur votre profil et vos annonces pour prouver votre authenticité aux acheteurs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-brand-accent/20 hover:bg-zinc-900/60 transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm">
                  🚀
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Visibilité accrue</h4>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Vos annonces bénéficient d'un boost de visibilité et sont mises en avant dans les résultats de recherche.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2 hover:border-white/10 hover:bg-zinc-900/60 transition-all duration-300">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-sm">
                  🔒
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Sécurité totale</h4>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  Participez à la création d'un espace d'échange sain et protégé contre les usurpations et les fraudes.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Le processus */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-primary" />
              Le processus de certification
            </h3>
            
            <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-5">
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Le parcours se compose de <strong>4 étapes rapides</strong> et prend moins de <strong>3 minutes</strong> à remplir. Une fois soumis, notre équipe vérifie vos documents sous <strong>24 à 48 heures</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                {/* Etape 1 */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white block">Contact</span>
                    <span className="text-[8px] text-zinc-500 font-bold">E-mail & portable</span>
                  </div>
                </div>

                {/* Etape 2 */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white block">Adresse</span>
                    <span className="text-[8px] text-zinc-500 font-bold">Résidence principale</span>
                  </div>
                </div>

                {/* Etape 3 */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white block">Identité</span>
                    <span className="text-[8px] text-zinc-500 font-bold">Pièce d'identité</span>
                  </div>
                </div>

                {/* Etape 4 */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold text-xs">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white block">Selfie</span>
                    <span className="text-[8px] text-zinc-500 font-bold">Mention manuscrite</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Documents à prévoir */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-primary italic flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-accent" />
              Documents et éléments à prévoir
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-4 items-start hover:border-white/10 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 text-lg">
                  🪪
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Pièce d'identité valide</h4>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    Une photo très nette et lisible de votre <strong>Carte Nationale d'Identité</strong> (recto + verso), votre <strong>Passeport</strong> ou votre <strong>Permis de conduire</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-4 items-start hover:border-white/10 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0 mt-0.5 text-lg">
                  📝
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Feuille & stylo pour le selfie</h4>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    Vous devrez vous prendre en photo (selfie) tout en tenant une feuille blanche sur laquelle vous aurez écrit de façon bien lisible la mention manuscrite exacte : <strong>"Play Again"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RGPD Disclaimer */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 flex gap-3 items-center hover:border-white/10 transition-colors duration-300">
            <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Vos documents sont cryptés et stockés en toute sécurité. Ils sont uniquement utilisés par notre service de modération pour valider votre compte et ne seront jamais partagés ni visibles publiquement.
            </p>
          </div>
        </div>
      )}

      {/* --- ÉTAPE 1 : COORDONNÉES DE CONTACT --- */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
              1. Coordonnées de contact
            </h3>
            <p className="text-xs text-zinc-400 font-bold">
              Ces coordonnées doivent correspondre exactement à votre compte PlayAgain pour que l'identité puisse être certifiée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Adresse e-mail du profil
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-650" />
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <span className="text-[9px] text-zinc-550 block font-medium">
                Saisissez le même e-mail que celui de vos coordonnées de profil.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-zinc-650" />
                <input 
                  type="tel" 
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <span className="text-[9px] text-zinc-550 block font-medium">
                Saisissez le même numéro que celui de vos coordonnées de profil.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Pour modifier définitivement les coordonnées de votre profil, veuillez d'abord le faire dans vos paramètres de compte globaux avant de valider.
            </p>
          </div>
        </div>
      )}

      {/* --- ÉTAPE 2 : ADRESSE DE RÉSIDENCE --- */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
              2. Adresse principale de résidence
            </h3>
            <p className="text-xs text-zinc-400 font-bold">
              Entrer votre adresse. Elle doit correspondre exactement a votre adresse principal sur Play Again.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                  Numéro
                </label>
                <input 
                  type="text" 
                  value={streetNumberInput}
                  onChange={(e) => setStreetNumberInput(e.target.value)}
                  placeholder="12bis"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div className="col-span-3 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                  Nom de la rue
                </label>
                <input 
                  type="text" 
                  value={streetNameInput}
                  onChange={(e) => setStreetNameInput(e.target.value)}
                  placeholder="Avenue des Champs Elysées"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                  Code Postal
                </label>
                <input 
                  type="text" 
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  placeholder="75008"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                  Ville
                </label>
                <input 
                  type="text" 
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Paris"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Pays
              </label>
              <input 
                type="text" 
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                placeholder="France"
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white placeholder-zinc-700 focus:outline-none focus:border-brand-primary/50 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- ÉTAPE 3 : PIÈCE D'IDENTITÉ (1 OU 2 IMAGES) --- */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
              3. Pièce d'identité (Recto / Verso)
            </h3>
            <p className="text-xs text-zinc-400 font-bold">
              Téléchargez une photo lisible de votre pièce d'identité (Passeport, CNI, ou Permis de conduire). Vous pouvez envoyer jusqu'à 2 photos maximum (ex: Recto + Verso).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Zone Photo 1 (Obligatoire) */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Photo 1 : Recto ou Page principale (Obligatoire)
              </span>
              
              <div className="relative h-44 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
                {uploadingId1 ? (
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
                  </div>
                ) : idCard1Preview ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={idCard1Preview} 
                      alt="Identité Recto" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIdCard1Url(null); setIdCard1Preview(null); }}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                    <UploadCloud className="w-8 h-8 text-zinc-700" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir une image</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "id1")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Zone Photo 2 (Optionnelle) */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Photo 2 : Verso s'il existe (Optionnel)
              </span>
              
              <div className="relative h-44 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
                {uploadingId2 ? (
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
                  </div>
                ) : idCard2Preview ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={idCard2Preview} 
                      alt="Identité Verso" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIdCard2Url(null); setIdCard2Preview(null); }}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                    <UploadCloud className="w-8 h-8 text-zinc-700" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir une image (Verso)</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "id2")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- ÉTAPE 4 : SELFIE MANUSCRIT --- */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-primary italic">
              4. Selfie avec preuve d'inscription
            </h3>
            <p className="text-xs text-zinc-400 font-bold">
              Prenez un selfie en tenant une feuille de papier avec l'inscription manuscrite exacte : "Play Again".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Visual Guide / Checklist */}
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-accent block animate-pulse">
                💡 Consignes pour être validé :
              </span>
              <ul className="space-y-2 text-[11px] text-zinc-400 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent">✓</span>
                  <span>Votre visage doit être entièrement découvert (pas de lunettes de soleil, pas de casquette).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent">✓</span>
                  <span>Le papier écrit "Play Again" doit être parfaitement lisible, proche de votre visage, sans le cacher.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent">✓</span>
                  <span>La photo doit être nette et bien éclairée.</span>
                </li>
              </ul>
            </div>

            {/* Selfie Upload box */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Votre photo Selfie (Obligatoire)
              </span>
              
              <div className="relative h-48 rounded-2xl border-2 border-dashed border-white/15 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-4">
                {uploadingSelfie ? (
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Envoi en cours...</p>
                  </div>
                ) : selfiePreview ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={selfiePreview} 
                      alt="Selfie de vérification" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelfieUrl(null); setSelfiePreview(null); }}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black p-1.5 rounded-full text-zinc-400 hover:text-white transition-all z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-zinc-550 relative z-10 w-full h-full flex flex-col justify-center items-center">
                    <Camera className="w-8 h-8 text-zinc-700" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choisir ou Prendre une photo</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">JPEG, PNG ou WEBP max 5MB</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, "selfie")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- FORM FOOTER / BUTTONS --- */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        {step === 0 ? (
          <>
            <Link 
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au profil
            </Link>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] text-[10px] font-black uppercase tracking-widest text-black transition-all duration-300"
            >
              Commencer la certification
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
            ) : step === 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
            ) : (
              <div /> // Espacement vide pour aligner à droite
            )}

            {step < 4 ? (
              <button 
                type="button"
                onClick={() => {
                  if (step === 1 && (!emailInput || !phoneInput)) {
                    setSubmitError("Veuillez saisir votre email et votre numéro de téléphone.");
                    return;
                  }
                  if (step === 2 && (!streetNameInput || !cityInput || !zipInput || !countryInput)) {
                    setSubmitError("Veuillez renseigner tous les champs obligatoires de l'adresse.");
                    return;
                  }
                  if (step === 3 && !idCard1Url) {
                    setSubmitError("Veuillez charger au moins une photo de votre pièce d'identité.");
                    return;
                  }
                  setSubmitError(null);
                  setStep(step + 1);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-white/10 hover:border-white/20 text-[9px] font-black uppercase tracking-widest text-brand-accent transition-all duration-300 shadow-[0_0_15px_rgba(198,255,52,0.03)]"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || uploadingId1 || uploadingId2 || uploadingSelfie || !idCard1Url || !selfieUrl}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-zinc-900 border border-brand-primary/20 hover:shadow-[0_0_20px_rgba(125,56,255,0.4)] text-[10px] font-black uppercase tracking-widest text-black disabled:text-zinc-650 transition-all duration-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Soumission...
                  </>
                ) : (
                  "Envoyer mon dossier"
                )}
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}
