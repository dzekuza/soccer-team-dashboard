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
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log(`🔔 Webhook received: ${event.type}`);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`💰 Checkout session completed: ${session.id}`);
      console.log(`📋 Session mode: ${session.mode}`);
      console.log(`📋 Session metadata:`, session.metadata);
      
      const { 
        eventId, 
        tierId, 
        quantity, 
        purchaserName, 
        purchaserSurname, 
        purchaserEmail,
        subscriptionId
      } = session.metadata || {};

      console.log(`📋 Extracted metadata:`, { eventId, tierId, quantity, purchaserName, purchaserEmail, subscriptionId });

      if (session.mode === "payment" && eventId && tierId && quantity) {
        console.log(`🎫 Creating ${quantity} ticket(s) for event ${eventId}`);
        
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
              status: 'valid',
              stripe_session_id: session.id
            }).select('id').single()
          )
        );

        console.log(`📊 Ticket creation results:`, ticketInsertResults.map((result, index) => ({
          ticket: index + 1,
          status: result.status,
          data: result.status === 'fulfilled' ? result.value.data : result.reason
        })));

        for (const [index, result] of ticketInsertResults.entries()) {
          if (result.status === 'fulfilled' && result.value.data && result.value.data.id) {
            try {
              await notificationService.sendTicketConfirmation(result.value.data.id);
              console.log(`✅ Ticket ${index + 1} created and email sent: ${result.value.data.id}`);
            } catch (err) {
              console.error(`❌ Failed to send confirmation for ticket #${index + 1}:`, err);
            }
          } else if (result.status === 'rejected') {
            console.error(`❌ Failed to create ticket #${index + 1} for event ${eventId}.`, result.reason);
          }
        }
        console.log(`🎉 ${numQuantity} ticket(s) created and confirmation sent for event ${eventId} via Stripe webhook.`);
      } 
      else if (session.mode === 'subscription' && session.subscription) {
        console.log(`📅 Creating subscription: ${session.subscription}`);
        
        // Handle a new subscription
        const subscription = await stripe.subscriptions.retrieve(session.subscription.toString());
        
        // Get the subscription plan ID from the checkout session metadata
        const subscriptionPlanId = session.metadata?.subscriptionId;
        
        // Create subscription record using the correct table structure
        const { data: newSubscription, error: subError } = await supabaseAdmin.from('subscriptions').insert({
          purchaser_name: session.customer_details?.name || null,
          purchaser_surname: null, // Could be extracted from name if needed
          purchaser_email: session.customer_details?.email || null,
          valid_from: new Date((subscription as any).current_period_start * 1000).toISOString(),
          valid_to: new Date((subscription as any).current_period_end * 1000).toISOString(),
          qr_code_url: null, // Will be generated later if needed
          owner_id: session.customer_details?.email || null, // Using email as owner for now
          stripe_subscription_id: session.subscription.toString(),
          subscription_status: subscription.status
        }).select().single();

        if (subError) {
          console.error(`❌ Failed to create subscription for user ${session.customer_details?.email} after Stripe payment.`, subError);
        } else {
          console.log(`✅ Subscription created for user ${session.customer_details?.email} via Stripe webhook.`);
          console.log(`📋 Subscription ID: ${newSubscription?.id}`);
          
          // Send subscription confirmation email if we have the subscription plan ID
          if (subscriptionPlanId) {
            try {
              await notificationService.sendSubscriptionConfirmation(subscriptionPlanId);
              console.log(`📧 Subscription confirmation email sent for plan: ${subscriptionPlanId}`);
            } catch (err) {
              console.error(`❌ Failed to send subscription confirmation email:`, err);
            }
          }
        }
      } else {
        console.log(`⚠️  Unhandled checkout session: mode=${session.mode}, eventId=${eventId}, tierId=${tierId}, quantity=${quantity}`);
      }
    }
    else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🔄 Subscription updated: ${subscription.id}`);
      
      // Update subscription status in database
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          subscription_status: subscription.status,
          valid_to: new Date((subscription as any).current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (updateError) {
        console.error(`❌ Failed to update subscription ${subscription.id}:`, updateError);
      } else {
        console.log(`✅ Subscription ${subscription.id} updated successfully.`);
      }
    }
    else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🗑️  Subscription deleted: ${subscription.id}`);
      
      // Mark subscription as cancelled in database
      const { error: deleteError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          subscription_status: 'cancelled',
          valid_to: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (deleteError) {
        console.error(`❌ Failed to mark subscription ${subscription.id} as cancelled:`, deleteError);
      } else {
        console.log(`✅ Subscription ${subscription.id} marked as cancelled.`);
      }
    } else {
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
  } catch(e) {
      console.error("❌ Error processing webhook event:", e);
      // Don't return 500 to stripe, it will retry.
  }

  return NextResponse.json({ received: true });
} 