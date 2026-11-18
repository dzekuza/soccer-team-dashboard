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
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
        purchaserEmail,
        subscriptionTypeId,
        durationDays,
      } = session.metadata || {};


      if (session.mode === "payment" && eventId && tierId && quantity) {

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
      } else if (
        session.mode === "payment" && subscriptionTypeId && purchaserName &&
        purchaserEmail
      ) {

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

          // Send subscription confirmation email
          try {
            await notificationService.sendSubscriptionConfirmation(
              newSubscription.id,
            );
          } catch (err) {
            console.error(
              `❌ Failed to send subscription confirmation email:`,
              err,
            );
          }
        }
      } else if (session.mode === "payment" && session.metadata?.purchaseType === "shop") {
        
        try {
          // Extract order details from metadata
          const customerName = session.metadata.purchaserName;
          const customerEmail = session.metadata.purchaserEmail;
          const customerPhone = session.metadata.purchaserPhone;
          const deliveryAddress = JSON.parse(session.metadata.deliveryAddress || "{}");
          const cartItems = JSON.parse(session.metadata.cart || "[]");
          const couponCode = session.metadata.couponId;
          
          if (!customerName || !customerEmail || !cartItems || cartItems.length === 0) {
            console.error("❌ Missing required order data in metadata");
            return;
          }

          // Calculate totals
          const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          const totalAmount = subtotal; // No discount handling in webhook for now

          // Create the order
          const { data: order, error: orderError } = await supabaseAdmin
            .from('shop_orders')
            .insert({
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              delivery_address: deliveryAddress,
              subtotal,
              discount_amount: 0,
              total_amount: totalAmount,
              coupon_code: couponCode,
              coupon_discount: 0,
              stripe_session_id: session.id,
              created_by: null // System-created order
            })
            .select()
            .single();

          if (orderError) {
            console.error("❌ Failed to create shop order:", orderError);
            return;
          }

          // Create order items
          const orderItems = cartItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            variant_id: null,
            product_name: item.name,
            product_sku: item.id,
            variant_attributes: item.color ? { color: item.color } : null,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }));

          const { error: itemsError } = await supabaseAdmin
            .from('shop_order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error("❌ Failed to create shop order items:", itemsError);
            return;
          }

          
          // Send confirmation email to customer
          try {
            await notificationService.sendShopOrderConfirmation(order.id);
          } catch (err) {
            console.error(`❌ Failed to send shop order confirmation email:`, err);
          }
          
          // Send notification email to admin
          try {
            await notificationService.sendShopOrderNotificationToAdmin(order.id);
          } catch (err) {
            console.error(`❌ Failed to send shop order notification to admin:`, err);
          }
          
        } catch (error) {
          console.error("❌ Error processing shop order:", error);
        }
      }
    }
  } catch (e) {
    console.error("❌ Error processing webhook event:", e);
    // Don't return 500 to stripe, it will retry.
  }

  return NextResponse.json({ received: true });
}
