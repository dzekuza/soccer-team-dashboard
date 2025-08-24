import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPlayerSchema() {
    try {
        console.log("Checking player table schema...");

        // Get a sample of players to see the structure
        const { data, error } = await supabase
            .from("banga_playerss")
            .select("*")
            .limit(1);

        if (error) {
            console.error("Error fetching players:", error);
            return;
        }

        if (data && data.length > 0) {
            console.log("Player table columns:");
            Object.keys(data[0]).forEach((key) => {
                console.log(`- ${key}: ${typeof data[0][key]}`);
            });

            console.log("\nSample player data:");
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("No players found in table");
        }

        // Also get BANGA A players specifically
        const { data: bangaAPlayers, error: bangaError } = await supabase
            .from("banga_playerss")
            .select("*")
            .eq("team_key", "BANGA A")
            .limit(5);

        if (bangaError) {
            console.error("Error fetching BANGA A players:", bangaError);
        } else {
            console.log(
                `\nFound ${bangaAPlayers?.length || 0} BANGA A players`,
            );
            if (bangaAPlayers && bangaAPlayers.length > 0) {
                console.log("Sample BANGA A player:");
                console.log(JSON.stringify(bangaAPlayers[0], null, 2));
            }
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkPlayerSchema().catch(console.error);
