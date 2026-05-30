import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { NotificationsClient } from "@/app/profile/notifications/NotificationsClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserNotifications } from "@/app/actions/notification";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Charger les notifications initiales (les 100 dernières pour historique)
  let initialNotifications: any[] = [];
  try {
    initialNotifications = await getUserNotifications(100);
  } catch (error) {
    console.error("Erreur de chargement des notifications serveur:", error);
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor - Premium Glass Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[1000px] mx-auto px-6 md:px-10 pt-6 md:pt-10">
          {/* Breadcrumb / Return link */}
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
            Retour au profil
          </Link>

          <NotificationsClient initialNotifications={initialNotifications} />
        </div>
      </div>
    </main>
  );
}
