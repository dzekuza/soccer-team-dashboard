import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabase-service";
import { QRCodeService } from "@/lib/qr-code-service";
import type { TicketWithDetails } from "@/lib/types";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  try {
    const { ticketIds } = await request.json();

    if (!ticketIds || !Array.isArray(ticketIds)) {
      return NextResponse.json({
        error: "Ticket IDs array is required",
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const ticketId of ticketIds) {
      try {
        // Fetch ticket with full details
        const { data: ticket, error } = await supabase
          .from("tickets")
          .select(`
            *,
            event:events (*),
            pricing_tier:pricing_tiers (*)
          `)
          .eq("id", ticketId)
          .single();

        if (error || !ticket) {
          errors.push({
            ticketId,
            error: "Ticket not found",
          });
          continue;
        }

        // Generate enhanced QR code
        const ticketWithDetails: TicketWithDetails = {
          id: ticket.id,
          eventId: ticket.event_id,
          tierId: ticket.pricing_tier_id,
          purchaserName: ticket.purchaser_name,
          purchaserEmail: ticket.purchaser_email,
          isValidated: ticket.is_validated,
          createdAt: ticket.created_at,
          validatedAt: ticket.validated_at,
          qrCodeUrl: ticket.qr_code_url,
          event: ticket.event,
          tier: ticket.pricing_tier,
        };

        const enhancedQRCodeUrl = await QRCodeService.updateTicketQRCode(
          ticketWithDetails,
        );

        // Update ticket with new QR code
        const { error: updateError } = await supabase
          .from("tickets")
          .update({
            qr_code_url: enhancedQRCodeUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ticketId);

        if (updateError) {
          errors.push({
            ticketId,
            error: `Failed to update QR code: ${updateError.message}`,
          });
        } else {
          results.push({
            ticketId,
            success: true,
            message: "QR code updated successfully",
          });
        }
      } catch (error) {
        errors.push({
          ticketId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: ticketIds.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Error updating QR codes:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to update QR codes",
      details: message,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  try {
    // Get all tickets that need QR code updates
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`
        id,
        qr_code_url,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Filter tickets that have legacy QR codes (just IDs)
    const ticketsNeedingUpdate = tickets.filter((ticket) => {
      // Check if QR code URL is just a simple ID or legacy format
      return !ticket.qr_code_url ||
        ticket.qr_code_url.length < 100 || // Legacy QR codes are shorter
        ticket.qr_code_url.startsWith("data:image/png;base64,") === false;
    });

    return NextResponse.json({
      ticketsNeedingUpdate: ticketsNeedingUpdate.length,
      totalTickets: tickets.length,
      tickets: ticketsNeedingUpdate.map((t) => ({
        id: t.id,
        createdAt: t.created_at,
        hasLegacyQR: !t.qr_code_url || t.qr_code_url.length < 100,
      })),
    });
  } catch (error) {
    console.error("Error fetching tickets for QR update:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to fetch tickets",
      details: message,
    }, { status: 500 });
  }
}
