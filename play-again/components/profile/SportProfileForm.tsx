"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveSportProfile } from "@/app/actions/sport-profile";
import { HANDEDNESS_SPORTS, STANCE_SPORTS } from "./sport-id/sportConstants";
import SportIdStepIdentity from "./sport-id/components/SportIdStepIdentity";
import SportIdStepMorphology from "./sport-id/components/SportIdStepMorphology";
import SportIdStepPerformance from "./sport-id/components/SportIdStepPerformance";

export interface SportSkillData {
  sportName: string;
  level: string;
}

export interface SportFormData {
  gender: string;
  interests: string[];
  height: number;
  weight: number;
  shoeSize: number | null;
  handOrientation: string;
  boardStance: string;
  level: string;
  frequency: number;
  skills: SportSkillData[];
}

interface SportProfileFormProps {
  initialData?: any;
  categories: any[];
}

export function SportProfileForm({ initialData, categories }: SportProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [activeSport, setActiveSport] = useState<string>("");
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const initialSkills =
    initialData?.skills?.map((s: any) => ({
      sportName: s.sportName,
      level: s.level,
    })) ||
    initialData?.interests?.map((sport: string) => ({
      sportName: sport,
      level: "",
    })) ||
    [];

  const [formData, setFormData] = useState<SportFormData>({
    gender: initialData?.gender || "",
    interests: initialData?.interests || [],
    height: initialData?.height || 175,
    weight: initialData?.weight || 70,
    shoeSize: initialData?.shoeSize || null,
    handOrientation: initialData?.handOrientation || "RIGHT",
    boardStance: initialData?.boardStance || "REGULAR",
    level: initialData?.level || "BEGINNER",
    frequency: initialData?.frequency || 3,
    skills: initialSkills,
  });

  const needsHandedness = formData.interests.some((s: string) => HANDEDNESS_SPORTS.includes(s.toUpperCase()));
  const needsStance = formData.interests.some((s: string) => STANCE_SPORTS.includes(s.toUpperCase()));

  const isStepValid = () => {
    if (step === 1) {
      return formData.gender !== "" && formData.interests.length > 0;
    }
    if (step === 2) {
      const shoeValid = formData.shoeSize !== null;
      const handValid = !needsHandedness || formData.handOrientation !== "";
      const stanceValid = !needsStance || formData.boardStance !== "";
      return shoeValid && handValid && stanceValid;
    }
    if (step === 3) {
      return formData.skills.length > 0 && formData.skills.every((s) => s.level !== "") && formData.frequency > 0;
    }
    return false;
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleInterest = (label: string) => {
    setFormData((prev) => {
      const isSelected = prev.interests.includes(label);
      const newInterests = isSelected
        ? prev.interests.filter((i: string) => i !== label)
        : [...prev.interests, label];

      const newSkills = newInterests.map((sport) => {
        const existing = prev.skills.find((s) => s.sportName.toUpperCase() === sport.toUpperCase());
        return existing || { sportName: sport, level: "" };
      });

      return {
        ...prev,
        interests: newInterests,
        skills: newSkills,
      };
    });
  };

  const handleSetSkillLevel = (sportName: string, level: string) => {
    setFormData((prev) => {
      const activeSkillIndex = prev.skills.findIndex((s) => s.sportName === sportName);
      if (activeSkillIndex === -1) return prev;

      const updatedSkills = prev.skills.map((s, idx) => (idx === activeSkillIndex ? { ...s, level } : s));

      return {
        ...prev,
        skills: updatedSkills,
        level: updatedSkills[0]?.level || "BEGINNER",
      };
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      // Nettoyage des données conditionnelles avant envoi
      const finalData = {
        ...formData,
        handOrientation: needsHandedness ? formData.handOrientation : "RIGHT",
        boardStance: needsStance ? formData.boardStance : "REGULAR",
      };

      const result = await saveSportProfile(finalData);
      if (result.success) {
        router.push("/profile");
        router.refresh();
      }
    });
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[600px] flex flex-col text-left">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 h-[40%] w-[40%] rounded-full bg-brand-primary blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[40%] w-[40%] rounded-full bg-brand-accent blur-[120px] opacity-60" />
      </div>

      {/* HEADER / PROGRESS */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 w-12 rounded-full transition-all duration-500",
                step >= s ? "bg-brand-accent shadow-[0_0_10px_rgba(198,255,52,0.5)]" : "bg-white/10"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Étape {step} / 3</span>
      </div>

      {/* MAIN CARD */}
      <div className="flex-1 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/10 border-b-2 border-l-2 border-brand-primary/20 -mr-8 -mt-8 rotate-45" />

        {/* STEP 1: IDENTITÉ SPORTIVE */}
        {step === 1 && (
          <SportIdStepIdentity
            gender={formData.gender}
            setGender={(gender) => setFormData({ ...formData, gender })}
            interests={formData.interests}
            onToggleInterest={toggleInterest}
            categories={categories}
          />
        )}

        {/* STEP 2: MENSURATIONS & TECHNIQUE */}
        {step === 2 && (
          <SportIdStepMorphology
            height={formData.height}
            setHeight={(height) => setFormData({ ...formData, height })}
            weight={formData.weight}
            setWeight={(weight) => setFormData({ ...formData, weight })}
            shoeSize={formData.shoeSize}
            setShoeSize={(shoeSize) => setFormData({ ...formData, shoeSize })}
            needsHandedness={needsHandedness}
            handOrientation={formData.handOrientation}
            setHandOrientation={(handOrientation) => setFormData({ ...formData, handOrientation })}
            needsStance={needsStance}
            boardStance={formData.boardStance}
            setBoardStance={(boardStance) => setFormData({ ...formData, boardStance })}
          />
        )}

        {/* STEP 3: PERFORMANCE */}
        {step === 3 && (
          <SportIdStepPerformance
            skills={formData.skills}
            onSetSkillLevel={handleSetSkillLevel}
            activeSport={activeSport}
            setActiveSport={setActiveSport}
            frequency={formData.frequency}
            setFrequency={(frequency) => setFormData({ ...formData, frequency })}
            tabsRef={tabsRef}
            scrollTabs={scrollTabs}
          />
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center w-20 h-20 rounded-none bg-zinc-950/50 border-2 border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className={cn(
                "flex-1 flex items-center justify-center gap-4 rounded-none font-black uppercase italic tracking-tighter transition-all h-20 cursor-pointer text-xl",
                isStepValid()
                  ? "bg-white text-black hover:bg-brand-accent shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                  : "bg-zinc-950/50 text-zinc-800 cursor-not-allowed border-2 border-white/5"
              )}
            >
              Étape suivante
              <ChevronRight className="w-8 h-8" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isStepValid()}
              className={cn(
                "flex-1 flex items-center justify-center gap-4 rounded-none font-black uppercase italic tracking-tighter transition-all h-20 shadow-[0_20px_60px_rgba(198,255,52,0.2)] cursor-pointer text-xl",
                isStepValid() && !isPending
                  ? "bg-brand-accent text-black hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-zinc-950/50 text-zinc-800 cursor-not-allowed border-2 border-white/5 shadow-none"
              )}
            >
              {isPending ? "Génération..." : "Activer mon ID"}
              <Check className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(198, 255, 52, 0.5);
        }
      `}</style>
    </div>
  );
}
