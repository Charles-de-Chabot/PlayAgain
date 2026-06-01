import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { AddressesManager } from "@/components/profile/AddressesManager";

export default async function ProfileAddressesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);
  if (isNaN(userId)) {
    redirect("/auth/login");
  }

  // Fetch addresses: primary first, then sorted by most recent
  const userAddresses = await prisma.address.findMany({
    where: { user_id: userId },
    orderBy: [
      { is_default: "desc" },
      { created_at: "desc" }
    ],
  });

  // Safe serialization of decimals, dates and dynamic types
  const addresses = JSON.parse(JSON.stringify(userAddresses));

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 md:pt-10 space-y-6">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center gap-2 relative z-10">
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour au Profil
            </Link>
          </div>

          {/* En-tête de la page */}
          <div className="flex items-center gap-4 relative z-10 border-b border-white/10 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-[0_0_15px_rgba(125,56,255,0.15)] shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase italic leading-none">
                Mes <span className="text-brand-primary">Adresses</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Gorez vos adresses de livraison enregistrées et définissez celle par défaut pour vos futurs achats.
              </p>
            </div>
          </div>

          {/* Gestionnaire d'adresses interactif */}
          <AddressesManager initialAddresses={addresses} />
        </div>
      </div>
    </main>
  );
}
