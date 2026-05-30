"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Truck, 
  Handshake, 
  MapPin, 
  Plus, 
  Check, 
  Loader2, 
  ShieldCheck, 
  ArrowLeft, 
  Info,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";

// Initialisation de Stripe (Lazy-loaded sur le client)
const getStripePromise = (key: string) => loadStripe(key);

interface Address {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
}

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: string | number;
  is_shipping: boolean;
  user: {
    id: number;
    username: string;
  };
  media: Array<{ url: string }>;
  brand?: { label: string };
  category?: { label: string };
}

interface Buyer {
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
}

interface CheckoutClientProps {
  product: Product;
  initialAddresses: Address[];
  buyer: Buyer | null;
  stripePublishableKey: string;
}

export function CheckoutClient({
  product,
  initialAddresses,
  buyer,
  stripePublishableKey,
}: CheckoutClientProps) {
  const router = useRouter();
  const productPrice = Number(product.price);

  // --- États locaux ---
  const [isShipping, setIsShipping] = useState<boolean>(product.is_shipping);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  
  // Find default/primary address in priority
  const defaultAddress = initialAddresses.find(addr => addr.is_default);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    defaultAddress ? defaultAddress.id : (initialAddresses.length > 0 ? initialAddresses[0].id : null)
  );

  // Infos de contact (Nom complet, e-mail, téléphone)
  const [fullName, setFullName] = useState(
    buyer ? `${buyer.firstname || ""} ${buyer.lastname || ""}`.trim() : ""
  );
  const [email, setEmail] = useState(buyer?.email || "");
  const [phone, setPhone] = useState(buyer?.phone || "");
  const [saveContactToProfile, setSaveContactToProfile] = useState(false);

  // Formulaire d'adresse
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(
    initialAddresses.length === 0
  );
  const [newStreetNumber, setNewStreetNumber] = useState("");
  const [newStreetName, setNewStreetName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newZipCode, setNewZipCode] = useState("");
  const [newCountry, setNewCountry] = useState("France");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Stripe & Paiement
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  // --- Calculs Financiers Client (pour aperçu avant chargement API) ---
  const commission = Math.round((0.70 + productPrice * 0.05) * 100) / 100;
  const shippingFee = isShipping ? (productPrice > 100 ? 0 : 4.99) : 0;
  const totalPrice = Math.round((productPrice + commission + shippingFee) * 100) / 100;

  // --- Configuration du thème Stripe (Theme Night Premium) ---
  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#7D38FF",      // Violet Figma
      colorSuccess: "#C6FF34",      // Vert Citron Figma
      colorBackground: "#0A0A0C",   // Noir Profond légèrement bleuté
      colorText: "#FFFFFF",
      colorDanger: "#EF4444",
      fontFamily: "Montserrat, sans-serif",
      borderRadius: "16px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        transition: "all 0.2s ease-in-out",
      },
      ".Input:focus": {
        border: "1px solid #7D38FF",
        boxShadow: "0 0 0 3px rgba(125, 56, 255, 0.2)",
      },
    }
  };

  // --- Actions ---

  // Lancer le PaymentIntent via l'API
  const handleProceedToPayment = async () => {
    try {
      setIsInitializingPayment(true);
      setPaymentError("");

      // Validation des informations de contact obligatoires
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setPaymentError("Veuillez remplir toutes les informations de contact (Nom complet, e-mail et téléphone).");
        setIsInitializingPayment(false);
        return;
      }

      let finalAddressId = selectedAddressId;

      // 1. Sauvegarder la nouvelle adresse d'abord si nécessaire
      if (isShipping && showNewAddressForm) {
        if (!newStreetName || !newCity || !newZipCode || !newCountry) {
          setPaymentError("Veuillez remplir tous les champs obligatoires de l'adresse.");
          setIsInitializingPayment(false);
          return;
        }

        const resAddress = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street_number: newStreetNumber,
            street_name: newStreetName,
            city: newCity,
            zip_code: newZipCode,
            country: newCountry,
          }),
        });

        const savedAddress = await resAddress.json();

        if (!resAddress.ok) {
          throw new Error(savedAddress.error || "Échec de l'enregistrement de l'adresse.");
        }

        // Ajouter l'adresse à la liste et la sélectionner
        setAddresses((prev) => [savedAddress, ...prev]);
        finalAddressId = savedAddress.id;
        setSelectedAddressId(savedAddress.id);
        setShowNewAddressForm(false);
      }

      // 2. Initialiser le checkout et obtenir le clientSecret de Stripe
      const resCheckout = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          addressId: isShipping ? finalAddressId : null,
          isShipping,
          fullName: fullName.trim(),
          phone: phone.trim(),
          saveContactToProfile,
        }),
      });

      const checkoutData = await resCheckout.json();

      if (!resCheckout.ok) {
        throw new Error(checkoutData.error || "Échec de l'initialisation du paiement.");
      }

      setClientSecret(checkoutData.clientSecret);
      setInvoiceId(checkoutData.invoiceId);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "Une erreur est survenue.");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
      
      {/* ================= GAUCHE : TUNNEL D'ACHAT & FORMULAIRES ================= */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* En-tête & Bouton retour */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => clientSecret ? setClientSecret("") : router.back()}
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-brand-primary active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Sécurisé par Stripe Elements</span>
            <h2 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tight">
              {clientSecret ? "Finalisation du paiement" : "Informations de livraison"}
            </h2>
          </div>
        </div>

        {paymentError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-bold">{paymentError}</p>
          </div>
        )}

        {!clientSecret ? (
          // Etape 1 : Saisie de la livraison & Adresse
          <div className="space-y-8">
            
            {/* A. Choix du mode de livraison */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">1. Mode de livraison</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Mode Expédition */}
                <button
                  onClick={() => setIsShipping(true)}
                  disabled={!product.is_shipping}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 relative overflow-hidden group ${
                    isShipping 
                      ? "bg-zinc-900/60 border-brand-primary/50 shadow-[0_0_20px_rgba(125,56,255,0.1)]" 
                      : "bg-zinc-900/20 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10"
                  } ${!product.is_shipping ? "cursor-not-allowed opacity-30!" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                    isShipping ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-zinc-800/50 border-white/5 text-zinc-400"
                  }`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">Expédition par colis</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Livraison à domicile. Frais de port standard appliqués. Suivi en temps réel.
                    </p>
                    {productPrice > 100 && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-wider">
                        Livraison Offerte (&gt;100€)
                      </span>
                    )}
                  </div>
                  {isShipping && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </button>

                {/* Mode Remise en main propre */}
                <button
                  onClick={() => setIsShipping(false)}
                  className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 relative overflow-hidden group ${
                    !isShipping 
                      ? "bg-zinc-900/60 border-brand-accent/50 shadow-[0_0_20px_rgba(198,255,52,0.1)]" 
                      : "bg-zinc-900/20 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                    !isShipping ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" : "bg-zinc-800/50 border-white/5 text-zinc-400"
                  }`}>
                    <Handshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">Remise en main propre</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Rencontrez le vendeur. Séquestre sécurisé. Code de validation requis pour libérer les fonds.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-sm bg-brand-accent/10 text-brand-accent font-black text-[9px] uppercase tracking-wider">
                      Gratuit (0,00€)
                    </span>
                  </div>
                  {!isShipping && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-black fill-current" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* B. Informations de contact (Toujours visible pour expédition et main propre) */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">2. Informations de contact</h3>
              
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4 backdrop-blur-md">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nom complet *</label>
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">E-mail *</label>
                    <input
                      type="email"
                      placeholder="jean.dupont@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Téléphone *</label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                    />
                  </div>
                </div>

                {/* Raccourci Premium: Slide Toggle pour Sauvegarde BDD du profil contact */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span 
                    className={`text-xs font-black transition-all duration-300 uppercase tracking-wide select-none ${
                      saveContactToProfile 
                        ? "text-brand-primary drop-shadow-[0_0_6px_rgba(125,56,255,0.4)]" 
                        : "text-zinc-500"
                    }`}
                    style={{
                      textShadow: saveContactToProfile ? "0 0 8px rgba(125, 56, 255, 0.4)" : "none"
                    }}
                  >
                    Enregistrer ces informations dans mon profil
                  </span>
                  <button
                    type="button"
                    onClick={() => setSaveContactToProfile(!saveContactToProfile)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      saveContactToProfile ? "bg-brand-primary" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        saveContactToProfile ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* C. Bloc Adresse (Visible uniquement si Mode Expédition actif) */}
            {isShipping ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">3. Adresse d'expédition</h3>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                      className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showNewAddressForm ? "Utiliser mes adresses" : "Nouvelle adresse"}
                    </button>
                  )}
                </div>

                {showNewAddressForm ? (
                  // Formulaire nouvelle adresse
                  <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4 backdrop-blur-md">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">N°</label>
                        <input
                          type="text"
                          placeholder="12"
                          value={newStreetNumber}
                          onChange={(e) => setNewStreetNumber(e.target.value)}
                          className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rue *</label>
                        <input
                          type="text"
                          placeholder="Rue des Sports"
                          value={newStreetName}
                          onChange={(e) => setNewStreetName(e.target.value)}
                          required
                          className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ville *</label>
                        <input
                          type="text"
                          placeholder="Paris"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          required
                          className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Code Postal *</label>
                        <input
                          type="text"
                          placeholder="75001"
                          value={newZipCode}
                          onChange={(e) => setNewZipCode(e.target.value)}
                          required
                          className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pays *</label>
                      <input
                        type="text"
                        placeholder="France"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        required
                        className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-brand-primary transition-all"
                      />
                    </div>

                    {/* Raccourci Premium: Slide Toggle pour Sauvegarde BDD */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span 
                        className={`text-xs font-black transition-all duration-300 uppercase tracking-wide select-none ${
                          saveAddressToProfile 
                            ? "text-brand-primary drop-shadow-[0_0_6px_rgba(125,56,255,0.4)]" 
                            : "text-zinc-500"
                        }`}
                        style={{
                          textShadow: saveAddressToProfile ? "0 0 8px rgba(125, 56, 255, 0.4)" : "none"
                        }}
                      >
                        Sauvegarder cette adresse pour mes futurs achats
                      </span>
                      
                      {/* Premium Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setSaveAddressToProfile(!saveAddressToProfile)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none ${
                          saveAddressToProfile ? "bg-brand-primary" : "bg-zinc-800"
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                            saveAddressToProfile ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Liste d'adresses
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`p-4 rounded-xl border text-left flex gap-3 transition-all relative ${
                          selectedAddressId === address.id
                            ? "bg-zinc-900/60 border-brand-primary/50"
                            : "bg-zinc-900/10 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <MapPin className={`w-5 h-5 shrink-0 ${
                          selectedAddressId === address.id ? "text-brand-primary" : "text-zinc-500"
                        }`} />
                        <div className="text-xs">
                          <p className="font-bold text-white leading-tight">
                            {address.street_number ? `${address.street_number} ` : ""}{address.street_name}
                          </p>
                          <p className="text-zinc-400 mt-0.5">
                            {address.zip_code} {address.city}
                          </p>
                          <p className="text-zinc-500 mt-0.5">{address.country}</p>
                        </div>
                        {selectedAddressId === address.id && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // B. Message explicatif (Si Mode Remise en main propre actif)
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-brand-accent/15 backdrop-blur-md space-y-3">
                <div className="flex items-center gap-3 text-brand-accent">
                  <ShieldCheck className="w-6 h-6" />
                  <h4 className="font-black text-sm uppercase tracking-wider">Transaction Sécurisée PlayAgain</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  L'argent de la transaction est immédiatement placé dans notre **compte de séquestre sécurisé** (Escrow). 
                  Rencontrez le vendeur à l'adresse convenue dans le chat pour récupérer votre équipement de sport. 
                  Une fois que vous avez examiné l'article et validé sa conformité, transmettez-lui votre **code de sécurité unique** 
                  pour débloquer et libérer les fonds.
                </p>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-zinc-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                  <p className="leading-normal">
                    Aucune adresse postale requise. Le vendeur ne sera crédité que lorsque vous aurez physiquement récupéré et validé l'article.
                  </p>
                </div>
              </div>
            )}

            {/* C. Bouton validation étape de livraison */}
            <div className="pt-4">
              <Button
                onClick={handleProceedToPayment}
                disabled={isInitializingPayment || (isShipping && !selectedAddressId && showNewAddressForm && (!newStreetName || !newCity))}
                className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                {isInitializingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initialisation du paiement sécurisé...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Valider et passer au paiement sécurisé ({totalPrice} €)
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Etape 2 : Formulaire de carte bancaire Stripe Elements
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center gap-3 text-brand-primary text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p className="font-bold">
                Connexion cryptée SSL directe avec Stripe. Vos données bancaires ne transitent jamais sur nos serveurs.
              </p>
            </div>

            <Elements 
              stripe={getStripePromise(stripePublishableKey)} 
              options={{ 
                clientSecret,
                appearance: stripeAppearance as any
              }}
            >
              <PaymentForm 
                totalPrice={totalPrice} 
                productId={product.id}
                invoiceId={invoiceId!}
              />
            </Elements>
          </div>
        )}
      </div>

      {/* ================= DROITE : RÉCAPITULATIF COMMANDE (GLASSMORPHIC) ================= */}
      <div className="lg:col-span-5">
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-lg lg:sticky lg:top-24 space-y-6">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Récapitulatif de la commande</h3>
          
          {/* Article Info */}
          <div className="flex gap-4 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0 relative">
              {product.media && product.media.length > 0 ? (
                <img 
                  src={product.media[0].url} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <Truck className="w-8 h-8 text-zinc-700" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              {product.brand && (
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                  {product.brand.label}
                </span>
              )}
              <h4 className="font-bold text-white text-base truncate leading-snug">{product.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">Vendu par <span className="font-bold text-brand-primary">{product.user.username}</span></p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400 font-medium">Prix de l'article</span>
              <span className="font-bold text-white">{productPrice.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between items-center group relative">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5 cursor-pointer">
                Frais de Protection Acheteur
                <div className="relative inline-block text-zinc-500 hover:text-white">
                  <Info className="w-3.5 h-3.5" />
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-zinc-950 border border-white/10 text-[10px] text-zinc-300 font-medium leading-normal opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-55 shadow-xl">
                    Assure la protection de vos fonds sous séquestre, finance la couverture d'assurance et couvre le traitement bancaire Stripe.
                  </span>
                </div>
              </span>
              <span className="font-bold text-white">{commission.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400 font-medium">Frais de livraison</span>
              <span className="font-bold">
                {isShipping ? (
                  shippingFee === 0 ? (
                    <span className="text-brand-accent uppercase tracking-wider text-xs">Gratuit</span>
                  ) : (
                    `${shippingFee.toFixed(2)} €`
                  )
                ) : (
                  <span className="text-brand-accent uppercase tracking-wider text-xs">Gratuit</span>
                )}
              </span>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-baseline">
              <span className="text-base font-black text-white uppercase tracking-wider">Total</span>
              <div className="text-right">
                <span className="text-3xl font-black text-brand-primary drop-shadow-[0_0_12px_rgba(125,56,255,0.2)]">
                  {totalPrice.toFixed(2)} €
                </span>
                <p className="text-[9px] text-zinc-500 font-bold mt-1">TVA & frais de traitement inclus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ================= CO-COMPOSANT : FORMULAIRE STRIPE ELEMENTS =================
interface PaymentFormProps {
  totalPrice: number;
  productId: number;
  invoiceId: number;
}

function PaymentForm({ totalPrice, productId, invoiceId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsPaying(true);
    setErrorMessage("");

    try {
      // Confirmer le paiement avec Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // L'URL de retour en cas de succès complet
          return_url: `${window.location.origin}/product/${productId}/checkout/success?invoice_id=${invoiceId}`,
        },
      });

      if (error) {
        // Stripe renverra une erreur si la carte a expiré, solde insuffisant, etc.
        setErrorMessage(error.message || "Une erreur est survenue lors de la validation du paiement.");
        setIsPaying(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Une erreur réseau ou serveur est survenue.");
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPaying || !stripe || !elements}
        className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2"
      >
        {isPaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Traitement de la transaction...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Confirmer et payer {totalPrice.toFixed(2)} €
          </>
        )}
      </Button>
    </form>
  );
}
