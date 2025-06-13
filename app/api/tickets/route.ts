import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, tierId, purchaserName, purchaserEmail } = body

    // Validate required fields
    if (!eventId || !tierId || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the pricing tier exists and has available capacity
    const tier = await dbService.getPricingTier(tierId)
    if (!tier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 })
    }

    if (tier.soldQuantity >= tier.maxQuantity) {
      return NextResponse.json({ error: "No tickets available for this tier" }, { status: 400 })
    }

    const ticket = await dbService.createTicket({
      eventId,
      tierId,
      purchaserName,
      purchaserEmail,
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tickets = await dbService.getTicketsWithDetails()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
