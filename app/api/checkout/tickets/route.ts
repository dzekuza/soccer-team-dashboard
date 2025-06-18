import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { supabaseService } from "@/lib/supabase-service"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

// CORS headers helper
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

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
        t.event_id === eventId &&
        t.tier_id === tierId &&
        t.purchaser_email === purchaserEmail &&
        !t.is_validated
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, quantity)

    // If not found, fallback: return tickets by event/tier with empty purchaserEmail (unassigned)
    let tickets = matching
    if (tickets.length < quantity) {
      // Try to assign unassigned tickets first
      const unassigned = allTickets
        .filter(t =>
          t.event_id === eventId &&
          t.tier_id === tierId &&
          (!t.purchaser_email || t.purchaser_email === "") &&
          !t.is_validated
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, quantity - tickets.length)
      // Assign these tickets to the purchaser
      for (const ticket of unassigned) {
        await dbService.updateTicket(ticket.id, {
          purchaser_name: session.metadata?.purchaserName || "",
          purchaser_email: purchaserEmail,
        })
      }
      // Re-fetch tickets after assignment
      allTickets = await dbService.getTicketsWithDetails()
      tickets = allTickets
        .filter(t =>
          t.event_id === eventId &&
          t.tier_id === tierId &&
          t.purchaser_email === purchaserEmail &&
          !t.is_validated
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, quantity)
    }
    if (tickets.length < quantity) {
      // If still not enough, create new tickets and assign
      // Use service role client for privileged insert
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      for (let i = 0; i < quantity - tickets.length; i++) {
        await dbService.createTicket({
          event_id: eventId,
          tier_id: tierId,
          purchaser_name: session.metadata?.purchaserName || "",
          purchaser_email: purchaserEmail,
        }, serviceSupabase)
      }
      // Re-fetch tickets after creation
      allTickets = await dbService.getTicketsWithDetails()
      tickets = allTickets
        .filter(t =>
          t.event_id === eventId &&
          t.tier_id === tierId &&
          t.purchaser_email === purchaserEmail &&
          !t.is_validated
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, quantity)
    }
    // Return only id and qrCodeUrl
    const ticketObjs = tickets.map(t => ({ id: t.id, qrCodeUrl: t.qr_code_url }))

    // Send email with PDF(s) if tickets and purchaserEmail exist
    if (tickets.length > 0 && purchaserEmail) {
      try {
        // For each ticket, ensure PDF is uploaded to storage and get the PDF buffer
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const pdfBuffers = await Promise.all(
          tickets.map(async (t) => {
            const ticketWithDetails = await dbService.getTicketWithDetails(t.id);
            if (!ticketWithDetails || !ticketWithDetails.event || !ticketWithDetails.tier) {
              console.warn("Cannot send ticket email: ticket, event, or tier not found.");
              return null;
            }
            // Fetch teams for PDF
            let team1 = undefined;
            let team2 = undefined;
            if (ticketWithDetails.event.team1Id) team1 = await supabaseService.getTeamById(ticketWithDetails.event.team1Id) || undefined;
            if (ticketWithDetails.event.team2Id) team2 = await supabaseService.getTeamById(ticketWithDetails.event.team2Id) || undefined;
            // Ensure PDF exists in storage
            const fileName = `ticket-${t.id}.pdf`;
            let pdfBytes = undefined;
            // Try to download from storage
            const { data, error } = await serviceSupabase.storage.from('ticket-pdfs').download(fileName);
            if (error || !data) {
              pdfBytes = await generateTicketPDF(ticketWithDetails, team1, team2);
              await serviceSupabase.storage.from('ticket-pdfs').upload(fileName, pdfBytes, {
                contentType: 'application/pdf',
                upsert: true,
              });
            } else {
              pdfBytes = Buffer.from(await data.arrayBuffer());
            }
            if (pdfBytes && !(pdfBytes instanceof Buffer)) {
              pdfBytes = Buffer.from(pdfBytes);
            }
            return {
              filename: fileName,
              content: pdfBytes,
            };
          })
        );
        // Filter out any nulls
        const attachments: { filename: string; content: Buffer }[] = pdfBuffers.filter(a => a !== null) as { filename: string; content: Buffer }[];
        // Prepare email body (can be improved as needed)
        const emailHtml = `<div style=\"font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;\">Jūsų bilietas į renginį yra prisegtas kaip PDF dokumentas.</div>`;
        await resend.emails.send({
          from: "tickets@soccer-team.app",
          to: purchaserEmail,
          subject: "Jūsų bilietas į renginį",
          html: emailHtml,
          attachments,
        });
      } catch (err) {
        console.error("Failed to send ticket email:", err);
      }
    }
    return NextResponse.json({ tickets: ticketObjs }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching tickets for session:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500, headers: CORS_HEADERS })
  }
} 