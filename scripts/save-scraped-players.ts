#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { scrapeBangaPlayers } from "./scrape-banga-players";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function saveScrapedPlayers() {
    try {
        console.log("Scraping and saving fresh player data...");

        // Scrape players
        const scrapedPlayers = await scrapeBangaPlayers();

        if (scrapedPlayers.length === 0) {
            console.log("No players found during scraping");
            return;
        }

        console.log(`Found ${scrapedPlayers.length} players to save`);

        // First, delete all existing players
        console.log("Deleting existing players...");
        const { error: deleteError } = await supabase
            .from("banga_playerss")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) {
            console.error("Error deleting existing players:", deleteError);
            return;
        }

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

        console.log("Inserting fresh player data...");
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

        // Show some examples
        if (insertedPlayers && insertedPlayers.length > 0) {
            console.log("\nExample saved players:");
            insertedPlayers.slice(0, 5).forEach((player) => {
                console.log(
                    `- ${player.name} ${
                        player.surname || ""
                    } (${player.team_key}) - #${player.number} - ${player.position}`,
                );
                console.log(
                    `  Matches: ${player.matches}, Goals: ${player.goals}, Assists: ${player.assists}`,
                );
            });
        }
    } catch (error) {
        console.error("Error saving players:", error);
    }
}

if (require.main === module) {
    saveScrapedPlayers().then(() => {
        console.log("Save completed");
        process.exit(0);
    }).catch((error) => {
        console.error("Save failed:", error);
        process.exit(1);
    });
}
