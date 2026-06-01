import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { handlePaymentSuccess } from "@/lib/checkout";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") || "";

  let event: Stripe.Event;

  // 1. Validation cryptographique de la signature Stripe
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Gestion de l'événement payment_intent.succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentIntentId = paymentIntent.id;

    try {
      const result = await handlePaymentSuccess(paymentIntentId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } catch (dbErr: any) {
      console.error("Erreur de base de données dans le webhook Stripe:", dbErr);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

