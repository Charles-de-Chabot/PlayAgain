import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { ChevronLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import { SalesManager } from "@/components/profile/SalesManager";

export default async function ProfileSalesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  // 1. Récupération des factures d'achat où le produit appartient au vendeur connecté
  const invoices = await prisma.invoice.findMany({
    where: {
      items: {
        some: {
          product: {
            user_id: userId
          }
        }
      },
      status: {
        not: "PENDING" // On n'affiche pas les commandes en attente de paiement
      }
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: true,
              category: true
            }
          }
        }
      },
      user: { // L'acheteur
        select: {
          id: true,
          username: true,
          profile_picture: true
        }
      }
    },
    orderBy: {
      invoice_date: "desc"
    }
  });

  // 2. Formatage des factures en ventes sérialisées (sans Decimal)
  const sales = await Promise.all(
    invoices.map(async (invoice) => {
      const item = invoice.items[0];
      const product = item?.product;

      // Retrouver la conversation liée entre ce vendeur et cet acheteur pour ce produit
      let conversationId = null;
      if (product) {
        const conv = await prisma.conversation.findFirst({
          where: {
            product_id: product.id,
            user_id: invoice.user_id // L'acheteur est le créateur de la discussion
          },
          select: {
            id: true
          }
        });
        conversationId = conv?.id || null;
      }

      return {
        id: invoice.id,
        status: invoice.status,
        totalPrice: Number(invoice.total_price),
        commission: invoice.commission ? Number(invoice.commission) : 0,
        shippingFee: invoice.shipping_fee ? Number(invoice.shipping_fee) : 0,
        addressId: invoice.address_id,
        invoiceDate: invoice.invoice_date.toISOString(),
        buyer: invoice.user,
        product: product
          ? {
              id: product.id,
              title: product.title,
              price: Number(product.price),
              media: product.media.map((m) => m.url),
              category: product.category?.label || "Matériel"
            }
          : null,
        conversationId
      };
    })
  );

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor - Login/Profile Style */}
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

          {/* En-tête de la page */}
          <div className="flex items-center gap-4 relative z-10 border-b border-white/10 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent shadow-[0_0_15px_rgba(198,255,52,0.15)] shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase italic leading-none">
                Mes <span className="text-brand-accent">Ventes</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Gérez vos expéditions, suivez vos fonds en séquestre et validez vos remises en mains propres.
              </p>
            </div>
          </div>

          {/* Table de gestion principale */}
          <SalesManager initialSales={sales} />
        </div>
      </div>
    </main>
  );
}
