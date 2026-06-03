"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface Address {
  id: number;
  street_number: string | null;
  street_name: string;
  city: string;
  zip_code: string;
  country: string;
}

export interface StripePaymentFormProps {
  stripePublishableKey: string;
  clientSecret: string;
  totalPrice: number;
  productId: number;
  invoiceId: number;
  fullName: string;
  email: string;
  phone: string;
  isShipping: boolean;
  selectedAddressId: number | null;
  addresses: Address[];
}

// Lazy-loaded Stripe instance helper
const getStripePromise = (key: string) => loadStripe(key);

const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#7D38FF", // Violet Figma
    colorSuccess: "#C6FF34", // Vert Citron Figma
    colorBackground: "#0A0A0C", // Noir Profond légèrement bleuté
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
  },
};

const getCountryCode = (country: string) => {
  if (!country) return "FR";
  const c = country.toLowerCase().trim();
  if (c === "france" || c === "fr") return "FR";
  if (c === "belgique" || c === "be") return "BE";
  if (c === "suisse" || c === "ch") return "CH";
  if (c === "luxembourg" || c === "lu") return "LU";
  return "FR";
};

/**
 * StripePaymentForm integrates Stripe Elements billing/card forms and wraps it
 * in a secure connection banner.
 */
export default function StripePaymentForm({
  stripePublishableKey,
  clientSecret,
  totalPrice,
  productId,
  invoiceId,
  fullName,
  email,
  phone,
  isShipping,
  selectedAddressId,
  addresses,
}: StripePaymentFormProps) {
  const selectedAddress = isShipping ? addresses.find((addr) => addr.id === selectedAddressId) : undefined;
  const formattedAddress = selectedAddress
    ? {
        line1: [selectedAddress.street_number, selectedAddress.street_name].filter(Boolean).join(" "),
        city: selectedAddress.city,
        postal_code: selectedAddress.zip_code,
        country: getCountryCode(selectedAddress.country),
      }
    : undefined;

  return (
    <div className="space-y-6 text-left">
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
          appearance: stripeAppearance,
          defaultValues: {
            billingDetails: {
              name: fullName || undefined,
              email: email || undefined,
              phone: phone || undefined,
              address: formattedAddress,
            },
          },
        } as any}
      >
        <InternalPaymentForm
          totalPrice={totalPrice}
          productId={productId}
          invoiceId={invoiceId}
          fullName={fullName}
          email={email}
          phone={phone}
        />
      </Elements>
    </div>
  );
}

// ================= INTERNAL STRIPE FORM SUBCOMPONENT =================
interface InternalPaymentFormProps {
  totalPrice: number;
  productId: number;
  invoiceId: number;
  fullName: string;
  email: string;
  phone: string;
}

function InternalPaymentForm({
  totalPrice,
  productId,
  invoiceId,
  fullName,
  email,
  phone,
}: InternalPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

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
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/product/${productId}/checkout/success?invoice_id=${invoiceId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Une erreur est survenue lors de la validation du paiement.");
        setIsPaying(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Une erreur réseau ou serveur est survenue.");
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name: fullName || undefined,
              email: email || undefined,
              phone: phone || undefined,
              address: {
                country: "FR",
              },
            },
          },
        }}
      />

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPaying || !stripe || !elements}
        className="w-full h-14 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isPaying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Traitement de la transaction...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Confirmer et payer {totalPrice.toFixed(2)} €</span>
          </>
        )}
      </Button>
    </form>
  );
}
