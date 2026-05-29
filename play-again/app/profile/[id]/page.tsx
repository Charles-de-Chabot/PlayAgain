import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PublicProfileTabs } from "@/components/profile/PublicProfileTabs";
import { 
  User, 
  ShieldCheck, 
  ChevronLeft,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function PublicProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sportProfile: {
        include: {
          skills: true,
        },
      },
      products: {
        where: {
          is_active: true,
        },
        orderBy: {
          created_at: "desc",
        },
        include: {
          category: true,
          media: true,
        },
      },
      addresses: {
        take: 1
      }
    },
  });

  if (!user) {
    notFound();
  }

  // Sérialisation des produits pour éviter l'erreur Decimal de Prisma et adapter les dates
  const serializeProduct = (p: any) => ({
    ...p,
    price: Number(p.price),
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  });

  const serializedProducts = user.products.map(serializeProduct);
  const activeListings = serializedProducts.filter((p: any) => !p.is_sold);
  const soldListings = serializedProducts.filter((p: any) => p.is_sold);
  const soldCount = soldListings.length;

  const sellerAddress = user.addresses?.[0];
  const sellerLocation = sellerAddress ? `${sellerAddress.city}` : null;

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor - Premium Glimmer */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 md:pt-10">
          
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/shop" 
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group w-fit"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">Retour à la boutique</span>
            </Link>
          </div>

          {/* Infos Profil - Glass Card */}
          <div className="mb-10 pb-8 border-b border-white/10 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              
              {/* Left Column: Avatar & Public User Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-primary to-brand-accent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                  <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.username || "Seller"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 md:w-14 md:h-14 text-zinc-700" />
                    )}
                  </div>
                  {user.is_certified && (
                    <div className="absolute -bottom-1 -right-1 bg-brand-accent text-black p-1.5 rounded-full border-2 border-black shadow-lg">
                      <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase italic">
                      {user.firstname && user.lastname 
                        ? `${user.firstname} ${user.lastname}` 
                        : user.username || "Utilisateur"}
                    </h1>

                    {/* Badge Ventes Réussies */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-accent/30 bg-zinc-950/80 hover:bg-zinc-900/50 transition-all select-none group w-fit cursor-default shrink-0 shadow-[0_0_10px_rgba(198,255,52,0.05)] hover:shadow-[0_0_15px_rgba(198,255,52,0.15)] hover:border-brand-accent/50 duration-300">
                      <span className="text-[10px] animate-pulse">⚡</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-accent">
                        {soldCount} {soldCount > 1 ? "équipements vendus" : "équipement vendu"}
                      </span>
                    </div>
                    
                    {/* Sportif ID Indicator */}
                    {user.sportProfile && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/5 select-none group w-fit shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_var(--color-brand-accent)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-accent">
                          Sportif ID Activé
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {sellerLocation && (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      <span>{sellerLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sports Badges (Sportif ID Public View) */}
              {user.sportProfile?.skills && user.sportProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-w-xl md:justify-end shrink-0">
                  {user.sportProfile.skills.map((skill) => {
                    const levelMap: Record<string, { label: string, color: string, border: string, bg: string }> = {
                      "BEGINNER": { label: "Novice", color: "text-zinc-400", border: "border-zinc-400/25", bg: "bg-zinc-400/5" },
                      "INTERMEDIATE": { label: "Intermédiaire", color: "text-indigo-400", border: "border-indigo-400/25", bg: "bg-indigo-400/5" },
                      "ADVANCED": { label: "Confirmé", color: "text-amber-500", border: "border-amber-500/25", bg: "bg-amber-500/5" },
                      "PRO": { label: "Pro", color: "text-rose-500", border: "border-rose-500/25", bg: "bg-rose-500/5" },
                    };
                    
                    const levelData = levelMap[skill.level];
                    
                    return (
                      <span 
                        key={skill.id} 
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-[1.03] duration-200 select-none cursor-default shrink-0",
                          levelData 
                            ? `${levelData.bg} ${levelData.border} ${levelData.color} hover:brightness-125` 
                            : "bg-white/5 border-white/10 text-zinc-400"
                        )}
                      >
                        <span>{skill.sportName}</span>
                        <span className="opacity-30 font-normal">•</span>
                        <span className="font-black italic">{levelData?.label || skill.level}</span>
                      </span>
                    );
                  })}
                </div>
              ) : user.sportProfile?.interests && Array.isArray(user.sportProfile.interests) && (user.sportProfile.interests as string[]).length > 0 ? (
                <div className="flex flex-wrap gap-2 max-w-xl md:justify-end shrink-0">
                  {(user.sportProfile.interests as string[]).map((sport, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-brand-accent hover:border-brand-accent/30 hover:bg-brand-accent/5 transition-all select-none cursor-default shrink-0"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              ) : null}

            </div>
          </div>

          {/* Grille des articles & Tabs */}
          <div className="w-full">
            <PublicProfileTabs 
              activeListings={activeListings} 
              soldListings={soldListings} 
            />
          </div>

        </div>
      </div>
    </main>
  );
}
