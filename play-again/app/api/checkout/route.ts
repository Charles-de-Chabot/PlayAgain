import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

// Initialisation de Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. Vérification de l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour procéder à l'achat." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Identifiant utilisateur invalide." },
        { status: 400 }
      );
    }

    // 2. Récupération et validation des paramètres de la requête
    const body = await req.json();
    const { productId, addressId, isShipping } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "L'identifiant du produit est requis." },
        { status: 400 }
      );
    }

    // 3. Récupération et vérification du produit en BDD
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Le produit demandé n'existe pas." },
        { status: 404 }
      );
    }

    if (product.is_sold || !product.is_active) {
      return NextResponse.json(
        { error: "Ce produit a déjà été vendu ou n'est plus disponible." },
        { status: 400 }
      );
    }

    if (product.user_id === userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas acheter votre propre produit !" },
        { status: 400 }
      );
    }

    // 4. Gestion et validation de la livraison
    // Si le produit n'est pas disponible pour l'expédition, forcer remise en main propre
    const finalIsShipping = product.is_shipping ? !!isShipping : false;

    if (finalIsShipping) {
      if (!addressId) {
        return NextResponse.json(
          { error: "Une adresse de livraison est requise pour l'expédition." },
          { status: 400 }
        );
      }
      // Vérification que l'adresse appartient bien à l'utilisateur
      const address = await prisma.address.findFirst({
        where: {
          id: parseInt(addressId),
          user_id: userId,
        },
      });
      if (!address) {
        return NextResponse.json(
          { error: "Adresse de livraison introuvable ou invalide." },
          { status: 400 }
        );
      }
    }

    // 5. Calculs financiers sécurisés (en centimes pour Stripe)
    const productPrice = Number(product.price);
    const priceInCents = Math.round(productPrice * 100);

    // Formule Commission PlayAgain : 0.70 € + 5% du prix
    const commissionInCents = Math.round(70 + priceInCents * 0.05);
    const commission = commissionInCents / 100;

    // Formule Livraison : 4.99 € standard, ou offerte si article > 100 €
    // 0.00 € pour la remise en main propre
    const shippingFeeInCents = finalIsShipping
      ? priceInCents > 10000
        ? 0
        : 499
      : 0;
    const shippingFee = shippingFeeInCents / 100;

    // Calcul du montant total
    const totalInCents = priceInCents + commissionInCents + shippingFeeInCents;
    const totalPrice = totalInCents / 100;

    // 6. Création du PaymentIntent avec Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY n'est pas configuré dans l'environnement.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalInCents,
      currency: "eur",
      metadata: {
        productId: product.id.toString(),
        buyerId: userId.toString(),
        sellerId: product.user_id.toString(),
        isShipping: finalIsShipping.toString(),
        addressId: finalIsShipping && addressId ? addressId.toString() : "",
      },
    });

    // 7. Génération du code de sécurité unique pour la remise en main propre
    const buyerSecurityCode = finalIsShipping
      ? null
      : `PA-${Math.floor(100000 + Math.random() * 900000)}`;

    // 8. Enregistrement en BDD (Transaction Prisma)
    const invoice = await prisma.$transaction(async (tx) => {
      // Récupération ou création du panier de l'utilisateur (requis par la contrainte de clé étrangère d'Invoice)
      let basket = await tx.basket.findUnique({
        where: { user_id: userId },
      });

      if (!basket) {
        basket = await tx.basket.create({
          data: { user_id: userId },
        });
      }

      // Création de la facture en statut PENDING
      const newInvoice = await tx.invoice.create({
        data: {
          user_id: userId,
          basket_id: basket.id,
          total_price: totalPrice.toFixed(2),
          commission: commission.toFixed(2),
          shipping_fee: shippingFee.toFixed(2),
          payment_intent_id: paymentIntent.id,
          status: "PENDING",
          address_id: finalIsShipping ? Number(addressId) : null,
          buyer_security_code: buyerSecurityCode,
        },
      });

      // Création du détail de la facture (InvoiceItem)
      await tx.invoiceItem.create({
        data: {
          invoice_id: newInvoice.id,
          product_id: product.id,
          quantity: 1,
          unit_price: product.price,
        },
      });

      return newInvoice;
    });

    // 9. Retour des données de paiement au client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      invoiceId: invoice.id,
      pricing: {
        productPrice,
        commission,
        shippingFee,
        totalPrice,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'initialisation du checkout:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'initialisation du paiement.", details: error.message },
      { status: 500 }
    );
  }
}
