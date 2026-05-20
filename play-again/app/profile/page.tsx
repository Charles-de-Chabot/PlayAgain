import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { 
  User, 
  Settings, 
  Heart, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  HelpCircle
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
      sportProfile: true,
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

  // Aplatir et sérialiser les achats
  const purchasedProducts = user.invoices.flatMap(inv => 
    inv.items.map(item => serializeProduct(item.product))
  );

  const sidebarItems = [
    { icon: Heart, label: "Favoris", href: "/profile/favorites" },
    { icon: MapPin, label: "Mes adresses", href: "/profile/addresses" },
    { icon: Settings, label: "Paramètres", href: "/profile/settings" },
    { icon: HelpCircle, label: "Aide", href: "/help" },
  ];

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
          
          {/* Infos Profil - Full Width / Glass Style */}
          <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-brand-primary to-brand-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
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
            
            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {user.firstname && user.lastname 
                  ? `${user.firstname} ${user.lastname}` 
                  : user.username || "Utilisateur"}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <p className="text-zinc-400 text-sm md:text-base font-medium">{user.email}</p>
                {/* Dynamic Sportif ID Badge */}
                {(() => {
                  const levelMap: Record<string, { label: string, color: string, border: string, bg: string, dot: string }> = {
                    "BEGINNER": { label: "Novice", color: "text-zinc-400", border: "border-zinc-400/20", bg: "bg-zinc-400/5", dot: "bg-zinc-400" },
                    "INTERMEDIATE": { label: "Intermédiaire", color: "text-indigo-400", border: "border-indigo-400/20", bg: "bg-indigo-400/5", dot: "bg-indigo-400" },
                    "ADVANCED": { label: "Confirmé", color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/5", dot: "bg-amber-500" },
                    "PRO": { label: "Elite Pro", color: "text-rose-500", border: "border-rose-500/20", bg: "bg-rose-500/5", dot: "bg-rose-500" },
                  };
                  
                  const levelData = user.sportProfile?.level ? levelMap[user.sportProfile.level] : null;
                  
                  return (
                    <Link 
                      href="/profile/sportif-id"
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 border transition-all group rounded-full",
                        levelData 
                          ? `${levelData.bg} ${levelData.border} ${levelData.color} hover:bg-white hover:text-black hover:border-white`
                          : "bg-zinc-900 border-white/10 text-zinc-500 hover:border-brand-accent hover:text-brand-accent"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        levelData ? levelData.dot : "bg-zinc-700"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">
                        Sportif ID {levelData && <span className="ml-1 opacity-60">• {levelData.label}</span>}
                      </span>
                    </Link>
                  );
                })()}
              </div>
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
              <div className="bg-zinc-900/70 backdrop-blur-xl rounded-4xl border border-white/10 p-3 shadow-2xl">
                <h2 className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Navigation
                </h2>
                <div className="space-y-1">
                  {sidebarItems.map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.href}
                      className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/10 hover:scale-[1.02] transition-all group border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand-accent transition-colors shadow-inner">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-4 p-4">
                  <button className="w-full py-4 rounded-2xl bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
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
