import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase with the service role key for admin-level access
const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;
  
  try {
    const body = await req.text();
    if (!sig || !webhookSecret) {
      console.warn("Stripe webhook signature or secret is missing.");
      return NextResponse.json({ error: "Webhook Error: Missing signature or secret" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, event_id, tier_id, subscription_id } = session.metadata || {};

      if (session.mode === "payment" && user_id && event_id && tier_id) {
        // Handle one-time payment for a ticket
        const { error: ticketError } = await supabaseAdmin.from('tickets').insert({
          event_id: event_id,
          tier_id: tier_id,
          user_id: user_id,
          purchaser_name: session.customer_details?.name,
          purchaser_email: session.customer_details?.email,
          status: 'valid'
        });

        if (ticketError) {
          console.error(`Failed to create ticket for user ${user_id} after Stripe payment.`, ticketError);
        } else {
          console.log(`Ticket created for user ${user_id} via Stripe webhook.`);
        }
      } else if (session.mode === 'subscription' && user_id && session.subscription && subscription_id) {
        // Handle a new subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
        const { error: subError } = await supabaseAdmin.from('user_subscriptions').insert({
            user_id: user_id,
            subscription_id: subscription_id,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
        });

        if (subError) {
             console.error(`Failed to create subscription for user ${user_id} after Stripe payment.`, subError);
        } else {
             console.log(`Subscription created for user ${user_id} via Stripe webhook.`);
        }
      }
    }
  } catch(e) {
      console.error("Error processing webhook event:", e);
      // Don't return 500 to stripe, it will retry.
  }

  return NextResponse.json({ received: true });
} 