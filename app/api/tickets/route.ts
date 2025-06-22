export const dynamic = 'force-dynamic'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"
import { notificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, tierId, purchaserName, purchaserEmail } =
      await request.json()

    if (!eventId || !tierId || !purchaserName || !purchaserEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    const tier = await supabaseService.getPricingTier(tierId)
    if (!tier || tier.quantity <= tier.soldQuantity) {
      return NextResponse.json(
        { error: "Tier sold out or not available" },
        { status: 400 },
      )
    }

    const newTicket = await supabaseService.createTicket({
      eventId,
      tierId,
      purchaserName,
      purchaserEmail,
      userId: user.id,
    })

    notificationService.sendTicketConfirmation(newTicket.id)

    return NextResponse.json(newTicket)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error"
    console.error("Error creating ticket:", message)
    return NextResponse.json(
      { error: "Failed to create ticket", details: message },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    const { data, error } = await supabaseService.getTicketsWithDetails();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch tickets", details: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ticket_id } = await request.json()

    if (!ticket_id) {
      return NextResponse.json({ error: "Missing ticket_id" }, { status: 400 })
    }

    const ticket = await supabaseService.getTicketWithDetails(ticket_id)
    if (!ticket || !ticket.purchaserEmail) {
      return NextResponse.json(
        { error: "Ticket not found or missing email" },
        { status: 404 },
      )
    }

    notificationService.sendTicketConfirmation(ticket_id)

    return NextResponse.json({ message: "Ticket email resent successfully." })
  } catch (error: any) {
    console.error("Error resending ticket:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}
