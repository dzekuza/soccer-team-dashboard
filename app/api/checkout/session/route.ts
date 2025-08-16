import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { CartItem } from "@/context/cart-context"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { cartItems, purchaserEmail, purchaserName } = await request.json()
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !purchaserEmail || !purchaserName) {
      return NextResponse.json({ error: "Trūksta privalomų laukų" }, { status: 400 })
    }

    const line_items = cartItems.map((item: CartItem) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            description: item.category, 
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: item.quantity,
      };
    });

    // Extract event and tier information from cart items
    const firstItem = cartItems[0];
    const eventId = firstItem.eventId;
    const tierId = firstItem.id; // Assuming the item ID is the tier ID
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    console.log('🛒 Creating checkout session with metadata:', {
      eventId,
      tierId,
      quantity: totalQuantity,
      purchaserName,
      purchaserEmail
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      customer_email: purchaserEmail,
      success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout`,
      metadata: {
        eventId,
        tierId,
        quantity: totalQuantity.toString(),
        purchaserName,
        purchaserEmail,
        cart: JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity })))
      },
    })

    console.log('✅ Checkout session created:', session.id);
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("❌ Stripe Checkout session error:", error)
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 })
  }
} 