"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  CheckCircle2, 
  Check,
  Zap,
  Target,
  Trophy,
  Dumbbell,
  Waves,
  Mountain,
  Flame,
  Bike,
  Activity,
  Award,
  CircleDot,
  Snowflake,
  Wind,
  Music,
  Trees,
  Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveSportProfile } from "@/app/actions/sport-profile";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface SportProfileFormProps {
  initialData?: any;
  categories: any[];
}

const SPORTS_ICONS: Record<string, any> = {
  "FOOTBALL": Target,
  "TENNIS": CircleDot,
  "TENNIS DE TABLE": CircleDot,
  "BASKET-BALL": Trophy,
  "VOLLEY-BALL": Trophy,
  "VÉLO": Bike,
  "VTT": Bike,
  "RUNNING": Zap,
  "ATHLÉTISME": Zap,
  "SKI": Snowflake,
  "SNOWBOARD": Wind,
  "MUSCULATION": Dumbbell,
  "FITNESS": Dumbbell,
  "CROSSFIT": Dumbbell,
  "NATATION": Waves,
  "YOGA": Activity,
  "PILATES": Activity,
  "GOLF": Target,
  "BOXE": Flame,
  "ARTS MARTIAUX": Flame,
  "ESCALADE": Mountain,
  "RANDONNÉE": Mountain,
  "SURF": Waves,
  "RUGBY": Target,
  "PADEL": CircleDot,
  "EQUITATION": Mountain,
  "ÉQUITATION": Mountain,
  "SKATEBOARD": Zap,
  "HOCKEY": Target,
  "AVIRON": Waves,
  "DANCE": Music,
  "PATINAGE": Snowflake,
  "POLO": Target,
  "ROLLER": Zap,
  "SPORTS DE PLEIN AIR": Mountain,
  "SPORTS DE RAQUETTE": CircleDot,
  "SPORTS NAUTIQUES": Waves,
  "TIR À L'ARC": Target,
  "VOILE": Wind,
  "WATER-POLO": Waves,
  "CANOË-KAYAK": Waves,
  "PLONGÉE": Waves,
};

const HANDEDNESS_SPORTS = ["TENNIS", "GOLF", "BOXE", "PADEL", "HOCKEY", "RUGBY", "TENNIS DE TABLE"];
const STANCE_SPORTS = ["SNOWBOARD", "SURF", "SKATEBOARD", "SKI"];

interface SportFormData {
  gender: string;
  interests: string[];
  height: number;
  weight: number;
  shoeSize: number | null;
  handOrientation: string;
  boardStance: string;
  level: string;
  frequency: number;
}

