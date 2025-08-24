import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
    updatePlayerStatsAfterMatch,
    updatePlayerStatsForRecentMatches,
} from "@/scripts/update-player-stats-after-match";

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
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        const body = await request.json();
        const { matchId, updateRecent } = body;

        if (matchId) {
            // Update stats for a specific match
            await updatePlayerStatsAfterMatch(matchId);
            return NextResponse.json({
                success: true,
                message: `Player stats updated for match ${matchId}`,
            });
        } else if (updateRecent) {
            // Update stats for recent matches
            await updatePlayerStatsForRecentMatches();
            return NextResponse.json({
                success: true,
                message: "Player stats updated for recent matches",
            });
        } else {
            return NextResponse.json({
                error: "Either matchId or updateRecent must be provided",
            }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in /api/players/update-stats:", error);
        const message = error instanceof Error
            ? error.message
            : "Unknown error";
        return NextResponse.json(
            { error: "Failed to update player stats", details: message },
            { status: 500 },
        );
    }
}
