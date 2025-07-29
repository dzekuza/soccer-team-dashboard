import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
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
  )
  try {
    // First, verify there is an authenticated user.
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Since corporation_id does not exist, we will compute global stats.
    const { count: totalEvents, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    const { count: totalTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    const { count: validatedTickets, error: validatedError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'validated')

    const { data: ticketsData, error: revenueError } = await supabase
        .from('tickets')
        .select('pricing_tiers!inner(price)')

    if (eventsError || ticketsError || validatedError || revenueError) {
        // Log the specific error for debugging
        console.error({ eventsError, ticketsError, validatedError, revenueError });
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const totalRevenue = ticketsData?.reduce((acc: number, ticket: any) => {
        return acc + (ticket.pricing_tiers?.price || 0);
    }, 0) || 0;


    const stats = {
      totalEvents: totalEvents || 0,
      totalTickets: totalTickets || 0,
      validatedTickets: validatedTickets || 0,
      totalRevenue: totalRevenue || 0,
    }

    return NextResponse.json(stats);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: "Failed to fetch stats", details: errorMessage }, { status: 500 })
  }
}
