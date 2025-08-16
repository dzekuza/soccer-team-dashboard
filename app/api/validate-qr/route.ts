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

    // QR code now contains only the ID (ticket ID or subscription ID)
    const id = qrData.trim();

    if (!id) {
      return NextResponse.json({ error: "Invalid QR code data" }, { status: 400 });
    }

    // Try to validate as ticket first
    const ticketResult = await validateTicketQR({ ticketId: id }, supabase);
    if (ticketResult.status !== 404) {
      return ticketResult;
    }

    // If not a ticket, try as subscription
    const subscriptionResult = await validateSubscriptionQR({ subscriptionId: id }, supabase);
    if (subscriptionResult.status !== 404) {
      return subscriptionResult;
    }

    // If neither found, return error
    return NextResponse.json({ 
      error: "Invalid QR code", 
      details: "The scanned QR code does not correspond to any valid ticket or subscription" 
    }, { status: 404 });

  } catch (error) {
    console.error("Error validating QR code:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: "Failed to validate QR code", details: message }, { status: 500 });
  }
}

async function validateTicketQR(qrData: any, supabase: any) {
  try {
    console.log(`🔍 Validating ticket: ${qrData.ticketId}`);
    
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
      console.log(`❌ Ticket not found: ${qrData.ticketId}`);
      return NextResponse.json({ 
        error: "Ticket not found", 
        details: "The ticket ID in the QR code does not exist" 
      }, { status: 404 });
    }

    console.log(`📋 Ticket found: ${ticket.id}, validated: ${ticket.is_validated}`);

    if (ticket.is_validated) {
      console.log(`❌ Ticket already validated: ${ticket.id}`);
      return NextResponse.json({ 
        error: "This ticket already scanned", 
        details: "This ticket has already been validated and used. Each ticket can only be used once." 
      }, { status: 400 });
    }

    console.log(`✅ Ticket is valid for validation: ${ticket.id}`);

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
    console.log(`🔄 Marking ticket as validated: ${qrData.ticketId}`);
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

    console.log(`✅ Ticket marked as validated: ${qrData.ticketId}`);

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
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in validateSubscriptionQR:", error);
    throw error;
  }
}
