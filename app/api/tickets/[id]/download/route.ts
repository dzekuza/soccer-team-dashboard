import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Team, TicketWithDetails } from "@/lib/types";
import { renderTicketHtml } from "@/lib/ticket-html";
import puppeteer from "puppeteer";

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

    // Generate PDF using Puppeteer with optimized settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to match the ticket dimensions exactly
    await page.setViewport({
      width: 1600,
      height: 700,
      deviceScaleFactor: 2,
    });

    // Set content and wait for all resources to load
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });

    // Wait for images and fonts to load
    await page.evaluate(() => {
      return Promise.all([
        ...Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", reject);
          });
        }),
        document.fonts.ready,
      ]);
    });

    // Additional wait to ensure everything is rendered
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate PDF with exact dimensions
    const pdfBuffer = await page.pdf({
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

    await browser.close();

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
