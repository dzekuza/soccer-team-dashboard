import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { createClient } from '@supabase/supabase-js'
import type { Team } from "@/lib/types"
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

// Service role client for privileged actions
const serviceSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CORS headers helper
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.get('authorization')
    const jwt = authHeader?.split(' ')[1]
    console.log('[DEBUG] JWT received:', jwt)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    )

    const body = await request.json()
    const { event_id, tier_id, purchaser_name, purchaser_email } = body

    // Validate required fields
    if (!event_id || !tier_id || !purchaser_name || !purchaser_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the pricing tier exists and has available capacity
    const tier = await dbService.getPricingTier(tier_id)
    if (!tier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 })
    }

    if (tier.soldQuantity >= tier.maxQuantity) {
      return NextResponse.json({ error: "No tickets available for this tier" }, { status: 400 })
    }

    // 1. Always try to insert user with purchaser_email and purchaser_name, including a generated UUID for id
    let user_id: string | undefined = undefined;
    let new_user_insert_error = null;
    let new_user = null;
    const generated_user_id = uuidv4();
    try {
      const { data: inserted_user, error: insert_error } = await serviceSupabase
        .from("users")
        .insert({ id: generated_user_id, email: purchaser_email, name: purchaser_name })
        .select("id")
        .single();
      if (insert_error) {
        new_user_insert_error = insert_error;
      } else {
        new_user = inserted_user;
      }
    } catch (err) {
      new_user_insert_error = err;
    }
    if (new_user && new_user.id) {
      user_id = new_user.id;
    } else if ((new_user_insert_error as any)?.code === '23505') { // Unique violation
      // Fetch existing user by email
      const { data: existing_user, error: fetch_error } = await serviceSupabase
        .from("users")
        .select("id")
        .eq("email", purchaser_email)
        .single();
      if (existing_user && existing_user.id) {
        user_id = existing_user.id;
      } else {
        return NextResponse.json({ error: "Failed to fetch existing user after unique violation", details: (fetch_error as any)?.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Failed to create or fetch user", details: (new_user_insert_error as any)?.message }, { status: 500 })
    }

    // Fetch event to get cover image URL
    const event = await dbService.getEventWithTiers(event_id)
    console.log('[DEBUG] Event fetched for ticket:', JSON.stringify(event, null, 2))
    let event_cover_image_url: string | undefined = undefined
    if (event && event.coverImageUrl) {
      if (event.coverImageUrl.startsWith('http')) {
        event_cover_image_url = event.coverImageUrl
      } else {
        const covers_base_url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/covers/'
        event_cover_image_url = covers_base_url + event.coverImageUrl.replace(/^covers\//, '')
      }
    }

    let event_date: string | undefined = undefined
    let eventDate: string | undefined = undefined
    if (event && event.date) {
      eventDate = event.date
    }

    // Prepare all event metadata for the ticket
    let eventTitle: string | undefined = undefined
    let eventDescription: string | undefined = undefined
    let eventLocation: string | undefined = undefined
    let eventTime: string | undefined = undefined
    let team1Id: string | undefined = undefined
    let team2Id: string | undefined = undefined
    if (event) {
      eventTitle = event.title
      eventDescription = event.description
      eventLocation = event.location
      eventTime = event.time
      team1Id = event.team1Id
      team2Id = event.team2Id
    }

    // Log pricing tier and all pricing tiers for the event
    console.log('[DEBUG] Selected pricing tier:', JSON.stringify(tier, null, 2))
    if (event && event.pricingTiers) {
      console.log('[DEBUG] All event pricing tiers:', JSON.stringify(event.pricingTiers, null, 2))
    }

    // Validate team1Id (teamId)
    if (!team1Id) {
      return NextResponse.json({ error: "Event is missing team1Id (team_id is required for ticket creation)" }, { status: 400 })
    }

    // Generate QR code URL for the ticket
    const qr_code_url = `/api/validate-ticket/${crypto.randomUUID()}`;
    const ticketInsert = {
      event_id,
      tier_id,
      purchaser_name,
      purchaser_email,
      is_validated: false,
      qr_code_url,
      created_at: new Date().toISOString(),
      validated_at: null,
      event_cover_image_url,
      event_date,
      event_description: eventDescription,
      event_location: eventLocation,
      event_time: eventTime,
      event_title: eventTitle,
      team1_id: team1Id,
      team2_id: team2Id,
      pdf_url: undefined,
    };
    const ticket = await dbService.createTicket(ticketInsert, supabase)
    console.log('[DEBUG] Ticket object before PDF generation:', JSON.stringify(ticket, null, 2))

    // --- PDF GENERATION AND UPLOAD ---
    let pdfUrl: string | undefined = undefined;
    try {
      // Fetch real team data for PDF
      let team1: Team | undefined = undefined;
      let team2: Team | undefined = undefined;
      if (event && event.team1Id) team1 = await dbService.getTeamById(event.team1Id) || undefined;
      if (event && event.team2Id) team2 = await dbService.getTeamById(event.team2Id) || undefined;
      if (event) {
        const pdfBytes = await generateTicketPDF({ ...ticket, event, tier }, team1, team2);
        const fileName = `ticket-${ticket.id}.pdf`;
        const { error: uploadError } = await supabase.storage.from('ticket-pdfs').upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true,
        });
        if (uploadError) {
          console.error('Failed to upload ticket PDF:', uploadError);
        } else {
          const { data: urlData } = supabase.storage.from('ticket-pdfs').getPublicUrl(fileName);
          pdfUrl = urlData?.publicUrl;
          if (pdfUrl) {
            await supabase.from('tickets').update({ pdf_url: pdfUrl }).eq('id', ticket.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to generate/upload ticket PDF:', err);
    }
    // --- END PDF GENERATION AND UPLOAD ---

    // 3. Increment sold_quantity in pricing_tiers
    await supabase
      .from("pricing_tiers")
      .update({ sold_quantity: tier.soldQuantity + 1 })
      .eq("id", tier_id)

    // Send email with PDF ticket
    if (ticket && purchaser_email) {
      try {
        if (!event || !tier) {
          console.warn("Cannot send ticket email: event or tier not found.")
        } else {
          // Prepare email
          const emailHtml = `<div style=\"font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;\">Jūsų bilietas į renginį yra prisegtas kaip PDF dokumentas.</div>`;
          const fileName = `ticket-${ticket.id}.pdf`;
          let pdfBytes = undefined;
          // Download PDF from storage if exists, else generate
          if (pdfUrl) {
            const { data, error } = await serviceSupabase.storage.from('ticket-pdfs').download(fileName);
            if (error || !data) {
              pdfBytes = await generateTicketPDF({ ...ticket, event, tier });
            } else {
              pdfBytes = Buffer.from(await data.arrayBuffer());
            }
          } else {
            pdfBytes = await generateTicketPDF({ ...ticket, event, tier });
          }
          if (pdfBytes && !(pdfBytes instanceof Buffer)) {
            pdfBytes = Buffer.from(pdfBytes);
          }
          await resend.emails.send({
            from: "Banga <info@teamup.lt>",
            to: purchaser_email,
            subject: "Jūsų bilietas į renginį",
            html: emailHtml,
            attachments: [{ filename: fileName, content: pdfBytes }],
          })
        }
      } catch (err) {
        console.error("Failed to send manual ticket email:", err)
      }
    }

    // Return ticket with pdfUrl
    return NextResponse.json({ ...ticket, pdfUrl }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500, headers: CORS_HEADERS })
  }
}

export async function GET() {
  try {
    const tickets = await dbService.getTicketsWithDetails()
    return NextResponse.json(tickets, { headers: CORS_HEADERS })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500, headers: CORS_HEADERS })
  }
}

// Resend ticket email by ticket ID
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket_id } = body;
    if (!ticket_id) {
      return NextResponse.json({ error: "Missing ticket_id" }, { status: 400, headers: CORS_HEADERS });
    }
    // Fetch ticket with details
    const ticket = await dbService.getTicketWithDetails(ticket_id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404, headers: CORS_HEADERS });
    }
    // Fetch event and tier from ticket
    const event = ticket.event;
    const tier = ticket.tier;
    // Fetch teams
    let team1 = undefined;
    let team2 = undefined;
    if (event.team1Id) team1 = await dbService.getTeamById(event.team1Id) || undefined;
    if (event.team2Id) team2 = await dbService.getTeamById(event.team2Id) || undefined;
    // Ensure PDF exists in storage
    const fileName = `ticket-${ticket.id}.pdf`;
    let pdfUrl = ticket.pdf_url;
    let pdfBytes = undefined;
    if (!pdfUrl) {
      pdfBytes = await generateTicketPDF(ticket, team1, team2);
      const { error: uploadError } = await serviceSupabase.storage.from('ticket-pdfs').upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });
      if (uploadError) {
        return NextResponse.json({ error: 'Failed to upload ticket PDF' }, { status: 500, headers: CORS_HEADERS });
      }
      const { data: urlData } = serviceSupabase.storage.from('ticket-pdfs').getPublicUrl(fileName);
      pdfUrl = urlData?.publicUrl;
      await serviceSupabase.from('tickets').update({ pdf_url: pdfUrl }).eq('id', ticket.id);
    } else {
      // Download PDF from storage
      const { data, error } = await serviceSupabase.storage.from('ticket-pdfs').download(fileName);
      if (error || !data) {
        return NextResponse.json({ error: 'Failed to download ticket PDF' }, { status: 500, headers: CORS_HEADERS });
      }
      pdfBytes = Buffer.from(await data.arrayBuffer());
    }
    // Send email with PDF attached
    try {
      const emailHtml = `<div style=\"font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;\">Jūsų bilietas į renginį yra prisegtas kaip PDF dokumentas.</div>`;
      // Ensure pdfBytes is a Buffer for attachment
      if (pdfBytes && !(pdfBytes instanceof Buffer)) {
        pdfBytes = Buffer.from(pdfBytes);
      }
      await resend.emails.send({
        from: "Banga <info@teamup.lt>",
        to: ticket.purchaser_email,
        subject: "Jūsų bilietas į renginį (pakartotinai)",
        html: emailHtml,
        attachments: [{ filename: fileName, content: pdfBytes }],
      });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to send ticket email', details: (err as any)?.message }, { status: 500, headers: CORS_HEADERS });
    }
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resend ticket' }, { status: 500, headers: CORS_HEADERS });
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
