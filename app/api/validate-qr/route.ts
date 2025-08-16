import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    }
  );

  try {
    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json({ error: "QR data is required" }, { status: 400 });
    }

    // Parse the QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return NextResponse.json({ error: "Invalid QR code data format" }, { status: 400 });
    }

    // Validate the data structure
    if (!parsedData.type || !parsedData.timestamp) {
      return NextResponse.json({ error: "Invalid QR code data structure" }, { status: 400 });
    }

    // Check if QR code is not too old (e.g., within 24 hours)
    const qrTimestamp = new Date(parsedData.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - qrTimestamp.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return NextResponse.json({ 
        error: "QR code is too old", 
        details: "QR code was generated more than 24 hours ago" 
      }, { status: 400 });
    }

    if (parsedData.type === 'ticket') {
      return await validateTicketQR(parsedData, supabase);
    } else if (parsedData.type === 'subscription') {
      return await validateSubscriptionQR(parsedData, supabase);
    } else {
      return NextResponse.json({ error: "Unknown QR code type" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error validating QR code:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: "Failed to validate QR code", details: message }, { status: 500 });
  }
}

async function validateTicketQR(qrData: any, supabase: any) {
  try {
    // Check if ticket exists and is not already validated
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events (*),
        pricing_tier:pricing_tiers (*)
      `)
      .eq('id', qrData.ticketId)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ 
        error: "Ticket not found", 
        details: "The ticket ID in the QR code does not exist" 
      }, { status: 404 });
    }

    if (ticket.is_validated) {
      return NextResponse.json({ 
        error: "Ticket already used", 
        details: "This ticket has already been validated and used" 
      }, { status: 400 });
    }

    // Validate event date (ticket should be for today or future)
    const eventDate = new Date(ticket.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return NextResponse.json({ 
        error: "Event has passed", 
        details: "This ticket is for an event that has already occurred" 
      }, { status: 400 });
    }

    // Mark ticket as validated
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        is_validated: true, 
        validated_at: new Date().toISOString() 
      })
      .eq('id', qrData.ticketId);

    if (updateError) {
      console.error("Error updating ticket validation status:", updateError);
      return NextResponse.json({ 
        error: "Failed to validate ticket", 
        details: "Could not update ticket status" 
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
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in validateTicketQR:", error);
    throw error;
  }
}

async function validateSubscriptionQR(qrData: any, supabase: any) {
  try {
    // Check if subscription exists and is valid
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', qrData.subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ 
        error: "Subscription not found", 
        details: "The subscription ID in the QR code does not exist" 
      }, { status: 404 });
    }

    // Check if subscription is still valid
    const now = new Date();
    const validFrom = new Date(subscription.valid_from);
    const validTo = new Date(subscription.valid_to);

    if (now < validFrom) {
      return NextResponse.json({ 
        error: "Subscription not yet active", 
        details: `Subscription becomes active on ${validFrom.toLocaleDateString('lt-LT')}` 
      }, { status: 400 });
    }

    if (now > validTo) {
      return NextResponse.json({ 
        error: "Subscription expired", 
        details: `Subscription expired on ${validTo.toLocaleDateString('lt-LT')}` 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription validated successfully",
      data: {
        subscriptionId: subscription.id,
        purchaserName: subscription.purchaser_name,
        purchaserSurname: subscription.purchaser_surname,
        validFrom: subscription.valid_from,
        validTo: subscription.valid_to,
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in validateSubscriptionQR:", error);
    throw error;
  }
}
