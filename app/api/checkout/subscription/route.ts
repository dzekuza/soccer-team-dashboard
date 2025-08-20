import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase-service";
import type { SubscriptionType } from "@/lib/types";
import { getAppUrl } from "@/lib/utils";

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
  let subscriptionTypeId = "";
  let purchaserName = "";
  let purchaserSurname = "";
  let purchaserEmail = "";
  
  try {
    const body = await request.json();
    subscriptionTypeId = body.subscriptionTypeId;
    purchaserName = body.purchaserName;
    purchaserSurname = body.purchaserSurname;
    purchaserEmail = body.purchaserEmail;

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

    // Log subscription type details for debugging
    console.log("📋 Subscription type details:", {
      id: subscriptionType.id,
      title: subscriptionType.title,
      description: subscriptionType.description,
      price: subscriptionType.price,
      duration_days: subscriptionType.duration_days,
      is_active: subscriptionType.is_active
    });

    // 2. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: subscriptionType.title || `Prenumerata ${subscriptionType.id}`,
            description: subscriptionType.description ||
              `Prenumerata: ${subscriptionType.title || subscriptionType.id}`,
          },
          unit_amount: Math.round(subscriptionType.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${getAppUrl(request.headers.get("origin"))}/checkout/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl(request.headers.get("origin"))}/subscriptions`,
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
    console.error("❌ Error creating subscription checkout session:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      subscriptionTypeId,
      purchaserName,
      purchaserEmail
    });
    return NextResponse.json({
      error: "Failed to create Stripe session",
      details: error.message || "Nepavyko sukurti prenumeratos apmokėjimo sesijos",
    }, { status: 500, headers: CORS_HEADERS });
  }
}
