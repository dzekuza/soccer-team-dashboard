import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbService } from "@/lib/db-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { eventId, tierId, quantity, purchaserName, purchaserEmail } = await request.json()
    if (!eventId || !tierId || !quantity || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get event and tier info
    const event = await dbService.getEventWithTiers(eventId)
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })
    const tier = event.pricingTiers.find((t) => t.id === tierId)
    if (!tier) return NextResponse.json({ error: "Tier not found" }, { status: 404 })

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${event.title} - ${tier.name} Ticket`,
              description: `Ticket for ${event.title} (${tier.name})`,
            },
            unit_amount: Math.round(tier.price * 100),
          },
          quantity,
        },
      ],
      mode: "payment",
      customer_email: purchaserEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://soccer-team-dashboard-843v.vercel.app"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://soccer-team-dashboard-843v.vercel.app"}/checkout/cancel`,
      metadata: {
        eventId,
        tierId,
        quantity: String(quantity),
        purchaserName,
        purchaserEmail,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe Checkout session error:", error)
    return NextResponse.json({ error: "Failed to create Stripe session" }, { status: 500 })
  }
} 