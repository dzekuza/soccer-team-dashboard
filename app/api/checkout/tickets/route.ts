import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbService } from "@/lib/db-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    // Fetch Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const purchaserEmail = session.metadata?.purchaserEmail || session.customer_email
    const eventId = session.metadata?.eventId
    const tierId = session.metadata?.tierId
    const quantity = parseInt(session.metadata?.quantity || "1", 10)

    if (!purchaserEmail || !eventId || !tierId || !quantity) {
      return NextResponse.json({ error: "Session missing required metadata" }, { status: 400 })
    }

    // Fetch tickets for this purchaser/event/tier
    const allTickets = await dbService.getTicketsWithDetails()
    // Find tickets matching event, tier, purchaserEmail, and not already validated
    const matching = allTickets
      .filter(t =>
        t.eventId === eventId &&
        t.tierId === tierId &&
        t.purchaserEmail === purchaserEmail &&
        !t.isValidated
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, quantity)

    // If not found, fallback: return tickets by event/tier with empty purchaserEmail (unassigned)
    let tickets = matching
    if (tickets.length < quantity) {
      const unassigned = allTickets
        .filter(t =>
          t.eventId === eventId &&
          t.tierId === tierId &&
          (!t.purchaserEmail || t.purchaserEmail === "") &&
          !t.isValidated
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, quantity - tickets.length)
      tickets = [...tickets, ...unassigned]
    }

    // Return only id and qrCodeUrl
    return NextResponse.json({ tickets: tickets.map(t => ({ id: t.id, qrCodeUrl: t.qrCodeUrl })) })
  } catch (error) {
    console.error("Error fetching tickets for session:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
} 