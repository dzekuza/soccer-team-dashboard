import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. You must be logged in to run this test." }, { status: 401 });
    }

    // Create two test teams
    const { data: team1, error: team1Error } = await supabase
      .from('teams')
      .insert([{ team_name: `Test Team A ${Date.now()}` }])
      .select()
      .single()

    if (team1Error) throw team1Error;

    const { data: team2, error: team2Error } = await supabase
      .from('teams')
      .insert([{ team_name: `Test Team B ${Date.now()}` }])
      .select()
      .single()

    if (team2Error) throw team2Error;

    const testEvent = {
      title: "Test Event",
      description: "Test event description",
      date: new Date().toISOString().split('T')[0],
      time: "19:00:00",
      location: "Test Stadium",
      team1_id: team1.id,
      team2_id: team2.id
    }

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([testEvent])
      .select()
      .single()

    if (eventError) throw eventError;

    const testPricingTiers = [
      { event_id: eventData.id, name: "Standard", price: 20, quantity: 100 },
      { event_id: eventData.id, name: "VIP", price: 50, quantity: 20 }
    ]

    const { data: tiersData, error: tiersError } = await supabase
      .from('pricing_tiers')
      .insert(testPricingTiers)
      .select()

    if (tiersError) {
      // Rollback event creation
      await supabase.from('events').delete().eq('id', eventData.id);
      throw tiersError;
    }

    const result = { ...eventData, pricing_tiers: tiersData }

    return NextResponse.json({ success: true, event: result })
  } catch (error) {
    console.error("Error in test route:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Test failed", details: message }, { status: 500 })
  }
} 