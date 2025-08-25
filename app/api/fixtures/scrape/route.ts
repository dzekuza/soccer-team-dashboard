import { NextRequest, NextResponse } from "next/server";
import { LFFScraper } from "@/lib/lff-scraper";
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
    },
  );

  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting fixtures scraping with statistics...");

    // Scrape all fixtures with statistics
    const scrapedFixtures = await LFFScraper.scrapeAllFixturesWithStatistics();

    if (scrapedFixtures.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No fixtures found",
      });
    }

    // Store fixtures in database
    const fixturesToInsert = scrapedFixtures.flatMap((leagueData) =>
      leagueData.fixtures.map((fixture) => ({
        fingerprint: fixture.id,
        match_date: fixture.date,
        match_time: fixture.time,
        team1: fixture.home_team.name,
        team2: fixture.away_team.name,
        team1_score: fixture.home_score,
        team2_score: fixture.away_score,
        team1_logo: fixture.home_team.logo,
        team2_logo: fixture.away_team.logo,
        venue: fixture.stadium,
        league_key: fixture.league,
        status: fixture.status,
        round: fixture.round,
        lff_url_slug: fixture.match_url || "",
        statistics: fixture.statistics
          ? JSON.stringify(fixture.statistics)
          : null,
        events: fixture.events ? JSON.stringify(fixture.events) : null,
        owner_id: user.id,
        is_draft: true, // Mark as draft so it appears in drafts tab
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    );

    // Insert fixtures into database with proper duplicate handling
    const { data: insertedFixtures, error: insertError } = await supabase
      .from("fixtures_all_new")
      .upsert(fixturesToInsert, {
        onConflict: "fingerprint",
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error("Error inserting fixtures:", insertError);
      return NextResponse.json({
        success: false,
        error: "Failed to save fixtures to database",
      }, { status: 500 });
    }

    console.log(
      `Successfully scraped and saved ${fixturesToInsert.length} fixtures`,
    );

    return NextResponse.json({
      success: true,
      data: scrapedFixtures,
      message: `Successfully scraped ${fixturesToInsert.length} fixtures`,
    });
  } catch (error) {
    console.error("Error in fixtures scraping:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to scrape fixtures",
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
    // Get league filter from query params
    const { searchParams } = new URL(request.url);
    const league = searchParams.get("league");

    // Fetch fixtures from database
    let query = supabase
      .from("fixtures_all_new")
      .select("*")
      .order("match_date", { ascending: true });

    if (league) {
      query = query.eq("league_key", league);
    }

    const { data: fixtures, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: fixtures,
    });
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch fixtures",
    }, { status: 500 });
  }
}
