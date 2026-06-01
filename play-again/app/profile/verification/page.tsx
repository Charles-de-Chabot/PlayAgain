import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { VerificationClient } from "./VerificationClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function VerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  // Récupérer l'utilisateur, sa dernière demande de vérification et son adresse par défaut
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        where: { is_default: true }
      },
      // On récupère uniquement la demande la plus récente
      verificationRequests: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const defaultAddress = user.addresses[0] || null;
  const latestRequest = user.verificationRequests[0] || null;

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor - Premium Glass Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-60" />
      </div>

      <div className="relative z-10 pt-[64px] md:pt-[81px]">
        <Header />

        <div className="max-w-[800px] mx-auto px-6 md:px-10 pt-6 md:pt-10">
          {/* Breadcrumb / Return link */}
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" />
            Retour au profil
          </Link>

          <VerificationClient 
            user={{
              id: user.id,
              email: user.email,
              phone: user.phone,
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              stripeConnectId: user.stripeConnectId
            }}
            defaultAddress={defaultAddress}
            latestRequest={latestRequest}
          />
        </div>
      </div>
    </main>
  );
}
