import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FavoritesManager } from "@/components/profile/FavoritesManager";
import { getUserBookmarks } from "@/app/actions/bookmark";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProfileFavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const serializedLists = await getUserBookmarks();

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 md:pt-10 space-y-6">
          
          {/* Fil d'Ariane / Retour */}
          <div className="flex items-center gap-2 relative z-10">
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour au Profil
            </Link>
          </div>

          {/* Section Manager */}
          <FavoritesManager initialLists={serializedLists} />
        </div>
      </div>
    </main>
  );
}
