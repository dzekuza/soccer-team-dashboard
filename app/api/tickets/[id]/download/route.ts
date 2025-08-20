import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Team, TicketWithDetails } from "@/lib/types";
import { renderTicketHtml } from "@/lib/ticket-html";
import { generatePDFFromHTML } from "@/lib/pdf-service";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
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
      return NextResponse.json({
        error: "Ticket not found or is missing relations",
      }, { status: 404 });
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
    };

    const origin = new URL(_request.url).origin;
    const html = await renderTicketHtml({ ticket, origin });

    let pdfBuffer: Buffer | Uint8Array;

    try {
      // Generate PDF using the new PDF service
      pdfBuffer = await generatePDFFromHTML({
        html,
        width: "1600px",
        height: "700px",
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });
      console.log("Generated PDF ticket successfully using PDF service");
    } catch (pdfError) {
      console.warn("PDF generation failed with PDF service:", pdfError);

      // Fallback: Try using pdf-lib
      try {
        console.log("Attempting fallback PDF generation with pdf-lib...");
        const { generateTicketPDF } = await import("@/lib/pdf-generator");

        // Get team data for the fallback
        let team1 = null;
        let team2 = null;
        if (ticket.event.team1Id) {
          const { data: team1Data } = await supabaseAdmin
            .from("teams")
            .select("*")
            .eq("id", ticket.event.team1Id)
            .single();
          team1 = team1Data;
        }
        if (ticket.event.team2Id) {
          const { data: team2Data } = await supabaseAdmin
            .from("teams")
            .select("*")
            .eq("id", ticket.event.team2Id)
            .single();
          team2 = team2Data;
        }

        const pdfArray = await generateTicketPDF(ticket, team1, team2);
        pdfBuffer = pdfArray;
        console.log("Generated PDF ticket successfully using fallback method");
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        throw new Error(
          "PDF generation failed with both PDF service and fallback methods",
        );
      }
    }

    // Return the PDF file for download
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${ticket.id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to generate ticket PDF",
      details: message,
    }, { status: 500 });
  }
}
