export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseService } from "@/lib/supabase-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import type { Team, TicketWithDetails, EventWithTiers, PricingTier } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, tierId, purchaserName, purchaserSurname, purchaserEmail } = await request.json();

    if (!eventId || !tierId || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await supabaseService.getEventWithTiers(eventId) as EventWithTiers | null;
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const tier = event.pricingTiers.find((t: PricingTier) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });
    }
    
    let team1: Team | undefined = undefined;
    let team2: Team | undefined = undefined;
    if (event.team1Id) team1 = await supabaseService.getTeamById(event.team1Id) || undefined;
    if (event.team2Id) team2 = await supabaseService.getTeamById(event.team2Id) || undefined;
    
    await createClient().from('fans').upsert({
        name: purchaserName,
        surname: purchaserSurname,
        email: purchaserEmail
    }, { onConflict: 'email' });

    const newTicket = await supabaseService.createTicket({
      eventId,
      tierId,
      purchaserName,
      purchaserSurname,
      purchaserEmail,
      status: 'valid',
    });

    if (!newTicket) {
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    const fullTicketDetails: TicketWithDetails = { ...newTicket, event: event, tier: tier };
    const pdfBytes = await generateTicketPDF(fullTicketDetails, team1, team2);
    const fileName = `ticket-${fullTicketDetails.id}.pdf`;

    if (fullTicketDetails.purchaserEmail) {
      await resend.emails.send({
        from: 'noreply@soccer-team-dashboard.com',
        to: fullTicketDetails.purchaserEmail,
        subject: `Jūsų bilietas renginiui: ${fullTicketDetails.event.title}`,
        html: `<p>Dėkojame, kad pirkote! Jūsų bilietas prisegtas.</p>`,
        attachments: [{ filename: fileName, content: Buffer.from(pdfBytes) }]
      });
    }

    return NextResponse.json({ ticket: newTicket });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tickets = await supabaseService.getTicketsWithDetails();
    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticket_id } = await request.json();

    if (!ticket_id) {
      return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 });
    }

    const ticket = await supabaseService.getTicketWithDetails(ticket_id);
    if (!ticket || !ticket.purchaserEmail) {
      return NextResponse.json({ error: "Ticket not found or missing email" }, { status: 404 });
    }

    const event = ticket.event;
    let team1: Team | undefined = undefined;
    let team2: Team | undefined = undefined;
    if (event.team1Id) team1 = await supabaseService.getTeamById(event.team1Id) || undefined;
    if (event.team2Id) team2 = await supabaseService.getTeamById(event.team2Id) || undefined;
    
    const pdfBytes = await generateTicketPDF(ticket, team1, team2);
    const fileName = `ticket-${ticket.id}.pdf`;

    await resend.emails.send({
      from: 'noreply@soccer-team-dashboard.com',
      to: ticket.purchaserEmail,
      subject: `Jūsų bilietas renginiui: ${ticket.event.title}`,
      html: `<p>Dėkojame, kad pirkote! Jūsų bilietas prisegtas.</p>`,
      attachments: [{ filename: fileName, content: Buffer.from(pdfBytes) }]
    });

    return NextResponse.json({ message: "Ticket email resent successfully." });
  } catch (error: any) {
    console.error('Error resending ticket:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
