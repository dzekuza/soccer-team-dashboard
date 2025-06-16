import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase-service";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase with the service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    const body = await req.text();
    if (!sig || !webhookSecret) throw new Error("Missing Stripe signature or webhook secret");
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode === "subscription" && session.customer_email && session.metadata?.subscriptionId) {
      try {
        // Find user by email
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.customer_email)
          .single();
        if (userError || !user) throw new Error("User not found for email: " + session.customer_email);
        // Assign subscription to user
        await supabaseService.assignSubscriptionToUser(user.id, session.metadata.subscriptionId);
        console.log(`Assigned subscription ${session.metadata.subscriptionId} to user ${user.id}`);
      } catch (err) {
        console.error("Failed to assign subscription after Stripe payment:", err);
      }
    }
    // Example: create a ticket after payment
    if (session.customer_email && session.metadata?.eventId && session.metadata?.tierId) {
      try {
        await supabaseService.createTicket(
          {
            eventId: session.metadata.eventId,
            tierId: session.metadata.tierId,
            purchaserName: session.customer_details?.name || "Unknown",
            purchaserEmail: session.customer_email,
          },
          supabase // Use service role client
        );
        console.log(`Ticket created for ${session.customer_email}`);
      } catch (err) {
        console.error("Failed to create ticket after Stripe payment:", err);
      }
    }
  }
  return NextResponse.json({ received: true });
} 