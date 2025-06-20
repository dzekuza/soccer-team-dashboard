import { type NextRequest, NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { createClient } from '@supabase/supabase-js'
import type { Team, TicketWithDetails } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

// CORS headers helper
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function getSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) throw new Error("Missing Authorization header");
  const jwt = authHeader.split(' ')[1];
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication failed");

  return { supabase, user };
}

export async function POST(request: NextRequest) {
  try {
    await getSupabaseClient(request); // Auth check
    const { event_id, tier_id, purchaser_name, purchaser_surname, purchaser_email } = await request.json();

    if (!event_id || !tier_id || !purchaser_name || !purchaser_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS });
    }

    const ticket = await supabaseService.createTicket({
      event_id,
      tier_id,
      purchaser_name,
      purchaser_surname,
      purchaser_email,
      status: 'valid',
    });

    if (!ticket) {
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500, headers: CORS_HEADERS });
    }

    return NextResponse.json({ ticket }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    const status = error.message === "Authentication failed" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status, headers: CORS_HEADERS });
  }
}

export async function GET(request: NextRequest) {
  try {
    await getSupabaseClient(request); // Auth check
    const tickets = await supabaseService.getTicketsWithDetails();
    return NextResponse.json({ tickets }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    const status = error.message === "Authentication failed" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status, headers: CORS_HEADERS });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = await getSupabaseClient(request); // Auth check
    const { ticket_id } = await request.json();

    if (!ticket_id) {
      return NextResponse.json({ error: "Missing ticket_id" }, { status: 400, headers: CORS_HEADERS });
    }

    const ticket = await supabaseService.getTicketWithDetails(ticket_id);
    if (!ticket || !ticket.purchaser_email) {
      return NextResponse.json({ error: "Ticket not found or missing email" }, { status: 404, headers: CORS_HEADERS });
    }

    // --- PDF GENERATION AND UPLOAD ---
    const event = ticket.event;
    let team1: Team | undefined = undefined;
    let team2: Team | undefined = undefined;
    if (event.team1_id) team1 = await supabaseService.getTeamById(event.team1_id) || undefined;
    if (event.team2_id) team2 = await supabaseService.getTeamById(event.team2_id) || undefined;
    
    const pdfBytes = await generateTicketPDF(ticket, team1, team2);
    const fileName = `ticket-${ticket.id}.pdf`;

    const { error: uploadError } = await supabase.storage.from('ticket-pdfs').upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`PDF Upload Error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from('ticket-pdfs').getPublicUrl(fileName);

    // --- EMAIL ---
    await resend.emails.send({
      from: 'tickets@example.com',
      to: ticket.purchaser_email,
      subject: `Your ticket for ${ticket.event.title}`,
      html: `<p>Thank you for your purchase! Your ticket is attached.</p>`,
      attachments: [{
        filename: 'ticket.pdf',
        path: publicUrl
      }]
    });

    return NextResponse.json({ message: "Ticket email resent successfully.", pdfUrl: publicUrl }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Error resending ticket:', error);
    const status = error.message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status, headers: CORS_HEADERS });
  }
}
