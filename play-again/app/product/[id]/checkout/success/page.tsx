import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SuccessClient } from "./SuccessClient";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invoice_id?: string }>;
}) {
  const { id } = await params;
  const { invoice_id } = await searchParams;

  if (!invoice_id) {
    notFound();
  }

  // Récupérer la facture correspondante pour afficher le reçu rétro
  const rawInvoice = await prisma.invoice.findUnique({
    where: { id: parseInt(invoice_id) },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              media: true,
            },
          },
        },
      },
      address: true,
      user: true,
    },
  });

  if (!rawInvoice) {
    notFound();
  }

  // Sérialiser les données pour le client
  const invoice = JSON.parse(JSON.stringify(rawInvoice));

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor avec Orbes / Halos Lumineux Figma */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
        
        {/* Halos Lumineux */}
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-primary opacity-15 blur-[160px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-brand-accent opacity-10 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="max-w-3xl mx-auto px-4 pt-24 md:pt-32">
          <SuccessClient invoice={invoice} />
        </div>
      </div>
    </main>
  );
}
