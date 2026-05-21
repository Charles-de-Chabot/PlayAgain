import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SportProfileForm } from "@/components/profile/SportProfileForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function SportifIDPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sportProfile: {
        include: {
          skills: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { label: 'asc' }
  });

  return (
    <main className="min-h-screen bg-black text-white py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-brand-primary blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-brand-accent blur-[150px] opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Retour au profil</span>
          </Link>
          
          <div className="text-right">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              Sportif <span className="text-brand-accent">ID</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2">L'Intelligence au Service du Sport</p>
          </div>
        </div>

        {/* Le Formulaire Stepper */}
        <div className="mt-8">
          <SportProfileForm 
            initialData={user.sportProfile} 
            categories={categories} 
          />
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-zinc-700 text-[9px] font-bold uppercase tracking-[0.2em] max-w-lg mx-auto">
          En complétant ton Sportif ID, tu permets à PlayAgain de te proposer uniquement des articles adaptés à ta morphologie et ton niveau.
        </p>
      </div>
    </main>
  );
}
