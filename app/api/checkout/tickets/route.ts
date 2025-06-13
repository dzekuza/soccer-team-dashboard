import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { supabaseService } from "@/lib/supabase-service"

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
            // Always fetch the latest ticket details from the DB
            const ticketWithDetails = await dbService.getTicketWithDetails(t.id)
            if (!ticketWithDetails || !ticketWithDetails.event || !ticketWithDetails.tier) {
              console.warn("Cannot send ticket email: ticket, event, or tier not found.")
              return null
            }
            const pdfBytes = await generateTicketPDF(ticketWithDetails)
            return {
              filename: `ticket-${t.id}.pdf`,
              content: Buffer.from(pdfBytes),
            }
          })
        )
        // Filter out any nulls
        const attachments: { filename: string; content: Buffer }[] = pdfBuffers.filter(a => a !== null) as { filename: string; content: Buffer }[];
        // Prepare email body with match info
        let matchInfo = ''
        if (tickets.length > 0) {
          const ticketDetails = await dbService.getTicketWithDetails(tickets[0].id)
          if (ticketDetails && ticketDetails.event) {
            // Fetch team names
            let team1Name = 'Team 1'
            let team2Name = 'Team 2'
            if (ticketDetails.event.team1Id) {
              const team1 = await supabaseService.getTeamById(ticketDetails.event.team1Id)
              if (team1) team1Name = team1.team_name
            }
            if (ticketDetails.event.team2Id) {
              const team2 = await supabaseService.getTeamById(ticketDetails.event.team2Id)
              if (team2) team2Name = team2.team_name
            }
            matchInfo = `
              <h2>${ticketDetails.event.title}</h2>
              <p><b>${team1Name} vs ${team2Name}</b></p>
              <p>Event date: ${ticketDetails.event.date}</p>
              <p>Event time: ${ticketDetails.event.time}</p>
              <p>Location: ${ticketDetails.event.location}</p>
            `
          }
        }
        const emailHtml = `
          <p>Hello,</p>
          <p>Thank you for your purchase. Your ticket(s) are attached as PDF.</p>
          ${matchInfo}
          <p>Enjoy the match!</p>
        `
        // Send email
        await resend.emails.send({
          from: "tickets@soccer-team.app", // Change to your verified sender
          to: purchaserEmail,
          subject: "Your Soccer Event Ticket(s)",
          html: emailHtml,
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