import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase with the service role key for admin-level access
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const { session_id } = params;

    if (!session_id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if this is a subscription session
    if (session.mode !== "subscription" || !session.subscription) {
      return NextResponse.json({ error: "Invalid subscription session" }, { status: 400 });
    }

    // Get subscription details from our database
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', session.subscription)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ error: "Subscription not found in database" }, { status: 404 });
    }

    return NextResponse.json({
      id: subscription.id,
      status: subscription.subscription_status,
      customer_email: subscription.purchaser_email,
      start_date: subscription.valid_from,
      end_date: subscription.valid_to,
      purchaser_name: subscription.purchaser_name,
    });

  } catch (error: any) {
    console.error("Error verifying subscription session:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription session" },
      { status: 500 }
    );
  }
}