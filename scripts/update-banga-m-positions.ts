import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// BANGA M players data with positions and kit numbers - using exact database names
const bangaMPlayers = [
    // Puolėjai (Forwards)
    { name: "GEDMINAITĖ Lijana", number: "10", position: "Puolėja" },
    { name: "Viltė Švarcaitė", number: "12", position: "Puolėja" },

    // Saugai (Defenders)
    { name: "Monika Grikšaitė", number: "9", position: "Saugė" },
    { name: "Smiltė Vaitkevičiūtė", number: "null", position: "Saugė" },
    { name: "NARBUTAITĖ Paulina", number: "15", position: "Saugė" },
    { name: "Estela Tamošauskaitė", number: "13", position: "Saugė" },
    { name: "Atėnė Streckytė", number: "11", position: "Saugė" },
    { name: "Kamilė Pranulytė", number: "10", position: "Saugė" },
    { name: "ŽATKINA Vitalija", number: "26", position: "Saugė" },

    // Vartininkai (Goalkeepers)
    { name: "Karolina Curukova", number: "1", position: "Vartininkė" },

    // Other players (positions not specified)
    { name: "Kamilė Žiliūtė", number: "7", position: "Žaidėja" },
    { name: "Ugnė Jonelytė", number: "5", position: "Žaidėja" },
    { name: "PUČKUTĖ Vaida", number: "9", position: "Žaidėja" },
    { name: "Donata Švarcaitė", number: "6", position: "Žaidėja" },
    { name: "Gabija Cemnolonskytė", number: "2", position: "Žaidėja" },
    { name: "Austėja Jokubaitytė", number: "4", position: "Žaidėja" },
    { name: "BUTKUTĖ Rugilė", number: "44", position: "Žaidėja" },
];

async function updateBangaMPlayers() {
    console.log("🔧 Updating BANGA M players positions and kit numbers...");

    try {
        let updatedCount = 0;
        let notFoundCount = 0;

        for (const playerData of bangaMPlayers) {
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

updateBangaMPlayers();
