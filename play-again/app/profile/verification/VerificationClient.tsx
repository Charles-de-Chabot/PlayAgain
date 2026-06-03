"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VerificationStatus from "./components/VerificationStatus";
import VerificationWizard from "./components/VerificationWizard";

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

/**
 * VerificationClient orchestrates state for the verification flow.
 */
export function VerificationClient({ user, defaultAddress, latestRequest }: VerificationClientProps) {
  const router = useRouter();

  // Primary states
  const [currentRequest, setCurrentRequest] = useState(latestRequest);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill contact details from profile settings
  const [emailInput, setEmailInput] = useState(user.email || "");
  const [phoneInput, setPhoneInput] = useState(user.phone || "");

  // Pre-fill primary default address
  const [streetNumberInput, setStreetNumberInput] = useState(defaultAddress?.street_number || "");
  const [streetNameInput, setStreetNameInput] = useState(defaultAddress?.street_name || "");
  const [cityInput, setCityInput] = useState(defaultAddress?.city || "");
  const [zipInput, setZipInput] = useState(defaultAddress?.zip_code || "");
  const [countryInput, setCountryInput] = useState(defaultAddress?.country || "");

  // Uploaded media links
  const [idCard1Url, setIdCard1Url] = useState<string | null>(null);
  const [idCard2Url, setIdCard2Url] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);

  // Submit request payload to the API verify endpoint
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

      setCurrentRequest(data.request);
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset fields to trigger a new submission form
  const handleReset = () => {
    setCurrentRequest(null);
    setEmailInput(user.email || "");
    setPhoneInput(user.phone || "");
    setStreetNumberInput(defaultAddress?.street_number || "");
    setStreetNameInput(defaultAddress?.street_name || "");
    setCityInput(defaultAddress?.city || "");
    setZipInput(defaultAddress?.zip_code || "");
    setCountryInput(defaultAddress?.country || "");
    setIdCard1Url(null);
    setIdCard2Url(null);
    setSelfieUrl(null);
    setSubmitError(null);
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  // If a verification request is pending, approved, or rejected, show status view
  if (currentRequest?.status) {
    return (
      <VerificationStatus
        status={currentRequest.status}
        rejectionReason={currentRequest.rejectionReason}
        stripeConnectId={user.stripeConnectId}
        onReset={handleReset}
      />
    );
  }

  // If the user has not configured a primary address
  if (!defaultAddress) {
    return (
      <VerificationStatus
        status="MISSING_ADDRESS"
        rejectionReason={null}
        stripeConnectId={user.stripeConnectId}
        onReset={handleReset}
      />
    );
  }

  // Otherwise, render multi-step verification form wizard
  return (
    <VerificationWizard
      emailInput={emailInput}
      setEmailInput={setEmailInput}
      phoneInput={phoneInput}
      setPhoneInput={setPhoneInput}
      streetNumberInput={streetNumberInput}
      setStreetNumberInput={setStreetNumberInput}
      streetNameInput={streetNameInput}
      setStreetNameInput={setStreetNameInput}
      cityInput={cityInput}
      setCityInput={setCityInput}
      zipInput={zipInput}
      setZipInput={setZipInput}
      countryInput={countryInput}
      setCountryInput={setCountryInput}
      idCard1Url={idCard1Url}
      setIdCard1Url={setIdCard1Url}
      idCard2Url={idCard2Url}
      setIdCard2Url={setIdCard2Url}
      selfieUrl={selfieUrl}
      setSelfieUrl={setSelfieUrl}
      isSubmitting={isSubmitting}
      submitError={submitError}
      setSubmitError={setSubmitError}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
