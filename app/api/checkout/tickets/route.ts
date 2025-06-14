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
        let team1 = null;
        let team2 = null;
        let team1Name = 'Komanda 1';
        let team2Name = 'Komanda 2';
        let team1Logo = 'https://yourdomain.com/team1.png';
        let team2Logo = 'https://yourdomain.com/team2.png';
        let ticketDetails = null;
        if (tickets.length > 0) {
          ticketDetails = await dbService.getTicketWithDetails(tickets[0].id);
          if (ticketDetails && ticketDetails.event) {
            if (ticketDetails.event.team1Id) {
              team1 = await supabaseService.getTeamById(ticketDetails.event.team1Id);
              if (team1) {
                team1Name = team1.team_name;
                team1Logo = team1.logo || team1Logo;
              }
            }
            if (ticketDetails.event.team2Id) {
              team2 = await supabaseService.getTeamById(ticketDetails.event.team2Id);
              if (team2) {
                team2Name = team2.team_name;
                team2Logo = team2.logo || team2Logo;
              }
            }
          }
        }
        function formatCurrency(amount: number) {
          return new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(amount);
        }
        const bangaLogoUrl = 'https://ebdfqztiximsqdnvwkqu.supabase.co/storage/v1/object/public/logo//%20Banga.png';
        const emailHtml = `
  <div style="font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;">
    <img src="${bangaLogoUrl}" alt="FK Banga Logo" width="120" style="margin-bottom: 24px;" />
    
    <h2 style="font-size: 20px; font-weight: 500;">Jūsų bilietas į renginį</h2>
    <hr style="border: 0; border-top: 1px solid #2D3B80; margin: 16px 0;" />

    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 16px;">
      <div style="text-align: center;">
        <img src="${team1Logo}" alt="Team 1" width="48" /><br />
        <span style="color: #ffffff;">${team1Name}</span>
      </div>
      <strong style="color: #ffffff;">prieš</strong>
      <div style="text-align: center;">
        <img src="${team2Logo}" alt="Team 2" width="48" /><br />
        <span style="color: #ffffff;">${team2Name}</span>
      </div>
    </div>

    <h3 style="color: #F15601; margin-top: 0;">RUNGtynių PRADŽIA: ${ticketDetails?.event.time || 'XX:XX'}</h3>
    <p style="color: #8B9ED1;">${ticketDetails?.event.date || 'Sekmadienis, Rug. 24, 2025'}</p>

    <table style="width: 100%; margin-top: 16px; color: #ffffff;">
      <tr>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">LOKACIJA</th>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">BILIETO TIPAS</th>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">KAINA</th>
      </tr>
      <tr>
        <td style="font-size: 14px;">${ticketDetails?.event.location || 'Svencele Stadium'}</td>
        <td style="font-size: 14px;">${ticketDetails?.tier.name || 'VIP'}</td>
        <td style="font-size: 14px;">${formatCurrency(ticketDetails?.tier.price || 0)}</td>
      </tr>
    </table>

    <div style="background: #0F1B47; padding: 16px; margin-top: 24px;">
      <table style="width: 100%; color: #ffffff;">
        <tr>
          <th style="text-align: left; font-size: 10px; color: #8B9ED1;">PIRKĖJO VARDAS</th>
          <th style="text-align: left; font-size: 10px; color: #8B9ED1;">PAVARDĖ</th>
          <th style="text-align: left; font-size: 10px; color: #8B9ED1;">EL. PAŠTAS</th>
        </tr>
        <tr>
          <td style="font-size: 14px;">${session.metadata?.purchaserName || 'Vardas'}</td>
          <td style="font-size: 14px;">${session.metadata?.purchaserSurname || 'Pavardė'}</td>
          <td style="font-size: 14px;">${purchaserEmail}</td>
        </tr>
      </table>
    </div>

    <p style="margin-top: 32px; color: #8B9ED1;">Bilietas pridedamas kaip PDF dokumentas.</p>
  </div>
`
        // Send email
        await resend.emails.send({
          from: "tickets@soccer-team.app", // Change to your verified sender
          to: purchaserEmail,
          subject: "Jūsų bilietas į renginį",
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