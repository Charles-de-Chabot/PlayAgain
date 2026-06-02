import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import NotificationTracker from "@/components/layout/NotificationTracker";
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
        <div className="max-w-md w-full bg-white/2 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative z-10">
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

  // 3. Récupération simultanée des données de notifications
  // 3. Récupération des cookies de visite pour les badges
  const cookieStore = await cookies();
  const lastVisitedUsers = cookieStore.get("last_visited_users")?.value;
  const lastVisitedCatalog = cookieStore.get("last_visited_catalog")?.value;
  const lastVisitedTaxonomy = cookieStore.get("last_visited_taxonomy")?.value;
  const lastVisitedFraud = cookieStore.get("last_visited_fraud")?.value;
  const lastVisitedShipping = cookieStore.get("last_visited_shipping")?.value;
  const lastVisitedSystem = cookieStore.get("last_visited_system")?.value;

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  // Seuils de détection basés sur la dernière visite (ou 24h/5j par défaut)
  const usersThreshold = lastVisitedUsers ? new Date(lastVisitedUsers) : last24h;
  const catalogThreshold = lastVisitedCatalog ? new Date(lastVisitedCatalog) : last24h;
  const taxonomyThreshold = lastVisitedTaxonomy ? new Date(lastVisitedTaxonomy) : last24h;
  const fraudThreshold = lastVisitedFraud ? new Date(lastVisitedFraud) : last24h;
  const systemThreshold = lastVisitedSystem ? new Date(lastVisitedSystem) : undefined;

  // Calcul mathématique précis pour la logistique : 
  // Ne montrer un colis en retard que s'il est devenu en retard (date_facture < 5j) APRÈS la dernière visite.
  const shippingDelayStart = lastVisitedShipping 
    ? new Date(new Date(lastVisitedShipping).getTime() - 5 * 24 * 60 * 60 * 1000) 
    : undefined;

  const [
    newTicketsCount,
    pendingVerificationsCount,
    disputedInvoicesCount,
    newBrandsCount,
    newUsersCount,
    newProductsCount,
    delayedShippingCount,
    stripeFraudGroups,
    phoneFraudGroups,
    orphanStorageConfig,
    latestSuspiciousUser
  ] = await Promise.all([
    // Support
    prisma.supportTicket.count({ where: { status: "NEW" } }),
    // ID Verifications
    prisma.verificationRequest.count({ where: { status: "PENDING" } }),
    // Litiges
    prisma.invoice.count({ where: { is_disputed: true } }),
    // Nouvelles marques
    prisma.brand.count({ where: { createdAt: { gte: taxonomyThreshold } } }),
    // Nouveaux inscrits
    prisma.user.count({ where: { created_at: { gte: usersThreshold } } }),
    // Nouveaux articles
    prisma.product.count({ where: { is_sold: false, is_active: true, created_at: { gte: catalogThreshold } } }),
    // Colis en retard
    prisma.invoice.count({
      where: {
        status: "SHIPPED",
        invoice_date: {
          lt: fiveDaysAgo,
          ...(shippingDelayStart ? { gt: shippingDelayStart } : {})
        }
      }
    }),
    // Fraude Stripe
    prisma.user.groupBy({
      by: ['stripeConnectId'],
      where: { stripeConnectId: { not: null }, is_active: true },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } }
    }),
    // Fraude Téléphone
    prisma.user.groupBy({
      by: ['phone'],
      where: { phone: { not: null }, is_active: true },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } }
    }),
    // Nettoyeur d'Images (Pris du SystemConfig cache)
    prisma.systemConfig.findUnique({ where: { key: "orphans_storage_size_bytes" } }),
    // Dernier suspect détecté pour évaluer la nouveauté de la fraude
    prisma.user.findFirst({
      where: { is_active: true, OR: [{ stripeConnectId: { not: null } }, { phone: { not: null } }] },
      orderBy: { created_at: "desc" },
      select: { created_at: true }
    }),
  ]);

  // Si le suspect le plus récent est postérieur à la visite de l'admin, on affiche le badge de fraude
  const hasNewFraud = latestSuspiciousUser 
    ? latestSuspiciousUser.created_at > fraudThreshold 
    : false;
  const fraudBadgeCount = hasNewFraud ? (stripeFraudGroups.length + phoneFraudGroups.length) : 0;

  // Calcul de la mémoire orpheline pour le nettoyeur d'images
  const orphanSizeBytes = orphanStorageConfig ? parseInt(orphanStorageConfig.value) : 0;
  const orphanSizeThreshold = 100 * 1024 * 1024; // 100 Mo
  
  // N'afficher le badge du nettoyeur d'images que si la taille dépasse 100 Mo et si l'admin n'a pas encore visité la page
  const orphanBadge = (orphanSizeBytes > orphanSizeThreshold && !systemThreshold)
    ? `${(orphanSizeBytes / (1024 * 1024)).toFixed(0)}M` 
    : undefined;

  // Navigation des 15 Modules Administratifs
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { 
      label: "Utilisateurs", 
      href: "/admin/users", 
      icon: Users,
      badge: newUsersCount > 0 ? newUsersCount : undefined
    },
    { 
      label: "Catalogue", 
      href: "/admin/catalog", 
      icon: ShoppingBag,
      badge: newProductsCount > 0 ? newProductsCount : undefined
    },
    { 
      label: "Transactions & Litiges", 
      href: "/admin/transactions", 
      icon: CreditCard,
      badge: disputedInvoicesCount > 0 ? disputedInvoicesCount : undefined
    },
    { 
      label: "Vérifications d'ID", 
      href: "/admin/verifications", 
      icon: ShieldCheck,
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined
    },
    { label: "Notifications & Sondages", href: "/admin/notifications", icon: BellRing },
    { 
      label: "Marques & IA", 
      href: "/admin/taxonomy", 
      icon: Tags,
      badge: newBrandsCount > 0 ? newBrandsCount : undefined
    },
    { label: "Commissions", href: "/admin/finance-config", icon: Sliders },
    { 
      label: "Détection Fraude", 
      href: "/admin/fraud", 
      icon: Skull,
      badge: fraudBadgeCount > 0 ? fraudBadgeCount : undefined
    },
    { 
      label: "Logistique Active", 
      href: "/admin/shipping", 
      icon: Truck,
      badge: delayedShippingCount > 0 ? delayedShippingCount : undefined
    },
    { label: "Audit Interne", href: "/admin/audit-logs", icon: History },
    { label: "Codes Promos", href: "/admin/marketing", icon: Ticket },
    { 
      label: "Helpdesk Support", 
      href: "/admin/support", 
      icon: LifeBuoy,
      badge: newTicketsCount > 0 ? newTicketsCount : undefined
    },
    { 
      label: "Nettoyeur d'Images", 
      href: "/admin/system", 
      icon: HardDrive,
      badge: orphanBadge
    },
    { label: "Console SEO", href: "/admin/seo", icon: Globe },
  ];

  return (
    <div className="fixed inset-0 bg-[#070A13] z-50 overflow-hidden flex font-sans select-none">
      {/* 🚀 Active Route & Badge tracker */}
      <NotificationTracker />
      {/* Arrière-plan Cybernétectique */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03)_0%,transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.03)_0%,transparent_40%)]" />
      
      {/* 🚀 Barre Latérale Administrative (Sidebar) */}
      <aside className="w-64 bg-[#0E1322]/80 backdrop-blur-xl border-r border-white/6 flex flex-col h-full z-30 shrink-0">
        {/* En-tête Sidebar */}
        <div className="p-5 border-b border-white/6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-400">
                PLAYAGAIN
              </span>
            </Link>
          </div>
          
          {/* Toggle de retour à la boutique */}
          <div className="flex items-center justify-between bg-black/40 border border-white/6 rounded-xl px-2.5 py-1.5 select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <span className="text-[8px] md:text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Shop</span>
            <Link 
              href="/"
              className="relative w-8.5 h-4.5 bg-emerald-500 rounded-full transition-all duration-300 border border-emerald-400/30 cursor-pointer flex items-center justify-end p-0.5 shadow-[0_0_8px_rgba(16,185,129,0.4)] group hover:bg-emerald-400"
              title="Retourner à la boutique (mode public)"
            >
              <span className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-all duration-300 translate-x-0" />
            </Link>
            <span className="text-[8px] md:text-[9px] uppercase tracking-wider font-black text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]">Admin</span>
          </div>
        </div>

        {/* Liens de Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/2 active:scale-98 transition-all text-xs font-semibold group"
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#10B981] transition-colors" />
                <span className="flex-1 truncate">{item.label}</span>
                
                {/* 🚀 Pastille Glowing Emerald Premium */}
                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-1.5 text-[9px] font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profil Modérateur (Pied de Sidebar) */}
        <div className="p-4 border-t border-white/6 bg-black/15">
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