export function SportProfileForm({ initialData, categories }: SportProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SportFormData>({
    gender: initialData?.gender || "",
    interests: initialData?.interests || [],
    height: initialData?.height || 175,
    weight: initialData?.weight || 70,
    shoeSize: initialData?.shoeSize || null,
    handOrientation: initialData?.handOrientation || "RIGHT",
    boardStance: initialData?.boardStance || "REGULAR",
    level: initialData?.level || "",
    frequency: initialData?.frequency || 3,
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
      return formData.level !== "" && formData.frequency > 0;
    }
    return false;
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const toggleInterest = (label: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i: string) => i !== label)
        : [...prev.interests, label]
    }));
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
    <div className="relative w-full max-w-2xl mx-auto min-h-[600px] flex flex-col">
      {/* BACKGROUND DECOR (From Login) */}
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
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Ton Identité <span className="text-brand-accent">Sportive</span></h2>
              <p className="text-zinc-500 text-sm font-medium">Commençons par les bases pour personnaliser ton expérience.</p>
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Genre</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["MAN", "WOMAN", "KIDS"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={cn(
                      "group p-6 border-2 transition-all flex flex-col items-center gap-3 cursor-pointer rounded-none relative overflow-hidden",
                      formData.gender === g 
                        ? "bg-brand-primary border-brand-primary text-white" 
                        : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20"
                    )}
                  >
                    {formData.gender === g && <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 -mr-3 -mt-3 rotate-45" />}
                    <User className={cn("w-8 h-8", formData.gender === g ? "text-white" : "text-zinc-700 group-hover:text-zinc-400")} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{g === "MAN" ? "Homme" : g === "WOMAN" ? "Femme" : "Enfant"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Tes Sports Favoris</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleInterest(cat.label)}
                    className={cn(
                      "p-4 border-2 transition-all flex flex-col items-center gap-2 cursor-pointer rounded-none relative group h-28 justify-center",
                      formData.interests.includes(cat.label)
                        ? "bg-brand-accent border-brand-accent text-black" 
                        : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/10"
                    )}
                  >
                    {(() => {
                      const label = cat.label.trim().toUpperCase();
                      const IconComponent = SPORTS_ICONS[label] || Award;
                      return <IconComponent className={cn("w-5 h-5", formData.interests.includes(cat.label) ? "text-black" : "text-zinc-700 group-hover:text-zinc-500")} />;
                    })()}
                    <span className="text-[11px] font-black uppercase tracking-tighter w-full text-center leading-tight whitespace-normal">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MENSURATIONS & TECHNIQUE */}
        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Morphologie <span className="text-brand-accent">& Technique</span></h2>
              <p className="text-zinc-500 text-sm font-medium">Ces détails nous aident à trouver les articles à ta taille.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Taille (cm)</label>
                  <span className="text-2xl font-black italic text-brand-accent">{formData.height} cm</span>
                </div>
                <input 
                  type="range" min="100" max="220" 
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                  className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Poids (kg)</label>
                  <span className="text-2xl font-black italic text-brand-accent">{formData.weight} kg</span>
                </div>
                <input 
                  type="range" min="30" max="150" 
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Pointure (EU)</label>
              <div className="flex flex-wrap gap-2">
                {[36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFormData({...formData, shoeSize: size})}
                    className={cn(
                      "w-14 h-14 border-2 rounded-none font-black italic transition-all cursor-pointer",
                      formData.shoeSize === size 
                        ? "bg-white text-black border-white" 
                        : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/20"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {(needsHandedness || needsStance) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {needsHandedness && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Latéralité</label>
                    <div className="flex bg-zinc-950/50 p-1 border-2 border-white/5 rounded-none">
                      <button 
                        onClick={() => setFormData({...formData, handOrientation: "RIGHT"})}
                        className={cn("flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none", formData.handOrientation === "RIGHT" ? "bg-white/10 text-white" : "text-zinc-700")}
                      >Droitier</button>
                      <button 
                        onClick={() => setFormData({...formData, handOrientation: "LEFT"})}
                        className={cn("flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none", formData.handOrientation === "LEFT" ? "bg-white/10 text-white" : "text-zinc-700")}
                      >Gaucher</button>
                    </div>
                  </div>
                )}

                {needsStance && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Stance (Glisse)</label>
                    <div className="flex bg-zinc-950/50 p-1 border-2 border-white/5 rounded-none">
                      <button 
                        onClick={() => setFormData({...formData, boardStance: "REGULAR"})}
                        className={cn("flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none", formData.boardStance === "REGULAR" ? "bg-white/10 text-white" : "text-zinc-700")}
                      >Regular</button>
                      <button 
                        onClick={() => setFormData({...formData, boardStance: "GOOFY"})}
                        className={cn("flex-1 py-4 text-[11px] font-black uppercase transition-all rounded-none", formData.boardStance === "GOOFY" ? "bg-white/10 text-white" : "text-zinc-700")}
                      >Goofy</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PERFORMANCE */}
        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Performance <span className="text-brand-accent">& Objectifs</span></h2>
              <p className="text-zinc-500 text-sm font-medium">Dernière étape pour activer ton intelligence PlayAgain.</p>
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Ton Niveau</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "BEGINNER", label: "Novice", desc: "Je débute ou pratique très occasionnellement." },
                  { id: "INTERMEDIATE", label: "Intermédiaire", desc: "Je maîtrise les bases et pratique régulièrement." },
                  { id: "ADVANCED", label: "Confirmé", desc: "Pratique intensive, je cherche de la performance." },
                  { id: "PRO", label: "Expert / Pro", desc: "Niveau compétition ou professionnel." },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setFormData({...formData, level: l.id})}
                    className={cn(
                      "p-6 border-2 transition-all flex items-center justify-between group cursor-pointer rounded-none",
                      formData.level === l.id
                        ? "bg-brand-primary border-brand-primary text-white" 
                        : "bg-zinc-950/50 border-white/5 text-zinc-600 hover:border-white/10"
                    )}
                  >
                    <div className="text-left">
                      <span className="block text-[11px] font-black uppercase tracking-[0.2em] mb-1">{l.label}</span>
                      <span className={cn("text-[11px] font-medium", formData.level === l.id ? "text-white/60" : "text-zinc-700")}>{l.desc}</span>
                    </div>
                    {formData.level === l.id && <CheckCircle2 className="w-6 h-6 text-brand-accent" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Fréquence de pratique</label>
                <span className="text-2xl font-black italic text-brand-accent">{formData.frequency}x <span className="text-xs uppercase tracking-widest text-zinc-500">/ semaine</span></span>
              </div>
              <input 
                type="range" min="1" max="7" 
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: parseInt(e.target.value)})}
                className="w-full accent-brand-accent bg-zinc-950 border-2 border-white/5 rounded-none h-3 appearance-none cursor-pointer"
              />
              <div className="flex justify-between px-1">
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Occasionnel</span>
                <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">Intensif</span>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex items-center justify-center w-20 h-20 rounded-none bg-zinc-950/50 border-2 border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {step < 3 ? (
            <button 
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
