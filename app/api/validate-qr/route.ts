import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { QRCodeService } from "@/lib/qr-code-service";

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
    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json({ error: "QR data is required" }, {
        status: 400,
      });
    }

    const trimmedData = qrData.trim();

    if (!trimmedData) {
      return NextResponse.json({ error: "Invalid QR code data" }, {
        status: 400,
      });
    }

    // Try to parse as enhanced QR code first
    const enhancedData = QRCodeService.parseQRCodeData(trimmedData);

    if (enhancedData) {
      // Enhanced QR code with comprehensive data
      if (QRCodeService.isTicketQR(enhancedData)) {
        return await validateEnhancedTicketQR(enhancedData, supabase);
      } else if (QRCodeService.isSubscriptionQR(enhancedData)) {
        return await validateEnhancedSubscriptionQR(enhancedData, supabase);
      }
    }

    // Fallback to legacy QR code (just ID)
    const id = trimmedData;

    // Try to validate as ticket first
    const ticketResult = await validateLegacyTicketQR(
      { ticketId: id },
      supabase,
    );
    if (ticketResult.status !== 404) {
      return ticketResult;
    }

    // If not a ticket, try as subscription
    const subscriptionResult = await validateLegacySubscriptionQR({
      subscriptionId: id,
    }, supabase);
    if (subscriptionResult.status !== 404) {
      return subscriptionResult;
    }

    // If neither found, return error
    return NextResponse.json({
      error: "Invalid QR code",
      details:
        "The scanned QR code does not correspond to any valid ticket or subscription",
    }, { status: 404 });
  } catch (error) {
    console.error("Error validating QR code:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to validate QR code",
      details: message,
    }, { status: 500 });
  }
}

