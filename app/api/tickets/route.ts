import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Send email with PDF ticket
    if (ticket && purchaserEmail) {
      try {
        const event = await dbService.getEventWithTiers(eventId)
        const tier = await dbService.getPricingTier(tierId)
        if (!event || !tier) {
          console.warn("Cannot send ticket email: event or tier not found.")
        } else {
          const pdfBytes = await generateTicketPDF({
            ...ticket,
            event,
            tier,
          })
          // Debug logging
          console.log("[Resend] Attempting to send email", {
            apiKey: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 6) + '...' : undefined,
            from: "Banga <info@teamup.lt>",
            to: purchaserEmail,
            subject: "Your ticket",
          })
          const result = await resend.emails.send({
            from: "Banga <info@teamup.lt>",
            to: purchaserEmail,
            subject: "Your ticket",
            html: `<p>Welcome to the event! Your ticket is attached.</p>` ,
            attachments: [{ filename: `ticket-${ticket.id}.pdf`, content: Buffer.from(pdfBytes) }],
          })
          console.log("[Resend] Email send result:", result)
        }
      } catch (err) {
        console.error("Failed to send manual ticket email:", err)
      }
    }

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
