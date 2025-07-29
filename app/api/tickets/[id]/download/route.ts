import { NextRequest, NextResponse } from "next/server"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { createClient } from '@supabase/supabase-js'
import type { Team, TicketWithDetails } from "@/lib/types"

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const { data: rawTicket, error: ticketError } = await supabaseAdmin
        .from("tickets")
        .select(`*, events(*), pricing_tiers(*)`)
        .eq("id", ticketId)
        .single();
    
    if (ticketError) {
      console.error("Error fetching ticket details:", ticketError);
      throw new Error(`Failed to fetch ticket details: ${ticketError.message}`);
    }
    
    if (!rawTicket || !rawTicket.events || !rawTicket.pricing_tiers) {
      return NextResponse.json({ error: "Ticket not found or is missing relations" }, { status: 404 });
    }

    const ticket: TicketWithDetails = {
        id: rawTicket.id,
        eventId: rawTicket.event_id,
        tierId: rawTicket.tier_id,
        purchaserName: rawTicket.purchaser_name,
        purchaserSurname: rawTicket.purchaser_surname,
        purchaserEmail: rawTicket.purchaser_email,
        isValidated: rawTicket.is_validated,
        createdAt: rawTicket.created_at,
        validatedAt: rawTicket.validated_at,
        qrCodeUrl: rawTicket.qr_code_url,
        pdfUrl: rawTicket.pdf_url,
        event: {
          id: rawTicket.events.id,
          title: rawTicket.events.title,
          description: rawTicket.events.description,
          date: rawTicket.events.date,
          time: rawTicket.events.time,
          location: rawTicket.events.location,
          createdAt: rawTicket.events.created_at,
          updatedAt: rawTicket.events.updated_at,
          team1Id: rawTicket.events.team1_id,
          team2Id: rawTicket.events.team2_id,
          coverImageUrl: rawTicket.events.cover_image_url || undefined,
        },
        tier: {
          id: rawTicket.pricing_tiers.id,
          eventId: rawTicket.pricing_tiers.event_id,
          name: rawTicket.pricing_tiers.name,
          price: rawTicket.pricing_tiers.price,
          quantity: rawTicket.pricing_tiers.quantity,
          soldQuantity: rawTicket.pricing_tiers.sold_quantity,
        },
    }

    let team1: Team | null = null;
    let team2: Team | null = null;

    if (ticket.event.team1Id) {
        const { data, error } = await supabaseAdmin.from('teams').select('*').eq('id', ticket.event.team1Id).single();
        if(error) console.error("Error fetching team 1:", error.message);
        team1 = data;
    }
    if (ticket.event.team2Id) {
        const { data, error } = await supabaseAdmin.from('teams').select('*').eq('id', ticket.event.team2Id).single();
        if(error) console.error("Error fetching team 2:", error.message);
        team2 = data;
    }
    
    console.log("Ticket passed to PDF generator:", ticket);
    console.log("Team 1:", team1);
    console.log("Team 2:", team2);

    const pdfBytes = await generateTicketPDF(ticket, team1 || undefined, team2 || undefined)
    
    // Return the PDF file directly
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.id}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error generating ticket PDF:", error)
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate ticket PDF", details: message }, { status: 500 })
  }
} 