async function validateEnhancedTicketQR(qrData: any, supabase: any) {
  try {
    // Check if ticket exists and is not already validated
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events (*),
        pricing_tier:pricing_tiers (*)
      `)
      .eq("id", qrData.ticketId)
      .single();

    if (error || !ticket) {
      return NextResponse.json({
        error: "Ticket not found",
        details: "The ticket ID in the QR code does not exist",
      }, { status: 404 });
    }

    // Validate QR code data against database
    if (
      ticket.event_id !== qrData.eventId ||
      ticket.purchaser_name !== qrData.purchaserName ||
      ticket.purchaser_email !== qrData.purchaserEmail
    ) {
      return NextResponse.json({
        error: "QR code data mismatch",
        details: "The QR code data does not match the ticket in our database",
      }, { status: 400 });
    }

    if (ticket.is_validated) {
      return NextResponse.json({
        error: "This ticket already scanned",
        details:
          "This ticket has already been validated and used. Each ticket can only be used once.",
      }, { status: 400 });
    }

    // Validate event date (ticket should be for today or future)
    const eventDate = new Date(ticket.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return NextResponse.json({
        error: "Event has passed",
        details: "This ticket is for an event that has already occurred",
      }, { status: 400 });
    }

    // Mark ticket as validated
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        is_validated: true,
        validated_at: new Date().toISOString(),
      })
      .eq("id", qrData.ticketId);

    if (updateError) {
      console.error("Error updating ticket validation status:", updateError);
      return NextResponse.json({
        error: "Failed to validate ticket",
        details: "Could not update ticket status",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully",
      data: {
        ticketId: ticket.id,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        eventTime: ticket.event.time,
        purchaserName: ticket.purchaser_name,
        tierName: ticket.pricing_tier.name,
        validatedAt: new Date().toISOString(),
        qrCodeType: "enhanced",
      },
    });
  } catch (error) {
    console.error("Error in validateEnhancedTicketQR:", error);
    throw error;
  }
}

async function validateEnhancedSubscriptionQR(qrData: any, supabase: any) {
  try {
    // Check if subscription exists and is valid
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", qrData.subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({
        error: "Subscription not found",
        details: "The subscription ID in the QR code does not exist",
      }, { status: 404 });
    }

    // Validate QR code data against database
    if (
      subscription.purchaser_name !== qrData.purchaserName ||
      subscription.purchaser_email !== qrData.purchaserEmail
    ) {
      return NextResponse.json({
        error: "QR code data mismatch",
        details:
          "The QR code data does not match the subscription in our database",
      }, { status: 400 });
    }

    // Check if subscription is still valid
    const now = new Date();
    const validFrom = new Date(subscription.valid_from);
    const validTo = new Date(subscription.valid_to);

    if (now < validFrom) {
      return NextResponse.json({
        error: "Subscription not yet active",
        details: `Subscription becomes active on ${
          validFrom.toLocaleDateString("lt-LT")
        }`,
      }, { status: 400 });
    }

    if (now > validTo) {
      return NextResponse.json({
        error: "Subscription expired",
        details: `Subscription expired on ${
          validTo.toLocaleDateString("lt-LT")
        }`,
      }, { status: 400 });
    }

    // Subscriptions can be used multiple times until they expire
    return NextResponse.json({
      success: true,
      message: "Subscription validated successfully",
      data: {
        subscriptionId: subscription.id,
        purchaserName: subscription.purchaser_name,
        purchaserSurname: subscription.purchaser_surname,
        validFrom: subscription.valid_from,
        validTo: subscription.valid_to,
        validatedAt: new Date().toISOString(),
        qrCodeType: "enhanced",
      },
    });
  } catch (error) {
    console.error("Error in validateEnhancedSubscriptionQR:", error);
    throw error;
  }
}

async function validateLegacyTicketQR(qrData: any, supabase: any) {
  try {
    // Check if ticket exists and is not already validated
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events (*),
        pricing_tier:pricing_tiers (*)
      `)
      .eq("id", qrData.ticketId)
      .single();

    if (error || !ticket) {
      return NextResponse.json({
        error: "Ticket not found",
        details: "The ticket ID in the QR code does not exist",
      }, { status: 404 });
    }

    if (ticket.is_validated) {
      return NextResponse.json({
        error: "This ticket already scanned",
        details:
          "This ticket has already been validated and used. Each ticket can only be used once.",
      }, { status: 400 });
    }

    // Validate event date (ticket should be for today or future)
    const eventDate = new Date(ticket.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return NextResponse.json({
        error: "Event has passed",
        details: "This ticket is for an event that has already occurred",
      }, { status: 400 });
    }

    // Mark ticket as validated
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        is_validated: true,
        validated_at: new Date().toISOString(),
      })
      .eq("id", qrData.ticketId);

    if (updateError) {
      console.error("Error updating ticket validation status:", updateError);
      return NextResponse.json({
        error: "Failed to validate ticket",
        details: "Could not update ticket status",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully",
      data: {
        ticketId: ticket.id,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        eventTime: ticket.event.time,
        purchaserName: ticket.purchaser_name,
        tierName: ticket.pricing_tier.name,
        validatedAt: new Date().toISOString(),
        qrCodeType: "legacy",
      },
    });
  } catch (error) {
    console.error("Error in validateLegacyTicketQR:", error);
    throw error;
  }
}

async function validateLegacySubscriptionQR(qrData: any, supabase: any) {
  try {
    // Check if subscription exists and is valid
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", qrData.subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({
        error: "Subscription not found",
        details: "The subscription ID in the QR code does not exist",
      }, { status: 404 });
    }

    // Check if subscription is still valid
    const now = new Date();
    const validFrom = new Date(subscription.valid_from);
    const validTo = new Date(subscription.valid_to);

    if (now < validFrom) {
      return NextResponse.json({
        error: "Subscription not yet active",
        details: `Subscription becomes active on ${
          validFrom.toLocaleDateString("lt-LT")
        }`,
      }, { status: 400 });
    }

    if (now > validTo) {
      return NextResponse.json({
        error: "Subscription expired",
        details: `Subscription expired on ${
          validTo.toLocaleDateString("lt-LT")
        }`,
      }, { status: 400 });
    }

    // Subscriptions can be used multiple times until they expire
    return NextResponse.json({
      success: true,
      message: "Subscription validated successfully",
      data: {
        subscriptionId: subscription.id,
        purchaserName: subscription.purchaser_name,
        purchaserSurname: subscription.purchaser_surname,
        validFrom: subscription.valid_from,
        validTo: subscription.valid_to,
        validatedAt: new Date().toISOString(),
        qrCodeType: "legacy",
      },
    });
  } catch (error) {
    console.error("Error in validateLegacySubscriptionQR:", error);
    throw error;
  }
}
