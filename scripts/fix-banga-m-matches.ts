import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getPublicUrl(fileName: string) {
    try {
        const { data } = supabase.storage
            .from("Teamplayers M")
            .getPublicUrl(fileName);

        return data.publicUrl;
    } catch (error) {
        console.error(`Error getting public URL for ${fileName}:`, error);
        return null;
    }
}

async function updatePlayerImage(playerId: string, imageUrl: string) {
    try {
        const { error } = await supabase
            .from("banga_playerss")
            .update({ image_url: imageUrl })
            .eq("id", playerId);

        if (error) {
            console.error(`Error updating player ${playerId}:`, error);
            return false;
        }

        console.log(`Updated player ${playerId} with image: ${imageUrl}`);
        return true;
    } catch (error) {
        console.error(`Error updating player ${playerId}:`, error);
        return false;
    }
}

async function getPlayerByName(name: string) {
    try {
        const { data, error } = await supabase
            .from("banga_playerss")
            .select("id, name, team_key")
            .eq("name", name)
            .eq("team_key", "BANGA M")
            .single();

        if (error) {
            console.error(`Error fetching player ${name}:`, error);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error fetching player ${name}:`, error);
        return null;
    }
}

async function main() {
    console.log("Fixing BANGA M player matches...");

    // Manual corrections for BANGA M players
    const corrections = [
        {
            playerName: "Kamilė Žiliūtė",
            correctImage: "zilute Kamile 1.png",
        },
        {
            playerName: "Estela Tamošauskaitė",
            correctImage: "Bernotaite Auste 1.png", // This might need verification
        },
        {
            playerName: "Smiltė Vaitkevičiūtė",
            correctImage: "Galdikaite Karina 1.png", // This might need verification
        },
        {
            playerName: "Ugnė Jonelytė",
            correctImage: "Gaudutyte Vanesa 1.png", // This might need verification
        },
    ];

    for (const correction of corrections) {
        const player = await getPlayerByName(correction.playerName);
        if (player) {
            const publicUrl = await getPublicUrl(correction.correctImage);
            if (publicUrl) {
                const success = await updatePlayerImage(player.id, publicUrl);
                if (success) {
                    console.log(
                        `✓ Fixed: ${correction.playerName} -> ${correction.correctImage}`,
                    );
                }
            }
        } else {
            console.log(`✗ Player not found: ${correction.playerName}`);
        }
    }

    console.log("\nBANGA M manual corrections complete!");
}

main().catch(console.error);
