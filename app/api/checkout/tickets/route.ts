import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

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
    let allTickets = await dbService.getTicketsWithDetails()
    // Find tickets matching event, tier, purchaserEmail, and not already validated
    let matching = allTickets
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
      // Try to assign unassigned tickets first
      const unassigned = allTickets
        .filter(t =>
          t.eventId === eventId &&
          t.tierId === tierId &&
          (!t.purchaserEmail || t.purchaserEmail === "") &&
          !t.isValidated
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, quantity - tickets.length)
      // Assign these tickets to the purchaser
      for (const ticket of unassigned) {
        await dbService.updateTicket(ticket.id, {
          purchaserName: session.metadata?.purchaserName || "",
          purchaserEmail,
        })
      }
      // Re-fetch tickets after assignment
      allTickets = await dbService.getTicketsWithDetails()
      tickets = allTickets
        .filter(t =>
          t.eventId === eventId &&
          t.tierId === tierId &&
          t.purchaserEmail === purchaserEmail &&
          !t.isValidated
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, quantity)
    }
    if (tickets.length < quantity) {
      // If still not enough, create new tickets and assign
      for (let i = 0; i < quantity - tickets.length; i++) {
        await dbService.createTicket({
          eventId,
          tierId,
          purchaserName: session.metadata?.purchaserName || "",
          purchaserEmail,
        })
      }
      // Re-fetch tickets after creation
      allTickets = await dbService.getTicketsWithDetails()
      tickets = allTickets
        .filter(t =>
          t.eventId === eventId &&
          t.tierId === tierId &&
          t.purchaserEmail === purchaserEmail &&
          !t.isValidated
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, quantity)
    }
    // Return only id and qrCodeUrl
    const ticketObjs = tickets.map(t => ({ id: t.id, qrCodeUrl: t.qrCodeUrl }))

    // Send email with PDF(s) if tickets and purchaserEmail exist
    if (tickets.length > 0 && purchaserEmail) {
      try {
        // Generate PDFs
        const pdfBuffers = await Promise.all(
          tickets.map(async (t) => {
            const ticketWithDetails = allTickets.find(at => at.id === t.id)
            if (!ticketWithDetails) return null
            const pdfBlob = await generateTicketPDF(ticketWithDetails)
            const arrayBuffer = await pdfBlob.arrayBuffer()
            return {
              filename: `ticket-${t.id}.pdf`,
              content: Buffer.from(new Uint8Array(arrayBuffer)),
            }
          })
        )
        // Filter out any nulls
        const attachments: { filename: string; content: Buffer }[] = pdfBuffers.filter(a => a !== null) as { filename: string; content: Buffer }[];
        // Send email
        await resend.emails.send({
          from: "tickets@soccer-team.app", // Change to your verified sender
          to: purchaserEmail,
          subject: "Your Soccer Event Ticket(s)",
          text: `Thank you for your purchase!\n\nAttached are your ticket(s) for the event.\n\nEnjoy the match!`,
          attachments,
        })
      } catch (err) {
        console.error("Failed to send ticket email:", err)
      }
    }
    return NextResponse.json({ tickets: ticketObjs })
  } catch (error) {
    console.error("Error fetching tickets for session:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
} 