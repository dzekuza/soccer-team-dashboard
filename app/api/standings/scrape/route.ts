import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { LFFScraper, ScrapedData } from "@/lib/lff-scraper";

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
        console.log("Starting standings scrape...");

        // Scrape all leagues
        const allStandings = await LFFScraper.scrapeAllLeagues();

        // Store in database
        for (const leagueData of allStandings) {
            const leagueKey = getLeagueKey(leagueData.league);

            const { error } = await supabase
                .from("standings")
                .upsert({
                    league_key: leagueKey,
                    league_name: leagueData.league,
                    standings_data: leagueData.standings,
                    last_updated: new Date().toISOString(),
                }, {
                    onConflict: "league_key",
                });

            if (error) {
                console.error(
                    `Error storing ${leagueData.league} standings:`,
                    error,
                );
            } else {
                console.log(
                    `Successfully stored ${leagueData.league} standings`,
                );
            }
        }

        return NextResponse.json({
            success: true,
            data: allStandings,
            message: `Scraped ${allStandings.length} leagues successfully`,
        });
    } catch (error) {
        console.error("Error in standings scrape:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
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
        const { searchParams } = new URL(request.url);
        const league = searchParams.get("league");

        let query = supabase.from("standings").select("*");

        if (league) {
            query = query.eq("league_key", league);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error fetching standings:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

function getLeagueKey(leagueName: string): string {
    switch (leagueName) {
        case "Banga A":
            return "a_lyga";
        case "Banga B":
            return "ii_lyga_a";
        case "Banga M":
            return "moteru_a_lyga";
        default:
            return leagueName.toLowerCase().replace(/\s+/g, "_");
    }
}
