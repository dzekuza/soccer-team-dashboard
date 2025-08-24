import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// BANGA M defenders with correct kit numbers
const bangaMDefenders = [
    { name: "Kamilė Žiliūtė", number: "0", position: "Gynėja" },
    { name: "Ugnė Jonelytė", number: "8", position: "Gynėja" },
    { name: "PUČKUTĖ Vaida", number: "9", position: "Gynėja" },
    { name: "Donata Švarcaitė", number: "12", position: "Gynėja" },
    { name: "Gabija Cemnolonskytė", number: "25", position: "Gynėja" },
    { name: "Austėja Jokubaitytė", number: "31", position: "Gynėja" },
    { name: "BUTKUTĖ Rugilė", number: "44", position: "Gynėja" },
];

async function updateBangaMDefenders() {
    console.log("🔧 Updating BANGA M defenders...");

    try {
        let updatedCount = 0;
        let notFoundCount = 0;

        for (const playerData of bangaMDefenders) {
            console.log(`\n🔍 Looking for: ${playerData.name}`);

            // Try to find the player by exact name in BANGA M team
            const { data: players, error: searchError } = await supabase
                .from("banga_playerss")
                .select("id, name, number, position, team_key")
                .eq("team_key", "BANGA M")
                .eq("name", playerData.name);

            if (searchError) {
                console.error(
                    `❌ Error searching for ${playerData.name}:`,
                    searchError,
                );
                continue;
            }

            if (!players || players.length === 0) {
                console.log(`⚠️  Player not found: ${playerData.name}`);
                notFoundCount++;
                continue;
            }

            // Update the first matching player
            const player = players[0];
            console.log(
                `📋 Found: ${player.name} (Current: #${player.number}, ${player.position})`,
            );

            const { data: updateData, error: updateError } = await supabase
                .from("banga_playerss")
                .update({
                    number: playerData.number,
                    position: playerData.position,
                })
                .eq("id", player.id);

            if (updateError) {
                console.error(
                    `❌ Error updating ${playerData.name}:`,
                    updateError,
                );
            } else {
                console.log(
                    `✅ Updated: ${playerData.name} -> #${playerData.number}, ${playerData.position}`,
                );
                updatedCount++;
            }
        }

        console.log("\n📊 Update Summary:");
        console.log(`  ✅ Successfully updated: ${updatedCount} players`);
        console.log(`  ⚠️  Not found: ${notFoundCount} players`);

        // Verify the updates
        console.log("\n🔍 Verifying updates...");
        const { data: allBangaM, error: verifyError } = await supabase
            .from("banga_playerss")
            .select("name, number, position")
            .eq("team_key", "BANGA M")
            .order("name");

        if (verifyError) {
            console.error("❌ Error verifying updates:", verifyError);
        } else {
            console.log("📋 Current BANGA M players:");
            allBangaM?.forEach((player) => {
                console.log(
                    `  ${player.name} - #${player.number} (${player.position})`,
                );
            });
        }
    } catch (error) {
        console.error("❌ Unexpected error:", error);
    }
}

updateBangaMDefenders();
