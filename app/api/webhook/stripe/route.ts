import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { notificationService } from "@/lib/notification-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase with the service role key for admin-level access
const supabaseAdmin = createClient(
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
      const { 
        eventId, 
        tierId, 
        quantity, 
        purchaserName, 
        purchaserSurname, 
        purchaserEmail 
      } = session.metadata || {};

      if (session.mode === "payment" && eventId && tierId && quantity) {
        // Handle one-time payment for tickets
        const numQuantity = parseInt(quantity, 10);
        const ticketInsertResults = await Promise.allSettled(
          Array.from({ length: numQuantity }, () =>
            supabaseAdmin.from('tickets').insert({
              event_id: eventId,
              tier_id: tierId,
              purchaser_name: purchaserName,
              purchaser_surname: purchaserSurname,
              purchaser_email: purchaserEmail,
              status: 'valid'
            }).select('id').single()
          )
        );

        for (const [index, result] of ticketInsertResults.entries()) {
          if (result.status === 'fulfilled' && result.value.data && result.value.data.id) {
            try {
              await notificationService.sendTicketConfirmation(result.value.data.id);
            } catch (err) {
              console.error(`Failed to send confirmation for ticket #${index + 1}:`, err);
            }
          } else if (result.status === 'rejected') {
            console.error(`Failed to create ticket #${index + 1} for event ${eventId}.`, result.reason);
          }
        }
        console.log(`${numQuantity} ticket(s) created and confirmation sent for event ${eventId} via Stripe webhook.`);
      } 
      /*
      else if (session.mode === 'subscription' && session.subscription) {
        // Handle a new subscription
        const { user_id, subscription_id } = session.metadata || {};
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
      */
    }
  } catch(e) {
      console.error("Error processing webhook event:", e);
      // Don't return 500 to stripe, it will retry.
  }

  return NextResponse.json({ received: true });
} 