import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { Header } from "@/components/layout/Header";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { StripePayoutButton } from "@/components/profile/StripePayoutButton";
import { 
  User, 
  Heart, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  DollarSign,
  Bell
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id!) },
    include: {
      sportProfile: {
        include: {
          skills: true,
        },
      },
      products: {
        orderBy: {
          created_at: "desc",
        },
        include: {
          category: true,
          media: true,
        },
      },
      basket: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  media: true,
                },
              },
            },
          },
        },
      },
      invoices: {
        orderBy: {
          invoice_date: "desc",
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  media: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Sérialisation des produits pour éviter l'erreur Decimal de Prisma
  const serializeProduct = (p: any) => ({
    ...p,
    price: Number(p.price),
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  });

  const serializedListings = user.products.map(serializeProduct);
  const soldCount = user.products.filter((p: any) => p.is_sold).length;

  // Aplatir et sérialiser les achats
  const purchasedProducts = user.invoices.flatMap(inv => 
    inv.items.map(item => ({
      ...serializeProduct(item.product),
      invoiceId: inv.id
    }))
  );

  // Compter le nombre d'articles dans la liste par défaut "Favoris"
  const defaultFavoritesCount = await prisma.favItem.count({
    where: {
      bookmark: {
        user_id: userId,
        name: "Favoris"
      }
    }
  });

  // Compter le nombre de notifications non lues
  const unreadNotificationsCount = await prisma.notification.count({
    where: {
      user_id: userId,
      is_opened: false
    }
  });

  const sidebarItems = [
    { icon: Heart, label: "Favoris", href: "/profile/favorites", count: defaultFavoritesCount },
    { icon: Bell, label: "Notifications", href: "/profile/notifications", count: unreadNotificationsCount },
    { icon: DollarSign, label: "Mes ventes", href: "/profile/sales" },
    { icon: MapPin, label: "Mes adresses", href: "/profile/addresses" },
    { icon: HelpCircle, label: "Aide", href: "/help" },
  ];

  let isStripeActive = false;
  if (user.stripeConnectId) {
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const account = await stripe.accounts.retrieve(user.stripeConnectId);
        isStripeActive = account.details_submitted;
      }
    } catch (err) {
      console.error("Erreur de récupération du compte Stripe Connect au profil:", err);
    }
  }

  const hasHiddenProducts = user.products.some((p: any) => !p.is_sold) && !isStripeActive;

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor - Login Style */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 md:pt-10">
          {hasHiddenProducts && (
            <div className="mb-8 w-full p-4 rounded-3xl bg-zinc-950/80 border border-brand-primary/30 backdrop-blur-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_30px_rgba(125,56,255,0.15)]">
              {/* Glow effect internally */}
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-brand-primary blur-[40px] opacity-20 pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
                  ⚡
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white italic">
                    Action requise : activez vos ventes
                  </h3>
                  <p className="text-xs text-zinc-400 font-bold">
                    Vos articles mis en vente ne sont pas visibles sur la boutique tant que vous n'avez pas configuré votre IBAN.
                  </p>
                </div>
              </div>
              <div className="relative z-10 self-end md:self-center shrink-0">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-accent">
                  En attente de compte Stripe Connect
                </span>
              </div>
            </div>
          )}
          {/* Infos Profil - Full Width / Glass Style */}
          <div className="mb-10 pb-8 border-b border-white/10 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
              
              {/* Left Column: Avatar & User Details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-primary to-brand-accent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                  <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.username || "Profile"} 
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

                    {/* Badge Ventes Réussies (Preuve Sociale Compacte) */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-accent/30 bg-zinc-950/80 hover:bg-zinc-900/50 transition-all select-none group w-fit cursor-default shrink-0 shadow-[0_0_10px_rgba(198,255,52,0.05)] hover:shadow-[0_0_15px_rgba(198,255,52,0.15)] hover:border-brand-accent/50 duration-300">
                      <span className="text-[10px] animate-pulse">⚡</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-accent">
                        {soldCount} {soldCount > 1 ? "équipements vendus" : "équipement vendu"}
                      </span>
                    </div>
                    
                    {/* Dedicated Premium Sportif ID Badge */}
                    {user.sportProfile ? (
                      <Link 
                        href="/profile/sportif-id"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/5 hover:bg-brand-accent/15 transition-all select-none group w-fit shrink-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_var(--color-brand-accent)]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-brand-accent group-hover:brightness-110">
                          Sportif ID Activé
                        </span>
                      </Link>
                    ) : (
                      <Link 
                        href="/profile/sportif-id"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/15 transition-all select-none group w-fit shrink-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-zinc-400 group-hover:text-zinc-200">
                          Activer mon ID
                        </span>
                      </Link>
                    )}
                  </div>
                  
                  <p className="text-zinc-550 text-xs md:text-sm font-medium">{user.email}</p>
                </div>
              </div>

              {/* Right Column: Sports Badges */}
              {user.sportProfile?.skills && user.sportProfile.skills.length > 0 ? (
                <div className="hidden md:flex flex-wrap gap-2 max-w-xl md:justify-end shrink-0">
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
                <div className="hidden md:flex flex-wrap gap-2 max-w-xl md:justify-end shrink-0">
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

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* COLONNE GAUCHE / PRINCIPALE */}
            <div className="flex-1 w-full">
              <ProfileTabs 
                listings={serializedListings} 
                purchases={purchasedProducts} 
              />
            </div>

            {/* COLONNE DROITE / SIDEBAR */}
            <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
              <div className="bg-zinc-950/80 backdrop-blur-2xl rounded-[36px] border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                {/* Decorative glows inside sidebar */}
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-brand-primary blur-[60px] opacity-25 pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#5ce1e6] blur-[60px] opacity-15 pointer-events-none" />

                <h2 className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary relative z-10">
                  Navigation
                </h2>
                <div className="space-y-1.5 relative z-10">
                  {sidebarItems.map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.href}
                      className="flex items-center justify-between p-3.5 rounded-3xl hover:bg-linear-to-r hover:from-white/5 hover:to-brand-primary/5 hover:scale-[1.01] transition-all group border border-transparent hover:border-white/10 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-brand-primary group-hover:border-brand-primary/30 group-hover:shadow-[0_0_15px_rgba(125,56,255,0.4)] transition-all">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{item.label}</span>
                          {item.count !== undefined && item.count > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[10px] font-black tracking-wider shadow-[0_0_10px_rgba(125,56,255,0.25)]">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-650 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-5 p-2 relative z-10 border-t border-white/5 pt-5 space-y-4">
                  <StripePayoutButton 
                    stripeConnectId={user.stripeConnectId} 
                    shouldPulse={hasHiddenProducts}
                  />
                  
                  <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all">
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
