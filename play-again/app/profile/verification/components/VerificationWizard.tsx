"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";
import StepWelcome from "./StepWelcome";
import StepContact from "./StepContact";
import StepAddress from "./StepAddress";
import StepDocuments from "./StepDocuments";
import StepSelfie from "./StepSelfie";

export interface VerificationWizardProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  streetNumberInput: string;
  setStreetNumberInput: (val: string) => void;
  streetNameInput: string;
  setStreetNameInput: (val: string) => void;
  cityInput: string;
  setCityInput: (val: string) => void;
  zipInput: string;
  setZipInput: (val: string) => void;
  countryInput: string;
  setCountryInput: (val: string) => void;
  idCard1Url: string | null;
  setIdCard1Url: (val: string | null) => void;
  idCard2Url: string | null;
  setIdCard2Url: (val: string | null) => void;
  selfieUrl: string | null;
  setSelfieUrl: (val: string | null) => void;
  isSubmitting: boolean;
  submitError: string | null;
  setSubmitError: (val: string | null) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

/**
 * VerificationWizard orchestrates the multi-step verification form flow.
 */
export default function VerificationWizard({
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  streetNumberInput,
  setStreetNumberInput,
  streetNameInput,
  setStreetNameInput,
  cityInput,
  setCityInput,
  zipInput,
  setZipInput,
  countryInput,
  setCountryInput,
  idCard1Url,
  setIdCard1Url,
  idCard2Url,
  setIdCard2Url,
  selfieUrl,
  setSelfieUrl,
  isSubmitting,
  submitError,
  setSubmitError,
  onSubmit,
  onCancel,
}: VerificationWizardProps) {
  const [step, setStep] = useState(0);

  const handleNextStep = () => {
    if (step === 1 && (!emailInput.trim() || !phoneInput.trim())) {
      setSubmitError("Veuillez saisir votre email et votre numéro de téléphone.");
      return;
    }
    if (step === 2 && (!streetNameInput.trim() || !cityInput.trim() || !zipInput.trim() || !countryInput.trim())) {
      setSubmitError("Veuillez renseigner tous les champs obligatoires de l'adresse.");
      return;
    }
    if (step === 3 && !idCard1Url) {
      setSubmitError("Veuillez charger au moins une photo de votre pièce d'identité.");
      return;
    }
    setSubmitError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setStep(step - 1);
  };

  return (
    <div className="w-full p-6 md:p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative space-y-8">
      {/* Form header */}
      {step > 0 ? (
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="text-left">
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
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3 text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Renders the current view step dynamically */}
      {step === 0 && <StepWelcome onNext={() => setStep(1)} onCancel={onCancel} />}
      {step === 1 && (
        <StepContact
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}
      {step === 2 && (
        <StepAddress
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
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}
      {step === 3 && (
        <StepDocuments
          idCard1Url={idCard1Url}
          setIdCard1Url={setIdCard1Url}
          idCard2Url={idCard2Url}
          setIdCard2Url={setIdCard2Url}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}
      {step === 4 && (
        <StepSelfie
          selfieUrl={selfieUrl}
          setSelfieUrl={setSelfieUrl}
          onPrev={handlePrevStep}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
