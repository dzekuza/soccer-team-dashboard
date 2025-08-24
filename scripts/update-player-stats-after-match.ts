#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { scrapeBangaPlayers } from "./scrape-banga-players";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface MatchResult {
    id: string;
    home_team: string;
    away_team: string;
    home_score: number;
    away_score: number;
    date: string;
    status: "finished" | "scheduled" | "live";
}

export async function updatePlayerStatsAfterMatch(matchId: string) {
    try {
        console.log(`Updating player stats after match: ${matchId}`);

        // Get the match details
        const { data: match, error: matchError } = await supabase
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();

        if (matchError || !match) {
            console.error("Error fetching match:", matchError);
            return;
        }

        // Check if this is a BANGA match
        const isBangaMatch = match.home_team?.toLowerCase().includes("banga") ||
            match.away_team?.toLowerCase().includes("banga");

        if (!isBangaMatch) {
            console.log("Not a BANGA match, skipping player stats update");
            return;
        }

        // Scrape updated player statistics
        console.log("Scraping updated player statistics...");
        const scrapedPlayers = await scrapeBangaPlayers();

        if (scrapedPlayers.length === 0) {
            console.log("No players found during scraping");
            return;
        }

        // Update player statistics in database
        console.log(`Updating ${scrapedPlayers.length} players...`);

        for (const player of scrapedPlayers) {
            // Find existing player by name and team
            const { data: existingPlayer, error: findError } = await supabase
                .from("banga_playerss")
                .select("*")
                .eq("name", player.name)
                .eq("team_key", player.team_key)
                .single();

            if (findError && findError.code !== "PGRST116") {
                console.error(
                    `Error finding player ${player.name}:`,
                    findError,
                );
                continue;
            }

            if (existingPlayer) {
                // Update existing player
                const { error: updateError } = await supabase
                    .from("banga_playerss")
                    .update({
                        number: player.number,
                        surname: player.surname,
                        position: player.position,
                        matches: player.matches,
                        minutes: player.minutes,
                        goals: player.goals,
                        assists: player.assists,
                        yellow_cards: player.yellow_cards,
                        red_cards: player.red_cards,
                        image_url: player.image_url,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existingPlayer.id);

                if (updateError) {
                    console.error(
                        `Error updating player ${player.name}:`,
                        updateError,
                    );
                } else {
                    console.log(
                        `Updated player: ${player.name} ${
                            player.surname || ""
                        }`,
                    );
                }
            } else {
                // Insert new player
                const { error: insertError } = await supabase
                    .from("banga_playerss")
                    .insert({
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
                        image_url: player.image_url,
                        inserted_at: new Date().toISOString(),
                    });

                if (insertError) {
                    console.error(
                        `Error inserting player ${player.name}:`,
                        insertError,
                    );
                } else {
                    console.log(
                        `Inserted new player: ${player.name} ${
                            player.surname || ""
                        }`,
                    );
                }
            }
        }

        // Mark match as processed for player stats
        const { error: updateMatchError } = await supabase
            .from("matches")
            .update({
                player_stats_updated: true,
                player_stats_updated_at: new Date().toISOString(),
            })
            .eq("id", matchId);

        if (updateMatchError) {
            console.error("Error updating match status:", updateMatchError);
        }

        console.log("Player statistics update completed successfully");
    } catch (error) {
        console.error("Error in updatePlayerStatsAfterMatch:", error);
    }
}

// Function to update stats for all recent matches
export async function updatePlayerStatsForRecentMatches() {
    try {
        console.log("Updating player stats for recent matches...");

        // Get recent finished matches that haven't been processed for player stats
        const { data: matches, error: matchesError } = await supabase
            .from("matches")
            .select("*")
            .eq("status", "finished")
            .is("player_stats_updated", null)
            .order("date", { ascending: false })
            .limit(10);

        if (matchesError) {
            console.error("Error fetching matches:", matchesError);
            return;
        }

        if (!matches || matches.length === 0) {
            console.log("No recent matches to process");
            return;
        }

        console.log(`Found ${matches.length} matches to process`);

        for (const match of matches) {
            await updatePlayerStatsAfterMatch(match.id);
            // Add delay between processing matches
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        console.log("Completed updating player stats for recent matches");
    } catch (error) {
        console.error("Error in updatePlayerStatsForRecentMatches:", error);
    }
}

// Function to update stats for a specific date range
export async function updatePlayerStatsForDateRange(
    startDate: string,
    endDate: string,
) {
    try {
        console.log(
            `Updating player stats for date range: ${startDate} to ${endDate}`,
        );

        const { data: matches, error: matchesError } = await supabase
            .from("matches")
            .select("*")
            .eq("status", "finished")
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: false });

        if (matchesError) {
            console.error("Error fetching matches:", matchesError);
            return;
        }

        if (!matches || matches.length === 0) {
            console.log("No matches found in date range");
            return;
        }

        console.log(`Found ${matches.length} matches to process`);

        for (const match of matches) {
            await updatePlayerStatsAfterMatch(match.id);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        console.log("Completed updating player stats for date range");
    } catch (error) {
        console.error("Error in updatePlayerStatsForDateRange:", error);
    }
}

if (require.main === module) {
    // If run directly, update stats for recent matches
    updatePlayerStatsForRecentMatches().then(() => {
        console.log("Script completed");
        process.exit(0);
    }).catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });
}
