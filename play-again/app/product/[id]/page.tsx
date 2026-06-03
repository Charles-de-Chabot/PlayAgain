import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { calculateMatch, learnProductExpertise } from "@/lib/ai/matcher";
import { ProductGallery } from "./ProductGallery";
import { BookmarkButtonWrapper } from "@/components/product/BookmarkButtonWrapper";
import { serializeProduct, calculateProductScore } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";

// Sub-components
import ProductTechnicalSpecs from "./components/ProductTechnicalSpecs";
import ProductAdvisorCard from "./components/ProductAdvisorCard";
import ProductSellerCard from "./components/ProductSellerCard";
import ProductPurchaseActions from "./components/ProductPurchaseActions";

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Novice",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Confirmé",
  PRO: "Pro",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rawProduct = (await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        include: {
          addresses: {
            take: 1,
          },
        },
      },
      category: true,
      brand: true,
      type: true,
      size: true,
      media: true,
    },
  })) as any;

  if (!rawProduct) {
    notFound();
  }

  const detectedLevel = await learnProductExpertise(rawProduct);

  // 1. Calcul du prix moyen de référence filtré par niveau technique (BEGINNER, etc.)
  let averages = await prisma.product.aggregate({
    where: {
      category_id: rawProduct.category_id,
      type_id: rawProduct.type_id,
      is_sold: false,
      levelCategory: detectedLevel as any,
    },
    _avg: {
      price: true,
    },
  });

  // 2. Repli de sécurité : si aucun autre produit n'a ce niveau, on prend la moyenne globale
  if (!averages._avg.price) {
    averages = await prisma.product.aggregate({
      where: {
        category_id: rawProduct.category_id,
        type_id: rawProduct.type_id,
        is_sold: false,
      },
      _avg: {
        price: true,
      },
    });
  }

  const averagePrice = averages._avg.price ? Number(averages._avg.price) : 0;

  const dealScore = calculateProductScore({
    state: rawProduct.state,
    price: Number(rawProduct.price),
    averagePrice,
    marketPosition: rawProduct.brand?.marketPosition || "GENERALIST",
    accessoryIncluded: rawProduct.accessory_included,
  });

  const product = {
    ...serializeProduct(rawProduct),
    levelCategory: detectedLevel,
    dealScore,
  } as any;

  // 1. Calcul du matching IA
  const session = await auth();

  // Check if current user is the buyer of this product
  let userInvoice = null;
  if (session?.user?.id) {
    userInvoice = await prisma.invoice.findFirst({
      where: {
        user_id: parseInt(session.user.id),
        status: { in: ["PAID", "COMPLETED", "SHIPPED", "DELIVERED"] },
        items: {
          some: {
            product_id: product.id,
          },
        },
      },
    });
  }
  let matchData = null;
  let sportProfile = null;
  let isGuest = true;
  let showMatch = false;

  if (session?.user?.id || session?.user?.email) {
    sportProfile = await prisma.sportProfile.findUnique({
      where: {
        userId: session.user.id ? parseInt(session.user.id) : undefined,
        user: !session.user.id ? { email: session.user.email as string } : undefined,
      },
      include: {
        skills: true,
      },
    });

    if (sportProfile) {
      matchData = await calculateMatch(sportProfile, product);
      isGuest = false;

      // Vérifie si la catégorie du produit fait partie des sports favoris déclarés dans le Sportif ID
      const userInterests = sportProfile.interests ? (sportProfile.interests as string[]) : [];
      showMatch = userInterests.some(
        (interest: string) => interest.trim().toLowerCase() === product.category.label.trim().toLowerCase()
      );
    }
  }

  // Fallback invité ou profil incomplet : niveau intermédiaire par défaut pour que l'analyse soit toujours disponible !
  if (!matchData) {
    matchData = await calculateMatch({ level: "INTERMEDIATE" }, product);
    isGuest = true;
    showMatch = false;
  }

  const sellerAddress = product.user.addresses?.[0];
  const sellerLocation = sellerAddress ? `${sellerAddress.city}` : "Localisation inconnue";
  const isOwner = session?.user?.id ? parseInt(session.user.id) === product.user_id : false;

  const getStateStyles = (state: string) => {
    const baseClass = "bg-zinc-900/50 border-white/10";
    switch (state) {
      case "NEUF":
        return `${baseClass} text-cyan-400`;
      case "EXCELLENT":
        return `${baseClass} text-lime-400`;
      case "BON":
        return `${baseClass} text-yellow-300`;
      case "SATISFAISANT":
        return `${baseClass} text-orange-400`;
      default:
        return `${baseClass} text-zinc-400`;
    }
  };

  // ── Sub-render blocks ──

  const GalleryBlock = (
    <ProductGallery media={product.media} productTitle={product.title} categoryLabel={product.category.label} />
  );

  const TitleBlock = (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getStateStyles(
            product.state
          )}`}
        >
          {product.state.replace("_", " ")}
        </span>
        {product.brand && (
          <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{product.brand.label}</span>
        )}

        {product.dealScore?.score >= 75 && (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${product.dealScore.colorClass}`}
          >
            {product.dealScore.label}
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">{product.title}</h1>

      <div className="flex items-baseline gap-3">
        <p className={`text-4xl font-black ${product.dealScore?.glowClass || "text-brand-primary"}`}>
          {Number(product.price)}€
        </p>
        {product.dealScore?.score >= 75 && (
          <span className="text-zinc-500 text-xs font-bold">(Excellent prix de gamme)</span>
        )}
      </div>
    </div>
  );

  const DescriptionBlock = (
    <div className="space-y-4 text-left">
      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Description</h2>
      <p className="text-zinc-400 leading-relaxed text-sm md:text-base italic">
        "{product.description || "Aucune description fournie par le vendeur."}"
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-24 relative overflow-x-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] bg-size-[40px_40px] opacity-25" />
        <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Navigation & Actions */}
        <div className="w-full px-4 md:px-12 pt-20 md:pt-24 flex items-center justify-between mb-0">
          <BackButton fallbackHref="/shop" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 hover:border-brand-primary/50 transition-all text-zinc-400 hover:text-brand-primary cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <BookmarkButtonWrapper productId={product.id} />
          </div>
        </div>

        {userInvoice && (
          <div className="max-w-6xl mx-auto px-4 pt-4 text-left">
            <div className="w-full p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  🎉
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white italic">Achat Réussi !</h3>
                  <p className="text-xs text-zinc-400 font-bold">
                    Vous avez acheté cet article. Accédez à votre reçu ou contactez le vendeur ci-dessous.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <Link href={`/product/${product.id}/checkout/success?invoice_id=${userInvoice.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Reçu & Facture
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-0.5">
          {/* 💻 VUE BUREAU / GRAND ÉCRAN (Double Colonne) */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-10">
              {/* Colonne Gauche : Visuels, Description & Specs */}
              <div className="lg:col-span-7 space-y-10">
                {GalleryBlock}
                <div className="pt-6 border-t border-white/5 space-y-10">
                  {DescriptionBlock}
                  <ProductTechnicalSpecs product={product} />
                </div>
              </div>

              {/* Colonne Droite : Transactionnel, Opportunité, Conseil & Vendeur */}
              <div className="lg:col-span-5 space-y-8">
                {TitleBlock}
                <ProductPurchaseActions product={product} userInvoice={userInvoice} isOwner={isOwner} />
                <ProductAdvisorCard
                  product={product}
                  matchData={matchData}
                  showMatch={showMatch}
                  isGuest={isGuest}
                  session={session}
                />
                <ProductSellerCard product={product} sellerLocation={sellerLocation} />
              </div>
            </div>
          </div>

          {/* 📱 VUE MOBILE / ÉCRAN INTERMÉDIAIRE (Flux Linéaire) */}
          <div className="lg:hidden space-y-8">
            {GalleryBlock}
            {TitleBlock}
            <ProductPurchaseActions product={product} userInvoice={userInvoice} isOwner={isOwner} />
            <ProductAdvisorCard
              product={product}
              matchData={matchData}
              showMatch={showMatch}
              isGuest={isGuest}
              session={session}
            />
            <div className="pt-6 border-t border-white/5 space-y-8">
              {DescriptionBlock}
              <ProductTechnicalSpecs product={product} />
            </div>
            <ProductSellerCard product={product} sellerLocation={sellerLocation} />
          </div>
        </div>
      </div>
    </main>
  );
}
