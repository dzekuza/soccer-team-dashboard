import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase-service";
import type { SubscriptionType } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// CORS headers helper
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      subscriptionTypeId,
      purchaserName,
      purchaserSurname,
      purchaserEmail,
    } = await request.json();

    if (!subscriptionTypeId || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Trūksta privalomų laukų" }, {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // 1. Fetch subscription type details
    const subscriptionTypes = await supabaseService.getSubscriptionTypes();
    const subscriptionType = subscriptionTypes.find((type: SubscriptionType) =>
      type.id === subscriptionTypeId
    );

    if (!subscriptionType) {
      return NextResponse.json({ error: "Prenumeratos tipas nerastas" }, {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    // 2. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: subscriptionType.title,
            description: subscriptionType.description ||
              `Prenumerata: ${subscriptionType.title}`,
          },
          unit_amount: Math.round(subscriptionType.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${
        request.headers.get("origin")
      }/checkout/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/subscriptions`,
      metadata: {
        subscriptionTypeId,
        purchaserName,
        purchaserSurname,
        purchaserEmail,
        durationDays: subscriptionType.duration_days.toString(),
      },
      customer_email: purchaserEmail,
      // Expire the session after 1 hour
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    return NextResponse.json({ sessionId: session.id }, {
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.error("Error creating subscription checkout session:", error);
    return NextResponse.json({
      error: error.message ||
        "Nepavyko sukurti prenumeratos apmokėjimo sesijos",
    }, { status: 500, headers: CORS_HEADERS });
  }
}
