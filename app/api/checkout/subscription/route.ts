import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }
    // Fetch the subscription plan from Supabase
    const { data: plan, error } = await supabase
      .from("subscriptions")
      .select("id, title, description, price, duration_days")
      .eq("id", subscriptionId)
      .single();
    if (error || !plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 });
    }
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan.title,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: "day",
              interval_count: plan.duration_days,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: req.headers.get("x-customer-email") || undefined,
      metadata: {
        subscriptionId,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/subscription?canceled=1`,
    });
    // NOTE: Subscription assignment is handled by the Stripe webhook at /api/webhook/stripe
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
} 