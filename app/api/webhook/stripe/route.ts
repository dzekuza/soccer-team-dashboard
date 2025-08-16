import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { notificationService } from "@/lib/notification-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase with the service role key for admin-level access
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
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
        subscriptionTypeId,
        durationDays,
      } = session.metadata || {};

      console.log(`📋 Extracted metadata:`, {
        eventId,
        tierId,
        quantity,
        purchaserName,
        purchaserEmail,
        subscriptionTypeId,
        durationDays,
      });

      if (session.mode === "payment" && eventId && tierId && quantity) {
        console.log(`🎫 Creating ${quantity} ticket(s) for event ${eventId}`);

        // Handle one-time payment for tickets
        const numQuantity = parseInt(quantity, 10);
        const ticketInsertResults = await Promise.allSettled(
          Array.from(
            { length: numQuantity },
            () =>
              supabaseAdmin.from("tickets").insert({
                event_id: eventId,
                tier_id: tierId,
                purchaser_name: purchaserName,
                purchaser_surname: purchaserSurname,
                purchaser_email: purchaserEmail,
                status: "valid",
                stripe_session_id: session.id,
              }).select("id").single(),
          ),
        );

        console.log(
          `📊 Ticket creation results:`,
          ticketInsertResults.map((result, index) => ({
            ticket: index + 1,
            status: result.status,
            data: result.status === "fulfilled"
              ? result.value.data
              : result.reason,
          })),
        );

        // Update the sold quantity for the pricing tier
        const { data: currentTier, error: fetchError } = await supabaseAdmin
          .from("pricing_tiers")
          .select("sold_quantity")
          .eq("id", tierId)
          .single();

        if (fetchError) {
          console.error(
            `❌ Failed to fetch current sold quantity for tier ${tierId}:`,
            fetchError,
          );
        } else {
          const currentSoldQuantity = currentTier?.sold_quantity || 0;
          const newSoldQuantity = currentSoldQuantity + numQuantity;

          const { error: updateError } = await supabaseAdmin
            .from("pricing_tiers")
            .update({ sold_quantity: newSoldQuantity })
            .eq("id", tierId);

          if (updateError) {
            console.error(
              `❌ Failed to update sold quantity for tier ${tierId}:`,
              updateError,
            );
          } else {
            console.log(
              `✅ Updated sold quantity for tier ${tierId} from ${currentSoldQuantity} to ${newSoldQuantity}`,
            );
          }
        }

        for (const [index, result] of ticketInsertResults.entries()) {
          if (
            result.status === "fulfilled" && result.value.data &&
            result.value.data.id
          ) {
            try {
              await notificationService.sendTicketConfirmation(
                result.value.data.id,
              );
              console.log(
                `✅ Ticket ${
                  index + 1
                } created and email sent: ${result.value.data.id}`,
              );
            } catch (err) {
              console.error(
                `❌ Failed to send confirmation for ticket #${index + 1}:`,
                err,
              );
            }
          } else if (result.status === "rejected") {
            console.error(
              `❌ Failed to create ticket #${index + 1} for event ${eventId}.`,
              result.reason,
            );
          }
        }
        console.log(
          `🎉 ${numQuantity} ticket(s) created and confirmation sent for event ${eventId} via Stripe webhook.`,
        );
      } else if (
        session.mode === "payment" && subscriptionTypeId && purchaserName &&
        purchaserEmail
      ) {
        console.log(`📅 Creating subscription for type: ${subscriptionTypeId}`);

        // Handle subscription purchase
        const validFrom = new Date();
        const validTo = new Date();
        validTo.setDate(validTo.getDate() + parseInt(durationDays || "30", 10));

        // Create user subscription record
        const { data: newSubscription, error: subError } = await supabaseAdmin
          .from("user_subscriptions").insert({
            subscription_type_id: subscriptionTypeId,
            purchaser_name: purchaserName,
            purchaser_surname: purchaserSurname || null,
            purchaser_email: purchaserEmail,
            valid_from: validFrom.toISOString(),
            valid_to: validTo.toISOString(),
            qr_code_url: null, // Will be generated later if needed
            status: "active",
            purchase_date: new Date().toISOString(),
            owner_id: "system", // System-owned subscription
            stripe_session_id: session.id,
          }).select().single();

        if (subError) {
          console.error(
            `❌ Failed to create subscription for user ${purchaserEmail} after Stripe payment.`,
            subError,
          );
        } else {
          console.log(
            `✅ Subscription created for user ${purchaserEmail} via Stripe webhook.`,
          );
          console.log(`📋 Subscription ID: ${newSubscription?.id}`);

          // Send subscription confirmation email
          try {
            await notificationService.sendSubscriptionConfirmation(
              newSubscription.id,
            );
            console.log(
              `📧 Subscription confirmation email sent for subscription: ${newSubscription.id}`,
            );
          } catch (err) {
            console.error(
              `❌ Failed to send subscription confirmation email:`,
              err,
            );
          }
        }
      } else {
        console.log(
          `⚠️  Unhandled checkout session: mode=${session.mode}, eventId=${eventId}, tierId=${tierId}, quantity=${quantity}, subscriptionTypeId=${subscriptionTypeId}`,
        );
      }
    } else {
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
  } catch (e) {
    console.error("❌ Error processing webhook event:", e);
    // Don't return 500 to stripe, it will retry.
  }

  return NextResponse.json({ received: true });
}
