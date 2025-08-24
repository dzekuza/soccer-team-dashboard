import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// BANGA M players with correct kit numbers as specified
const bangaMKitNumbers = [
    // Players with specific kit numbers
    { name: "Kamilė Žiliūtė", number: "0" },
    { name: "Ugnė Jonelytė", number: "8" },
    { name: "PUČKUTĖ Vaida", number: "9" },
    { name: "Donata Švarcaitė", number: "12" },
    { name: "Gabija Cemnolonskytė", number: "25" },
    { name: "Austėja Jokubaitytė", number: "31" },
    { name: "BUTKUTĖ Rugilė", number: "44" },

    // Puolėjai (Forwards)
    { name: "GEDMINAITĖ Lijana", number: "10" },
    { name: "Viltė Švarcaitė", number: "19" },

    // Saugai (Defenders)
    { name: "Monika Grikšaitė", number: "11" },
    { name: "Smiltė Vaitkevičiūtė", number: "14" },
    { name: "NARBUTAITĖ Paulina", number: "15" },
    { name: "Estela Tamošauskaitė", number: "17" },
    { name: "Atėnė Streckytė", number: "18" },
    { name: "Kamilė Pranulytė", number: "23" },
    { name: "ŽATKINA Vitalija", number: "26" },

    // Vartininkai (Goalkeepers)
    { name: "Karolina Curukova", number: "29" },
];

async function updateBangaMKitNumbers() {
    console.log("🔧 Updating BANGA M players kit numbers...");

    try {
        let updatedCount = 0;
        let notFoundCount = 0;

        for (const playerData of bangaMKitNumbers) {
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
                })
                .eq("id", player.id);

            if (updateError) {
                console.error(
                    `❌ Error updating ${playerData.name}:`,
                    updateError,
                );
            } else {
                console.log(
                    `✅ Updated: ${playerData.name} -> #${playerData.number}`,
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

updateBangaMKitNumbers();
