import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listStorageFiles() {
    try {
        console.log("Listing files in Teamplayers bucket...");

        const { data, error } = await supabase.storage
            .from("Teamplayers")
            .list("", {
                limit: 100,
                offset: 0,
                sortBy: { column: "name", order: "asc" },
            });

        if (error) {
            console.error("Error listing files:", error);
            return;
        }

        console.log("Files found:", data.length);
        data.forEach((file) => {
            console.log(`- ${file.name} (${file.metadata?.size} bytes)`);
        });

        return data;
    } catch (error) {
        console.error("Error accessing storage:", error);
    }
}

async function getPublicUrl(fileName: string) {
    try {
        const { data } = supabase.storage
            .from("Teamplayers")
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

async function getCurrentPlayers() {
    try {
        const { data, error } = await supabase
            .from("banga_playerss")
            .select("id, name, team_key")
            .eq("team_key", "BANGA A")
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching players:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error fetching players:", error);
        return [];
    }
}

async function main() {
    console.log("Starting player image update process...");

    // List all files in the bucket
    const files = await listStorageFiles();
    if (!files || files.length === 0) {
        console.log("No files found in bucket");
        return;
    }

    // Get current BANGA A players
    const players = await getCurrentPlayers();
    console.log(`Found ${players.length} BANGA A players`);

    // Create a mapping of player names to files
    const playerFileMap = new Map<string, string>();

    files.forEach((file) => {
        const fileName = file.name.toLowerCase();
        // Remove file extension for matching
        const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, "");
        playerFileMap.set(nameWithoutExt, file.name);
    });

    console.log("\nPlayer file mapping:");
    playerFileMap.forEach((fileName, playerName) => {
        console.log(`${playerName} -> ${fileName}`);
    });

    // Update player images
    let updatedCount = 0;
    for (const player of players) {
        const playerName = player.name.toLowerCase();

        // Try to find a matching file
        let matchedFile = playerFileMap.get(playerName);

        // If no exact match, try partial matches
        if (!matchedFile) {
            for (const [filePlayerName, fileName] of playerFileMap) {
                if (
                    playerName.includes(filePlayerName) ||
                    filePlayerName.includes(playerName)
                ) {
                    matchedFile = fileName;
                    break;
                }
            }
        }

        if (matchedFile) {
            const publicUrl = await getPublicUrl(matchedFile);
            if (publicUrl) {
                const success = await updatePlayerImage(player.id, publicUrl);
                if (success) {
                    updatedCount++;
                }
            }
        } else {
            console.log(`No matching file found for player: ${player.name}`);
        }
    }

    console.log(
        `\nUpdate complete! Updated ${updatedCount} out of ${players.length} players`,
    );
}

main().catch(console.error);
