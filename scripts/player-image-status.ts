import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getPlayerStatus() {
    try {
        console.log("Checking player image status...\n");

        // Get all players with their image status
        const { data: allPlayers, error } = await supabase
            .from("banga_playerss")
            .select("id, name, team_key, image_url")
            .order("team_key", { ascending: true })
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching players:", error);
            return;
        }

        if (!allPlayers) {
            console.log("No players found");
            return;
        }

        // Group players by team
        const playersByTeam = allPlayers.reduce((acc, player) => {
            if (!acc[player.team_key]) {
                acc[player.team_key] = [];
            }
            acc[player.team_key].push(player);
            return acc;
        }, {} as Record<string, typeof allPlayers>);

        // Display status for each team
        for (const [teamKey, players] of Object.entries(playersByTeam)) {
            console.log(`=== ${teamKey} ===`);

            const withImages = players.filter((p) =>
                p.image_url && !p.image_url.includes("placeholder")
            );
            const withoutImages = players.filter((p) =>
                !p.image_url || p.image_url.includes("placeholder")
            );

            console.log(`Total players: ${players.length}`);
            console.log(`With images: ${withImages.length}`);
            console.log(`Without images: ${withoutImages.length}`);
            console.log(
                `Coverage: ${
                    Math.round((withImages.length / players.length) * 100)
                }%`,
            );

            if (withoutImages.length > 0) {
                console.log("\nPlayers without images:");
                withoutImages.forEach((player) => {
                    console.log(`  - ${player.name}`);
                });
            }

            console.log("\nPlayers with images:");
            withImages.forEach((player) => {
                const isSupabaseImage = player.image_url?.includes(
                    "supabase.co",
                );
                const source = isSupabaseImage
                    ? "Supabase Storage"
                    : "External URL";
                console.log(`  ✓ ${player.name} (${source})`);
            });

            console.log("\n");
        }

        // Overall statistics
        const totalPlayers = allPlayers.length;
        const totalWithImages = allPlayers.filter((p) =>
            p.image_url && !p.image_url.includes("placeholder")
        ).length;
        const totalWithoutImages = totalPlayers - totalWithImages;

        console.log("=== OVERALL SUMMARY ===");
        console.log(`Total players: ${totalPlayers}`);
        console.log(`With images: ${totalWithImages}`);
        console.log(`Without images: ${totalWithoutImages}`);
        console.log(
            `Overall coverage: ${
                Math.round((totalWithImages / totalPlayers) * 100)
            }%`,
        );
    } catch (error) {
        console.error("Error checking player status:", error);
    }
}

getPlayerStatus().catch(console.error);
