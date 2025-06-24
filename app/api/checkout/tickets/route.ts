import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseService } from "@/lib/supabase-service"
import { Event, PricingTier } from "@/lib/types"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// CORS headers helper
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      eventId, 
      tierId, 
      quantity, 
      purchaserName, 
      purchaserSurname, 
      purchaserEmail 
    } = await request.json();

    if (!eventId || !tierId || !quantity || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS });
    }

    // 1. Fetch event and pricing tier details
    const event: Event | null = await supabaseService.getEvent(eventId);
    const tiers: PricingTier[] = await supabaseService.getPricingTiers(eventId);
    const tier = tiers.find(t => t.id === tierId);

    if (!event || !tier) {
      return NextResponse.json({ error: "Event or pricing tier not found" }, { status: 404, headers: CORS_HEADERS });
    }

    // 2. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.title} - ${tier.name}`,
            description: `Ticket for ${event.title}`,
          },
          unit_amount: Math.round(tier.price * 100),
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/event/${eventId}`,
      metadata: {
        eventId,
        tierId,
        quantity,
        purchaserName,
        purchaserSurname,
        purchaserEmail,
      },
      customer_email: purchaserEmail,
      // Expire the session after 1 hour
      expires_at: Math.floor(Date.now() / 1000) + 3600, 
    });

    return NextResponse.json({ sessionId: session.id }, { headers: CORS_HEADERS });

  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500, headers: CORS_HEADERS });
  }
} 