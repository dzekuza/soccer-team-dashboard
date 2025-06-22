import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

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
    }
  )

  try {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching events:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to fetch events", details: message }, { status: 500 })
  }
}

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
    }
  )
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, pricingTiers } = await request.json();

    if (!event || !pricingTiers) {
        return NextResponse.json({ error: "Missing event or pricingTiers data" }, { status: 400 });
    }

    // 1. Insert the event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      throw eventError;
    }

    // 2. Insert the pricing tiers
    const tiersToInsert = pricingTiers.map((tier: any) => ({
      event_id: eventData.id,
      name: tier.name,
      price: tier.price,
      quantity: tier.quantity
    }));

    const { error: tiersError } = await supabase
      .from('pricing_tiers')
      .insert(tiersToInsert);

    if (tiersError) {
      console.error("Error creating pricing tiers:", tiersError);
      // Attempt to roll back the event creation if tiers fail
      await supabase.from('events').delete().eq('id', eventData.id);
      throw tiersError;
    }

    return NextResponse.json({ success: true, data: { ...eventData, pricingTiers: tiersToInsert} });

  } catch (error) {
    console.error('Error in /api/events POST:', error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to create event", details: message }, { status: 500 })
  }
} 