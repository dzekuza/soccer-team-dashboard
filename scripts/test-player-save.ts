#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { scrapeBangaPlayers } from "./scrape-banga-players";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPlayerSave() {
    try {
        console.log("Testing player data save to database...");

        // Scrape players
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
            .upsert(playersToInsert, {
                onConflict: "name,team_key",
                ignoreDuplicates: false,
            })
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
        console.error("Test failed:", error);
    }
}

if (require.main === module) {
    testPlayerSave().then(() => {
        console.log("Test completed");
        process.exit(0);
    }).catch((error) => {
        console.error("Test failed:", error);
        process.exit(1);
    });
}
