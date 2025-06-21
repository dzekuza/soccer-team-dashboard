import { type NextRequest, NextResponse } from "next/server"
import * as supabaseSSR from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseService } from "@/lib/supabase-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import type { Team, TicketWithDetails } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = supabaseSSR.createRouteHandlerClient({ cookies: () => cookies() })
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event_id, tier_id, purchaser_name, purchaser_surname, purchaser_email } = await request.json();

    if (!event_id || !tier_id || !purchaser_name || !purchaser_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- Start New, Robust Logic ---

    // 1. Fetch all necessary data upfront
    const event = await supabaseService.getEventWithTiers(event_id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const tier = event.pricing_tiers.find(t => t.id === tier_id);
    if (!tier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 });
    }
    
    let team1: Team | undefined = undefined;
    let team2: Team | undefined = undefined;
    if (event.team1_id) team1 = await supabaseService.getTeamById(event.team1_id) || undefined;
    if (event.team2_id) team2 = await supabaseService.getTeamById(event.team2_id) || undefined;
    
    // 2. Create the ticket
    const newTicket = await supabaseService.createTicket({
      event_id,
      tier_id,
      purchaser_name,
      purchaser_surname,
      purchaser_email,
      status: 'valid',
    });

    if (!newTicket) {
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    // 3. Generate PDF and Send Email
    const fullTicketDetails: TicketWithDetails = {
      ...newTicket,
      events: event,
      pricing_tiers: tier,
    };

    const pdfBytes = await generateTicketPDF(fullTicketDetails, team1, team2);
    const fileName = `ticket-${fullTicketDetails.id}.pdf`;

    if (fullTicketDetails.purchaser_email) {
      await resend.emails.send({
        from: 'noreply@soccer-team-dashboard.com',
        to: fullTicketDetails.purchaser_email,
        subject: `Jūsų bilietas renginiui: ${fullTicketDetails.events.title}`,
        html: `<p>Dėkojame, kad pirkote! Jūsų bilietas prisegtas.</p>`,
        attachments: [{
          filename: fileName,
          content: Buffer.from(pdfBytes)
        }]
      });
    }

    // 4. Return success
    return NextResponse.json({ ticket: newTicket });
    
    // --- End New Logic ---

  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = supabaseSSR.createRouteHandlerClient({ cookies: () => cookies() })
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
  const supabase = supabaseSSR.createRouteHandlerClient({ cookies: () => cookies() })
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
    if (!ticket || !ticket.purchaser_email) {
      return NextResponse.json({ error: "Ticket not found or missing email" }, { status: 404 });
    }

    // PDF Generation is intensive, let's assume it works as before
    const event = ticket.events; // Note: changed from ticket.event based on previous fixes
    let team1: Team | undefined = undefined;
    let team2: Team | undefined = undefined;
    if (event.team1_id) team1 = await supabaseService.getTeamById(event.team1_id) || undefined;
    if (event.team2_id) team2 = await supabaseService.getTeamById(event.team2_id) || undefined;
    
    const pdfBytes = await generateTicketPDF(ticket, team1, team2);
    const fileName = `ticket-${ticket.id}.pdf`;

    await resend.emails.send({
      from: 'noreply@soccer-team-dashboard.com',
      to: ticket.purchaser_email,
      subject: `Jūsų bilietas renginiui: ${ticket.events.title}`,
      html: `<p>Dėkojame, kad pirkote! Jūsų bilietas prisegtas.</p>`,
      attachments: [{
        filename: fileName,
        content: Buffer.from(pdfBytes)
      }]
    });

    return NextResponse.json({ message: "Ticket email resent successfully." });
  } catch (error: any) {
    console.error('Error resending ticket:', error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
