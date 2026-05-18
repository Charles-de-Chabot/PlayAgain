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
import { calculateMatch } from "@/lib/ai/matcher";
import { MatchBadge } from "@/components/home/MatchBadge";
import { CircuitBoard, Info, Star } from "lucide-react";

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
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

  if (!product) {
    notFound();
  }

  // 1. Calcul du matching IA
  const session = await auth();
  let matchData = null;
  let sportProfile = null;

  if (session?.user?.id || session?.user?.email) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: { 
        userId: session.user.id ? parseInt(session.user.id) : undefined,
        user: !session.user.id ? { email: session.user.email as string } : undefined
      }
    });

    if (sportProfile) {
      matchData = await calculateMatch(sportProfile, product);
    }
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
    <div className="space-y-4 w-full">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
        <img 
          src={mainImage} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {/* Badge Catégorie */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-brand-primary/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
          {product.category.label}
        </div>
      </div>

      {/* Thumbnails si plusieurs images */}
      {product.media.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {product.media.map((m: any, i: number) => (
            <div key={m.id} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${i === 0 ? 'border-brand-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}>
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
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
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
        {product.title}
      </h1>

      <p className="text-4xl font-black text-brand-primary">
        {Number(product.price)}€
      </p>
    </div>
  );

  // Block 3: Play Again AI Advice (L'avis de Play Again)
  const PlayAgainBlock = (
    <>
      {matchData ? (
        <div className="p-6 rounded-3xl bg-linear-to-br from-zinc-900/80 to-black border-2 border-brand-primary/20 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CircuitBoard className="w-16 h-16 text-brand-primary" />
          </div>
          
          <div className="flex items-start gap-8 relative z-10">
            <div className="shrink-0">
              <MatchBadge score={matchData.score} showLabel={false} className="scale-125 origin-top-left" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">L'avis de Play Again</span>
                <div className="h-px flex-1 bg-brand-primary/20" />
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                {matchData.explanation}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-brand-accent">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[9px] font-black uppercase tracking-widest">Niveau</span>
              </div>
              <p className="text-xs font-bold text-zinc-300">{matchData.detectedLevel}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Info className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Conseil</span>
              </div>
              <p className="text-xs font-bold text-zinc-300">
                {matchData.score >= 80 ? "Go ! Foncé !" : matchData.score >= 50 ? "À tester" : "Attention"}
              </p>
            </div>
          </div>
        </div>
      ) : !session ? (
        <Link href="/login" className="block p-6 rounded-3xl bg-zinc-900/30 border border-white/5 border-dashed text-center group hover:border-brand-primary/50 transition-all">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Connecte-toi pour voir ton score de match</p>
        </Link>
      ) : !sportProfile && (
        <Link href="/profile/sportif-id" className="block p-6 rounded-3xl bg-zinc-900/30 border border-white/5 border-dashed text-center group hover:border-brand-accent/50 transition-all">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-brand-accent transition-colors">Remplis ton Sportif ID pour voir ton score</p>
        </Link>
      )}
    </>
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
      </div>
    </div>
  );

  // Block 6: Action Achat & Réassurance
  const BuyNowBlock = (
    <div className="space-y-4 pt-4">
      <Button className="w-full h-16 rounded-3xl bg-brand-primary hover:bg-brand-primary/90 text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 transition-all active:scale-95">
        Acheter maintenant
      </Button>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Truck className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Envoi Rapide</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <RotateCcw className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">14j Retours</span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
          <Shield className="w-5 h-5 text-zinc-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Paiement Sécurisé</span>
        </div>
      </div>
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
        href={`/profile/${product.user.username}`} 
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

        <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-8">
          
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-brand-primary/50">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
            </Link>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-brand-primary">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-red-500">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ==========================================
              LAYOUT ADAPTATIF ET RESPONSIVE
             ========================================== */}

          {/* 💻 VUE BUREAU / GRAND ÉCRAN (Double Colonne Alignée au pixel près) */}
          <div className="hidden lg:block space-y-12">
            {/* Rangée 1 : Galerie & Transactionnel */}
            <div className="grid grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                {GalleryBlock}
              </div>
              <div className="lg:col-span-5 space-y-8">
                {TitleBlock}
                {BuyNowBlock}
                {PlayAgainBlock}
                {SellerBlock}
              </div>
            </div>

            {/* Rangée 2 : Détails & Description sans trait de séparation */}
            <div className="grid grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                {DescriptionBlock}
              </div>
              <div className="lg:col-span-5">
                {SpecsBlock}
              </div>
            </div>
          </div>

          {/* 📱 VUE MOBILE / ÉCRAN INTERMÉDIAIRE (Flux Linéaire Spécifique avec séparateurs) */}
          <div className="lg:hidden space-y-8">
            {GalleryBlock}
            {TitleBlock}
            {BuyNowBlock}
            {PlayAgainBlock}
            {DescriptionBlock}
            {SpecsBlock}
            
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
