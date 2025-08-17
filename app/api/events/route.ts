import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    // Fetch events with team information
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (eventsError) {
      throw eventsError;
    }

    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*");

    if (teamsError) {
      throw teamsError;
    }

    // Combine events with team data and map field names
    const eventsWithTeams = events.map((event) => {
      const team1 = teams.find((team) => team.id === event.team1_id) || null;
      const team2 = teams.find((team) => team.id === event.team2_id) || null;

      return {
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          team1Id: event.team1_id,
          team2Id: event.team2_id,
          coverImageUrl: event.cover_image_url,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
        },
        team1,
        team2,
      };
    });

    return NextResponse.json(eventsWithTeams);
  } catch (error) {
    console.error("Error fetching events:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to fetch events",
      details: message,
    }, { status: 500 });
  }
}

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, pricingTiers } = await request.json();

    if (!event || !pricingTiers) {
      return NextResponse.json(
        { error: "Missing event or pricingTiers data" },
        { status: 400 },
      );
    }

    // Call the RPC function to create the event and tiers atomically
    const { data, error } = await supabase.rpc("create_event_with_tiers", {
      event_data: event,
      tiers_data: pricingTiers,
    });

    if (error) {
      console.error("Error creating event with tiers:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in /api/events POST:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to create event",
      details: message,
    }, { status: 500 });
  }
}
