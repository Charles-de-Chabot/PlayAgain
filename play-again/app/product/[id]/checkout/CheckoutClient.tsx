"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Info,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FinanceFeeRules } from "@/lib/systemConfig";

// Sub-components import
import DeliveryMethodSelector from "./components/DeliveryMethodSelector";
import CheckoutContactForm from "./components/CheckoutContactForm";
import CheckoutAddressSelector, { type Address } from "./components/CheckoutAddressSelector";
import CheckoutSummary from "./components/CheckoutSummary";
import StripePaymentForm from "./components/StripePaymentForm";

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
  username?: string | null;
}

interface CheckoutClientProps {
  product: Product;
  initialAddresses: Address[];
  buyer: Buyer | null;
  stripePublishableKey: string;
  feeRules: FinanceFeeRules;
}

/**
 * CheckoutClient orchestrates shipping method selection,
 * buyer contact details validation, saved address grids, and loading Stripe Elements.
 */
export function CheckoutClient({
  product,
  initialAddresses,
  buyer,
  stripePublishableKey,
  feeRules,
}: CheckoutClientProps) {
  const router = useRouter();
  const productPrice = Number(product.price);

  // --- Local states ---
  const [isShipping, setIsShipping] = useState<boolean>(product.is_shipping);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  // Address selection
  const defaultAddress = initialAddresses.find((addr) => addr.is_default);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    defaultAddress ? defaultAddress.id : initialAddresses.length > 0 ? initialAddresses[0].id : null
  );

  // Buyer Contact Info
  const [fullName, setFullName] = useState(
    buyer
      ? buyer.firstname || buyer.lastname
        ? `${buyer.firstname || ""} ${buyer.lastname || ""}`.trim()
        : buyer.username || ""
      : ""
  );
  const [email, setEmail] = useState(buyer?.email || "");
  const [phone, setPhone] = useState(buyer?.phone || "");
  const [saveContactToProfile, setSaveContactToProfile] = useState(true);

  // New Address Form State
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(initialAddresses.length === 0);
  const [newStreetNumber, setNewStreetNumber] = useState("");
  const [newStreetName, setNewStreetName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newZipCode, setNewZipCode] = useState("");
  const [newCountry, setNewCountry] = useState("France");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Stripe Billing states
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  // --- Financial Computations ---
  const commission = Math.round((feeRules.flatFee + productPrice * (feeRules.commissionRate / 100)) * 100) / 100;
  const shippingFee = isShipping ? (productPrice > 100 ? 0 : 4.99) : 0;
  const totalPrice = Math.round((productPrice + commission + shippingFee) * 100) / 100;

  // --- Actions ---

  // Initiates Stripe PaymentIntent via API
  const handleProceedToPayment = async () => {
    try {
      setIsInitializingPayment(true);
      setPaymentError("");

      // Validate contact info
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setPaymentError("Veuillez remplir toutes les informations de contact (Nom complet, e-mail et téléphone).");
        setIsInitializingPayment(false);
        return;
      }

      let finalAddressId = selectedAddressId;

      // Save new shipping address if required
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

        setAddresses((prev) => [savedAddress, ...prev]);
        finalAddressId = savedAddress.id;
        setSelectedAddressId(savedAddress.id);
        setShowNewAddressForm(false);
      }

      // Initialize the transaction checkout session
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
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4 text-left">
          <button
            type="button"
            onClick={() => (clientSecret ? setClientSecret("") : router.back())}
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-brand-primary active:scale-95 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
              Sécurisé par Stripe Elements
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tight">
              {clientSecret ? "Finalisation du paiement" : "Informations de livraison"}
            </h2>
          </div>
        </div>

        {paymentError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-bold">{paymentError}</p>
          </div>
        )}

        {!clientSecret ? (
          // Etape 1 : Saisie de la livraison & Adresse
          <div className="space-y-8">
            <DeliveryMethodSelector
              isShipping={isShipping}
              setIsShipping={setIsShipping}
              product={product}
              productPrice={productPrice}
            />

            <CheckoutContactForm
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              saveContactToProfile={saveContactToProfile}
              setSaveContactToProfile={setSaveContactToProfile}
            />

            {isShipping ? (
              <CheckoutAddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                showNewAddressForm={showNewAddressForm}
                setShowNewAddressForm={setShowNewAddressForm}
                newStreetNumber={newStreetNumber}
                setNewStreetNumber={setNewStreetNumber}
                newStreetName={newStreetName}
                setNewStreetName={setNewStreetName}
                newCity={newCity}
                setNewCity={setNewCity}
                newZipCode={newZipCode}
                setNewZipCode={setNewZipCode}
                newCountry={newCountry}
                setNewCountry={setNewCountry}
                saveAddressToProfile={saveAddressToProfile}
                setSaveAddressToProfile={setSaveAddressToProfile}
              />
            ) : (
              // B. Message explicatif (Si Mode Remise en main propre actif)
              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-brand-accent/15 backdrop-blur-md space-y-3 text-left animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex items-center gap-3 text-brand-accent">
                  <ShieldCheck className="w-6 h-6" />
                  <h4 className="font-black text-sm uppercase tracking-wider">Transaction Sécurisée PlayAgain</h4>
                </div>
                <p className="text-xs text-zinc-350 leading-relaxed">
                  L'argent de la transaction est immédiatement placé dans notre **compte de séquestre sécurisé** (Escrow).
                  Rencontrez le vendeur à l'adresse convenue dans le chat pour récupérer votre équipement de sport.
                  Une fois que vous avez examiné l'article et validé sa conformité, transmettez-lui votre **code de
                  sécurité unique** pour débloquer et libérer les fonds.
                </p>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-zinc-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                  <p className="leading-normal">
                    Aucune adresse postale requise. Le vendeur ne sera crédité que lorsque vous aurez physiquement
                    récupéré et validé l'article.
                  </p>
                </div>
              </div>
            )}

            {/* C. Bouton validation étape de livraison */}
            <div className="pt-4">
              <Button
                onClick={handleProceedToPayment}
                disabled={
                  isInitializingPayment ||
                  (isShipping && !selectedAddressId && showNewAddressForm && (!newStreetName || !newCity))
                }
                className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isInitializingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initialisation du paiement sécurisé...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Valider et passer au paiement sécurisé ({totalPrice} €)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Etape 2 : Formulaire de carte bancaire Stripe Elements
          <div className="space-y-6">
            <StripePaymentForm
              stripePublishableKey={stripePublishableKey}
              clientSecret={clientSecret}
              totalPrice={totalPrice}
              productId={product.id}
              invoiceId={invoiceId!}
              fullName={fullName}
              email={email}
              phone={phone}
              isShipping={isShipping}
              selectedAddressId={selectedAddressId}
              addresses={addresses}
            />

            {/* Récapitulatif premium des informations de contact et de livraison */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4 backdrop-blur-md mt-6 text-left">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Informations de facturation & contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-3 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Acheteur
                  </span>
                  <p className="font-bold text-white">{fullName}</p>
                  <p className="text-zinc-400">{email}</p>
                  <p className="text-zinc-400">{phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                    Mode & adresse
                  </span>
                  {isShipping ? (
                    (() => {
                      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
                      if (selectedAddress) {
                        return (
                          <>
                            <p className="font-bold text-white">
                              {selectedAddress.street_number ? `${selectedAddress.street_number} ` : ""}
                              {selectedAddress.street_name}
                            </p>
                            <p className="text-zinc-400">
                              {selectedAddress.zip_code} {selectedAddress.city}
                            </p>
                            <p className="text-zinc-400">{selectedAddress.country}</p>
                          </>
                        );
                      }
                      return <p className="text-zinc-400 italic">Aucune adresse sélectionnée</p>;
                    })()
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-sm bg-brand-accent/10 text-brand-accent font-black text-[9px] uppercase tracking-wider">
                        Remise en main propre
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= DROITE : RÉCAPITULATIF COMMANDE (GLASSMORPHIC) ================= */}
      <div className="lg:col-span-5">
        <CheckoutSummary
          product={product}
          productPrice={productPrice}
          isShipping={isShipping}
          commission={commission}
          shippingFee={shippingFee}
          totalPrice={totalPrice}
        />
      </div>
    </div>
  );
}
