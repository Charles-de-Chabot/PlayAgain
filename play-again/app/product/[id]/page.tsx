import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { 
  MapPin, 
  User, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Share2, 
  Heart,
  Truck,
  RotateCcw,
  Shield
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { calculateMatch, learnProductExpertise } from "@/lib/ai/matcher";
import { MatchBadge } from "@/components/home/MatchBadge";
import { CircuitBoard, Info, Star, TrendingUp } from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { CompareButtonWrapper } from "@/components/product/CompareButtonWrapper";
import { BookmarkButtonWrapper } from "@/components/product/BookmarkButtonWrapper";
import { serializeProduct, calculateProductScore } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
const LEVEL_LABELS: Record<string, string> = {
  "BEGINNER": "Novice",
  "INTERMEDIATE": "Intermédiaire",
  "ADVANCED": "Confirmé",
  "PRO": "Pro"
};

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const rawProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        include: {
          addresses: {
            take: 1
          }
        }
      },
      category: true,
      brand: true,
      type: true,
      size: true,
      media: true
    }
  }) as any; // Cast as any pour simplifier la gestion des relations incluses dans le template

  if (!rawProduct) {
    notFound();
  }

  const detectedLevel = await learnProductExpertise(rawProduct);
  
  // 1. Calcul du prix moyen de référence filtré par niveau technique (BEGINNER, etc.)
  let averages = await prisma.product.aggregate({
    where: {
      category_id: rawProduct.category_id,
      type_id: rawProduct.type_id,
      is_sold: false,
      levelCategory: detectedLevel as any
    },
    _avg: {
      price: true
    }
  });

  // 2. Repli de sécurité : si aucun autre produit n'a ce niveau, on prend la moyenne globale
  if (!averages._avg.price) {
    averages = await prisma.product.aggregate({
      where: {
        category_id: rawProduct.category_id,
        type_id: rawProduct.type_id,
        is_sold: false
      },
      _avg: {
        price: true
      }
    });
  }

  const averagePrice = averages._avg.price ? Number(averages._avg.price) : 0;

  const dealScore = calculateProductScore({
    state: rawProduct.state,
    price: Number(rawProduct.price),
    averagePrice,
    marketPosition: rawProduct.brand?.marketPosition || "GENERALIST",
    accessoryIncluded: rawProduct.accessory_included,
  });

  const product = {
    ...serializeProduct(rawProduct),
    levelCategory: detectedLevel,
    dealScore,
  } as any;

  // 1. Calcul du matching IA
  const session = await auth();
  let matchData = null;
  let sportProfile = null;
  let isGuest = true;
  let showMatch = false;

  if (session?.user?.id || session?.user?.email) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: { 
        userId: session.user.id ? parseInt(session.user.id) : undefined,
        user: !session.user.id ? { email: session.user.email as string } : undefined
      },
      include: {
        skills: true
      }
    });

    if (sportProfile) {
      matchData = await calculateMatch(sportProfile, product);
      isGuest = false;

      // Vérifie si la catégorie du produit fait partie des sports favoris déclarés dans le Sportif ID
      const userInterests = sportProfile.interests ? (sportProfile.interests as string[]) : [];
      showMatch = userInterests.some(
        (interest: string) => interest.trim().toLowerCase() === product.category.label.trim().toLowerCase()
      );
    }
  }

  // Fallback invité ou profil incomplet : niveau intermédiaire par défaut pour que l'analyse soit toujours disponible !
  if (!matchData) {
    matchData = await calculateMatch({ level: "INTERMEDIATE" }, product);
    isGuest = true;
    showMatch = false;
  }

  const sellerAddress = product.user.addresses?.[0];
  const sellerLocation = sellerAddress ? `${sellerAddress.city}` : "Localisation inconnue";
  
  const mainImage = product.media?.[0]?.url || "/images/placeholder-product.png";

  const getStateStyles = (state: string) => {
    const baseClass = "bg-zinc-900/50 border-white/10";
    switch (state) {
      case "NEUF":
        return `${baseClass} text-cyan-400`;
      case "EXCELLENT":
        return `${baseClass} text-lime-400`;
      case "BON":
        return `${baseClass} text-yellow-300`;
      case "SATISFAISANT":
        return `${baseClass} text-orange-400`;
      default:
        return `${baseClass} text-zinc-400`;
    }
  };

  // ==========================================
  // BLOCS DE COMPOSITION RESPONSIVE (REACT DRY)
  // ==========================================

  // Block 1: Galerie d'images
  const GalleryBlock = (
    <ProductGallery
      media={product.media}
      productTitle={product.title}
      categoryLabel={product.category.label}
    />
  );

  // Block 2: Titre & Prix
  const TitleBlock = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getStateStyles(product.state)}`}>
          {product.state.replace('_', ' ')}
        </span>
        {product.brand && (
          <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            {product.brand.label}
          </span>
        )}
        
        {/* Badge Deal Dynamique */}
        {product.dealScore?.score >= 75 && (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${product.dealScore.colorClass}`}>
            {product.dealScore.label}
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
        {product.title}
      </h1>

      <div className="flex items-baseline gap-3">
        <p className={`text-4xl font-black ${product.dealScore?.glowClass || "text-brand-primary"}`}>
          {Number(product.price)}€
        </p>
        {product.dealScore?.score >= 75 && (
          <span className="text-zinc-500 text-xs font-bold">
            (Excellent prix de gamme)
          </span>
        )}
      </div>
    </div>
  );

  // Block 3: Play Again AI Advice (L'avis de Play Again)
  const AdviceBlock = (
    <>
      {matchData && (
        <div className="w-full p-3.5 md:p-4 rounded-xl bg-linear-to-br from-zinc-900/80 to-black border border-brand-primary/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <CircuitBoard className="w-10 h-10 text-brand-primary" />
          </div>
          
          {/* Header avec Puce IA (CircuitBoard) dans un cercle translucide toujours affichée */}
          <div className="flex items-center gap-3 relative z-10 mb-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
              <CircuitBoard className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
                  {isGuest ? "L'avis de Play Again (Général)" : "L'avis de Play Again"}
                </span>
                <div className="h-px flex-1 bg-brand-primary/20" />
              </div>
              <p className="text-[9px] font-bold text-zinc-400">
                {showMatch ? "Analyse de compatibilité sportive & budget" : "Analyse budget et opportunité d'achat"}
              </p>
            </div>
          </div>

          {/* Corps avec les deux analyses séparées (Niveau et Prix) wrappées sur toute la largeur */}
          <div className="space-y-3 relative z-10 text-xs leading-relaxed mb-3.5">
            {/* Section 1 : Analyse Technique / Niveau (uniquement si le sport fait partie des favoris) */}
            {showMatch && matchData.levelAdvice ? (
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-brand-accent uppercase tracking-widest">Compatibilité Technique</p>
                <p className="font-bold text-zinc-300">{matchData.levelAdvice}</p>
              </div>
            ) : (
              /* Fallback Niveau Conseillé si pas de profil */
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-brand-accent uppercase tracking-widest">Niveau Conseillé</p>
                <p className="font-bold text-zinc-300">
                  Cet équipement est idéalement adapté à un niveau{" "}
                  <span className="text-brand-accent">
                    {LEVEL_LABELS[product.levelCategory] || "Novice"}
                  </span>.
                </p>
              </div>
            )}
            
            {/* Section 2 : Analyse Financière / Prix */}
            {matchData.priceAdvice && (
              <div className="space-y-1.5 border-t border-white/5 pt-2">
                <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Côté Budget</p>
                <p className="font-bold text-zinc-300">{matchData.priceAdvice}</p>
                
                {/* Petits indicateurs issus du Deal Score pour contextualiser le prix */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-medium pt-0.5">
                  {product.dealScore?.priceScore >= 85 && (
                    <span className="text-emerald-400">✓ Prix particulièrement avantageux</span>
                  )}
                  {product.dealScore?.priceScore >= 70 && product.dealScore?.priceScore < 85 && (
                    <span className="text-green-400/90">✓ Prix inférieur à la moyenne</span>
                  )}
                  {product.dealScore?.priceScore >= 55 && product.dealScore?.priceScore < 70 && (
                    <span className="text-zinc-400/80">• Tarif équitable et cohérent</span>
                  )}
                  {product.dealScore?.priceScore >= 35 && product.dealScore?.priceScore < 55 && (
                    <span className="text-zinc-500">• Légèrement supérieur à la moyenne</span>
                  )}
                  {product.dealScore?.priceScore < 35 && (
                    <span className="text-red-400">⚠ Surcoût par rapport à la moyenne</span>
                  )}
                  {product.accessory_included && (
                    <span className="text-emerald-400 font-bold">+ Accessoires inclus (+10 pts)</span>
                  )}
                </div>
              </div>
            )}
            
            {isGuest && (
              <div className="pt-1.5">
                <Link 
                  href={!session ? "/auth/login" : "/profile/sportif-id"}
                  className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-wider"
                >
                  {!session ? "Connecte-toi" : "Remplis ton Sportif ID"} pour personnaliser cet avis →
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 relative z-10">
            {showMatch ? (
              <>
                {/* 1. Niveau */}
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-brand-accent">
                      <Star className="w-2 h-2 fill-current" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Niveau</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {LEVEL_LABELS[matchData.detectedLevel] || "Novice"}
                    </p>
                  </div>
                  {/* Badge de matching IA intégré à droite dans la carte niveau */}
                  <div className="shrink-0 scale-75 origin-right pr-0.5">
                    <MatchBadge score={matchData.score} showLabel={false} />
                  </div>
                </div>
                
                {/* 2. Indice d'Opportunité (Deal Score) intégré */}
                {product.dealScore ? (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <TrendingUp className="w-2 h-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Deal Score</span>
                      </div>
                      <p className={`text-[10px] font-bold ${product.dealScore.glowClass || "text-zinc-400"}`}>
                        {product.dealScore.label}
                      </p>
                    </div>
                    {/* Badge de score de deal à droite */}
                    <div className="shrink-0 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[9px] px-1.5 py-0.5 rounded-full select-none">
                      {product.dealScore.score}/100
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Info className="w-2 h-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Conseil</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {matchData.score >= 80 ? "Go ! Foncé !" : matchData.score >= 50 ? "À tester" : "Attention"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Si le sport n'est pas dans le Sportif ID : on ne montre que le Deal Score prenant toute la largeur */
              <div className="col-span-2">
                {product.dealScore ? (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Deal Score</span>
                      </div>
                      <p className={`text-xs font-bold ${product.dealScore.glowClass || "text-zinc-400"}`}>
                        {product.dealScore.label}
                      </p>
                    </div>
                    {/* Badge de score de deal à droite */}
                    <div className="shrink-0 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-xs px-2.5 py-1 rounded-full select-none">
                      {product.dealScore.score}/100
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Info className="w-2 h-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Conseil</span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">
                      {matchData.score >= 80 ? "Go ! Foncé !" : matchData.score >= 50 ? "À tester" : "Attention"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Nouveau Bloc Opportunité de Prix (Jauge Circulaire SVG)
  const OpportunityBlock = (
    <div className="w-full p-3.5 md:p-4 rounded-xl bg-linear-to-br from-zinc-900/80 to-black border border-brand-accent/20 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-start gap-4 relative z-10">
        {/* Jauge SVG Circulaire */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="19"
              stroke="currentColor"
              strokeWidth="3"
              className="text-zinc-800"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="19"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 19}`}
              strokeDashoffset={`${2 * Math.PI * 19 * (1 - (product.dealScore?.score || 0) / 100)}`}
              className={product.dealScore?.score >= 90 ? "text-emerald-400" : product.dealScore?.score >= 75 ? "text-green-400" : "text-zinc-500"}
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-[10px] font-black text-white">
            {product.dealScore?.score}
          </div>
        </div>
        
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-brand-accent uppercase tracking-[0.2em]">Indice d'Opportunité (Deal Score)</span>
            <div className="h-px flex-1 bg-brand-accent/20" />
          </div>
          <p className={`text-xs font-bold ${product.dealScore?.glowClass || "text-white"} leading-tight`}>
            {product.dealScore?.label}
          </p>
        </div>
      </div>
      <div className="ml-14 space-y-1 relative z-10 text-[9px]">
        {product.dealScore?.priceScore >= 85 && (
          <div className="text-emerald-400 font-medium leading-none pl-1">
            ✓ Prix particulièrement avantageux pour cette gamme
          </div>
        )}
        {product.dealScore?.priceScore >= 70 && product.dealScore?.priceScore < 85 && (
          <div className="text-green-400/90 font-medium leading-none pl-1">
            ✓ Bon plan : prix inférieur à la moyenne du marché
          </div>
        )}
        {product.dealScore?.priceScore >= 55 && product.dealScore?.priceScore < 70 && (
          <div className="text-zinc-400/80 font-medium leading-none pl-1">
            • Prix équitable et cohérent avec la moyenne
          </div>
        )}
        {product.dealScore?.priceScore >= 35 && product.dealScore?.priceScore < 55 && (
          <div className="text-zinc-500 font-medium leading-none pl-1">
            • Prix légèrement supérieur à la moyenne de cette gamme
          </div>
        )}
        {product.dealScore?.priceScore < 35 && (
          <div className="text-red-400 font-medium leading-none pl-1">
            ⚠ Surcoût notable par rapport à la moyenne de cette gamme
          </div>
        )}
        {product.accessory_included && (
          <div className="flex justify-between text-emerald-400 font-bold pl-1 pt-0.5">
            <span>Bonus accessoires inclus :</span>
            <span>+10 pts</span>
          </div>
        )}
      </div>

      {/* Détails transparents */}
      <div className="mt-3 grid grid-cols-2 gap-2 relative z-10 text-[10px] text-zinc-400">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">État du produit</span>
          <p className="font-bold text-zinc-200">{product.dealScore?.stateScore}/100</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Score du Prix</span>
          <p className="font-bold text-zinc-200">{product.dealScore?.priceScore}/100</p>
        </div>
      </div>

    </div>
  );

  // Block 4: Description (sans bordure interne pour faciliter l'alignement responsive)
  const DescriptionBlock = (
    <div className="space-y-4">
      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Description</h2>
      <p className="text-zinc-400 leading-relaxed text-sm md:text-base italic">
        "{product.description || "Aucune description fournie par le vendeur."}"
      </p>
    </div>
  );

  const genderLabels: Record<string, string> = {
    "MAN": "Homme",
    "WOMAN": "Femme",
    "UNISEX": "Unisexe / Mixte",
    "KIDS": "Enfant"
  };

  // Block 5: Spécifications techniques (sans bordure interne pour faciliter l'alignement responsive)
  const SpecsBlock = (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Spécifications techniques</h2>
      
      <div className="grid grid-cols-2 gap-y-6 gap-x-12">
        <DetailItem label="Marque" value={product.brand?.label || "Non spécifié"} />
        <DetailItem label="Taille" value={product.size?.label || "N/A"} />
        <DetailItem label="Type" value={product.type?.label || "Sport"} />
        <DetailItem label="État" value={product.state.replace('_', ' ')} />
        <DetailItem label="Année" value={product.age ? `${product.age}` : "N/A"} />
        <DetailItem label="Accessoires" value={product.accessory_included ? "Inclus" : "Non"} />
        <DetailItem label="Public" value={genderLabels[product.targetGender] || "Unisexe / Mixte"} />
      </div>
    </div>
  );

  const isOwner = session?.user?.id ? parseInt(session.user.id) === product.user_id : false;

  // Block 6: Action Achat & Réassurance
  const BuyNowBlock = (
    <div className="space-y-4 pt-4">
      {!isOwner && (
        <Link href={`/product/${product.id}/checkout`} className="block w-full">
          <Button className="w-full h-16 rounded-3xl bg-brand-primary hover:bg-brand-primary/90 text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 transition-all active:scale-95">
            Acheter maintenant
          </Button>
        </Link>
      )}

      {!isOwner && (
        <form action={async () => {
          "use server";
          const { getOrCreateConversation } = await import("@/app/actions/message");
          const { redirect } = await import("next/navigation");
          let conversationId;
          try {
            const res = await getOrCreateConversation(product.id);
            conversationId = res.conversationId;
          } catch (err) {
            console.error(err);
            return;
          }
          if (conversationId) {
            redirect(`/messages/${conversationId}`);
          }
        }}>
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-accent/50 text-white text-sm font-black uppercase tracking-[0.1em] shadow-lg transition-all active:scale-95"
          >
            💬 Contacter le vendeur
          </Button>
        </form>
      )}
      
      <CompareButtonWrapper product={product} />
      
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Truck className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Envoi Rapide</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-brand-accent/20 flex flex-col items-center justify-center text-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-accent" />
          <span className="text-[9px] font-black text-brand-accent uppercase tracking-tighter">48h retour</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Shield className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Tiers Confiance</span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 font-bold text-center leading-relaxed flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
        Protection de 48h après livraison en cas de non-conformité.
      </p>
    </div>
  );

  // Block 7: Vendeur
  const SellerBlock = (
    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm flex items-center justify-between group hover:bg-zinc-900/80 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden relative">
          {product.user.profile_picture ? (
            <img src={product.user.profile_picture} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-zinc-600" />
          )}
        </div>
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vendeur</p>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-lg">{product.user.username}</p>
            {product.user.is_certified && (
              <ShieldCheck className="w-5 h-5 text-brand-accent" />
            )}
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{sellerLocation}</span>
          </div>
        </div>
      </div>
      <Link 
        href={`/profile/${product.user.id}`} 
        className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 text-zinc-400 group-hover:text-brand-accent group-hover:border-brand-accent/50 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[40px_40px] opacity-25" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Navigation & Actions - Sortis du conteneur central pour être positionnés de chaque côté de l'écran */}
        <div className="w-full px-4 md:px-12 pt-20 md:pt-24 flex items-center justify-between mb-0">
          <BackButton fallbackHref="/shop" />

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-brand-primary">
              <Share2 className="w-5 h-5" />
            </button>
            <BookmarkButtonWrapper productId={product.id} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-0.5">

          {/* ==========================================
              LAYOUT ADAPTATIF ET RESPONSIVE
             ========================================== */}

          {/* 💻 VUE BUREAU / GRAND ÉCRAN (Double Colonne Alignée au pixel près) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-10">
              {/* Colonne Gauche : Visuels, Description & Specs */}
              <div className="lg:col-span-7 space-y-10">
                {GalleryBlock}
                <div className="pt-6 border-t border-white/5 space-y-10">
                  {DescriptionBlock}
                  {SpecsBlock}
                </div>
              </div>
              
              {/* Colonne Droite : Transactionnel, Opportunité, Conseil & Vendeur */}
              <div className="lg:col-span-5 space-y-8">
                {TitleBlock}
                {BuyNowBlock}
                {AdviceBlock}
                {SellerBlock}
              </div>
            </div>
          </div>

          {/* 📱 VUE MOBILE / ÉCRAN INTERMÉDIAIRE (Flux Linéaire Spécifique) */}
          <div className="lg:hidden space-y-8">
            {GalleryBlock}
            {TitleBlock}
            {BuyNowBlock}
            {AdviceBlock}
            <div className="pt-6 border-t border-white/5 space-y-8">
              {DescriptionBlock}
              {SpecsBlock}
            </div>
            {SellerBlock}
          </div>

        </div>
      </div>
    </main>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{label}</p>
      <p className="text-white font-bold text-sm uppercase tracking-tight">{value}</p>
    </div>
  );
}
