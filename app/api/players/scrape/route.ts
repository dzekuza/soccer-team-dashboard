import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  scrapeBangaPlayers,
  scrapeBangaPlayersFromTeamPages,
} from "@/scripts/scrape-banga-players";

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

    // Start scraping
    console.log("Starting BANGA players scraping...");

    // Try both scraping methods
    let scrapedPlayers = await scrapeBangaPlayers();

    // If first method didn't find players, try the alternative
    if (scrapedPlayers.length === 0) {
      console.log(
        "First method didn't find players, trying alternative method...",
      );
      scrapedPlayers = await scrapeBangaPlayersFromTeamPages();
    }

    if (scrapedPlayers.length === 0) {
      return NextResponse.json({
        error: "No players found during scraping",
        scrapedCount: 0,
      }, { status: 404 });
    }

    console.log(`Found ${scrapedPlayers.length} players during scraping`);

    // Prepare players for database insertion
    const playersToInsert = scrapedPlayers.map((player) => ({
      name: player.name,
      surname: player.surname,
      number: player.number,
      position: player.position,
      matches: player.matches,
      minutes: player.minutes,
      goals: player.goals,
      assists: player.assists,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards,
      team_key: player.team_key,
      profile_url: player.profile_url,
      image_url: player.image_url,
      inserted_at: new Date().toISOString(),
    }));

    // Insert players into database
    const { data: insertedPlayers, error: insertError } = await supabase
      .from("banga_playerss")
      .upsert(playersToInsert, {
        onConflict: "name,team_key",
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error("Error inserting players:", insertError);
      throw insertError;
    }

    console.log(
      `Successfully inserted/updated ${insertedPlayers?.length || 0} players`,
    );

    return NextResponse.json({
      success: true,
      scrapedCount: scrapedPlayers.length,
      insertedCount: insertedPlayers?.length || 0,
      players: insertedPlayers,
    });
  } catch (error) {
    console.error("Error in /api/players/scrape:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to scrape players", details: message },
      { status: 500 },
    );
  }
}
