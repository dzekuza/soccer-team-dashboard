#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { scrapeBangaPlayers } from "./scrape-banga-players";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAndScrapePlayers() {
    try {
        console.log("Cleaning database and scraping fresh player data...");

        // First, delete all existing players
        console.log("Deleting all existing players...");
        const { error: deleteError } = await supabase
            .from("banga_playerss")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except dummy ID

        if (deleteError) {
            console.error("Error deleting players:", deleteError);
            return;
        }

        console.log("Database cleaned successfully");

        // Now scrape fresh data
        console.log("Scraping fresh player data...");
        const scrapedPlayers = await scrapeBangaPlayers();

        if (scrapedPlayers.length === 0) {
            console.log("No players found during scraping");
            return;
        }

        console.log(`Found ${scrapedPlayers.length} players to save`);

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
            image_url: player.image_url,
            inserted_at: new Date().toISOString(),
        }));

        // Insert players into database
        const { data: insertedPlayers, error: insertError } = await supabase
            .from("banga_playerss")
            .insert(playersToInsert)
            .select();

        if (insertError) {
            console.error("Error inserting players:", insertError);
            return;
        }

        console.log(
            `Successfully saved ${
                insertedPlayers?.length || 0
            } players to database`,
        );

        // Verify data was saved by fetching it back
        const { data: fetchedPlayers, error: fetchError } = await supabase
            .from("banga_playerss")
            .select("*")
            .order("name", { ascending: true });

        if (fetchError) {
            console.error("Error fetching players:", fetchError);
            return;
        }

        console.log(
            `Database now contains ${fetchedPlayers?.length || 0} players`,
        );

        // Show a few sample players
        if (fetchedPlayers && fetchedPlayers.length > 0) {
            console.log("\nSample players from database:");
            fetchedPlayers.slice(0, 5).forEach((player, index) => {
                console.log(
                    `${index + 1}. ${player.name} ${
                        player.surname || ""
                    } (${player.team_key}) - #${player.number} - ${player.position}`,
                );
                console.log(
                    `   Matches: ${player.matches}, Goals: ${player.goals}, Assists: ${player.assists}`,
                );
            });
        }
    } catch (error) {
        console.error("Script failed:", error);
    }
}

if (require.main === module) {
    cleanAndScrapePlayers().then(() => {
        console.log("Script completed");
        process.exit(0);
    }).catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });
}
