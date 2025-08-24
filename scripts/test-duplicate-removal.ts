#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDuplicateRemoval() {
    try {
        console.log("Testing duplicate removal logic...");

        // First, get the count of records before cleaning
        const { count: beforeCount } = await supabase
            .from("banga_playerss")
            .select("*", { count: "exact", head: true });

        console.log(`Before: ${beforeCount} records`);

        // Get all players ordered by inserted_at (most recent first)
        const { data: allPlayers, error: selectError } = await supabase
            .from("banga_playerss")
            .select("*")
            .order("inserted_at", { ascending: false });

        if (selectError) {
            console.error("Error selecting players:", selectError);
            return;
        }

        console.log(`Retrieved ${allPlayers?.length || 0} records`);

        // Group by name and team_key, keeping only the most recent
        const seen = new Set();
        const uniqueRecords = allPlayers?.filter((player) => {
            const key = `${player.name}-${player.team_key}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        }) || [];

        console.log(
            `After deduplication: ${uniqueRecords.length} unique records`,
        );
        console.log(
            `Would remove ${
                (allPlayers?.length || 0) - uniqueRecords.length
            } duplicate records`,
        );

        // Show some examples of duplicates
        const duplicates = allPlayers?.filter((player) => {
            const key = `${player.name}-${player.team_key}`;
            const count = allPlayers.filter((p) =>
                `${p.name}-${p.team_key}` === key
            ).length;
            return count > 1;
        }).slice(0, 5) || [];

        if (duplicates.length > 0) {
            console.log("\nExample duplicates:");
            duplicates.forEach((player) => {
                console.log(
                    `- ${player.name} (${player.team_key}) - inserted: ${player.inserted_at}`,
                );
            });
        }

        // Show some unique records
        if (uniqueRecords.length > 0) {
            console.log("\nExample unique records:");
            uniqueRecords.slice(0, 5).forEach((player) => {
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
        console.error("Test failed:", error);
    }
}

if (require.main === module) {
    testDuplicateRemoval().then(() => {
        console.log("Test completed");
        process.exit(0);
    }).catch((error) => {
        console.error("Test failed:", error);
        process.exit(1);
    });
}
