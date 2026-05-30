import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  BellRing, 
  Tags, 
  Cpu, 
  Sliders, 
  Skull, 
  Truck, 
  History, 
  Ticket, 
  LifeBuoy, 
  HardDrive, 
  Globe, 
  LogOut, 
  Lock 
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Redirection si l'utilisateur n'est pas connecté
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  // 2. Vérification du rôle d'administrateur
  const userRole = (session.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  if (!isAdmin) {
    // Rendu d'une page 403 d'accès interdit premium
    return (
      <div className="fixed inset-0 bg-[#070A13] z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,transparent_70%)]" />
        <div className="max-w-md w-full bg-white/[0.02] backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Accès Refusé (403)
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Votre compte ne possède pas les privilèges administratifs requis pour accéder à l'espace `/admin` de PlayAgain.
          </p>
          <div className="space-y-3">
            <Link 
              href="/"
              className="block w-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm"
            >
              Retourner à l'Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Navigation des 15 Modules Administratifs
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Utilisateurs", href: "/admin/users", icon: Users },
    { label: "Catalogue", href: "/admin/catalog", icon: ShoppingBag },
    { label: "Transactions & Litiges", href: "/admin/transactions", icon: CreditCard },
    { label: "Vérifications d'ID", href: "/admin/verifications", icon: ShieldCheck },
    { label: "Notifications & Sondages", href: "/admin/notifications", icon: BellRing },
    { label: "Marques & IA", href: "/admin/taxonomy", icon: Tags },
    { label: "Commissions", href: "/admin/finance-config", icon: Sliders },
    { label: "Détection Fraude", href: "/admin/fraud", icon: Skull },
    { label: "Logistique Active", href: "/admin/shipping", icon: Truck },
    { label: "Audit Interne", href: "/admin/audit-logs", icon: History },
    { label: "Codes Promos", href: "/admin/marketing", icon: Ticket },
    { label: "Helpdesk Support", href: "/admin/support", icon: LifeBuoy },
    { label: "Nettoyeur d'Images", href: "/admin/system", icon: HardDrive },
    { label: "Console SEO", href: "/admin/seo", icon: Globe },
  ];

  return (
    <div className="fixed inset-0 bg-[#070A13] z-50 overflow-hidden flex font-sans select-none">
      {/* Arrière-plan Cybernétectique */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03)_0%,transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.03)_0%,transparent_40%)]" />
      
      {/* 🚀 Barre Latérale Administrative (Sidebar) */}
      <aside className="w-64 bg-[#0E1322]/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col h-full z-30 shrink-0">
        {/* En-tête Sidebar */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              PLAYAGAIN
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest">
              Admin
            </span>
          </Link>
        </div>

        {/* Liens de Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] active:scale-98 transition-all text-xs font-semibold group"
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#10B981] transition-colors" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profil Modérateur (Pied de Sidebar) */}
        <div className="p-4 border-t border-white/[0.06] bg-black/[0.15]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-extrabold text-white truncate">
                {session.user?.name || "Modérateur"}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {session.user?.email}
              </span>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 active:scale-95 transition-all shrink-0"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 🖥️ Fenêtre Principale de Rendu (Content Viewport) */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#070A13] text-slate-100 relative z-10 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
