import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
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

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      products: {
        include: {
          category: true,
          media: true
        }
      },
      invoices: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  media: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Aplatir les achats (produits achetés via les factures)
  const purchasedProducts = user.invoices.flatMap(inv => 
    inv.items.map(item => item.product)
  );

  const sidebarItems = [
    { icon: Heart, label: "Favoris", href: "/profile/bookmarks" },
    { icon: MapPin, label: "Mes adresses", href: "/profile/addresses" },
    { icon: Settings, label: "Paramètres", href: "/profile/settings" },
    { icon: HelpCircle, label: "Aide", href: "/help" },
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-hidden font-sans">
      {/* Background Decor - Minimalist Dark Style (No halos) */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
      </div>

      <div className="relative z-10">
        <Header />

        <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-10">
          
          {/* Infos Profil - Full Width / Glass Style */}
          <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-brand-primary to-brand-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden">
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
              <div className="flex items-center gap-2">
                {/* <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-brand-accent uppercase tracking-widest border border-white/5">
                  Compte vérifier
                </span> */}
                <p className="text-zinc-500 text-sm md:text-base font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* COLONNE GAUCHE / PRINCIPALE */}
            <div className="flex-1 w-full">
              <ProfileTabs 
                listings={user.products} 
                purchases={purchasedProducts} 
              />
            </div>

            {/* COLONNE DROITE / SIDEBAR */}
            <div className="w-full md:w-80 shrink-0 md:sticky md:top-24">
              <div className="bg-zinc-900/40 backdrop-blur-xl rounded-4xl border border-white/5 p-3 shadow-2xl">
                <h2 className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Navigation
                </h2>
                <div className="space-y-1">
                  {sidebarItems.map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.href}
                      className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 hover:scale-[1.02] transition-all group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-brand-accent transition-colors shadow-inner">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-4 p-4">
                  <button className="w-full py-4 rounded-2xl bg-zinc-800/50 border border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <MobileNavbar />
    </main>
  );
}
