import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listStorageFiles() {
    try {
        console.log("Listing files in Teamplayers M bucket...");

        const { data, error } = await supabase.storage
            .from("Teamplayers M")
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

async function getCurrentPlayers() {
    try {
        const { data, error } = await supabase
            .from("banga_playerss")
            .select("id, name, team_key")
            .eq("team_key", "BANGA M")
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

function normalizeName(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9\s]/g, "") // Remove special characters
        .replace(/\s+/g, " ") // Normalize spaces
        .trim();
}

function findBestMatch(playerName: string, fileNames: string[]): string | null {
    const normalizedPlayerName = normalizeName(playerName);

    // First, try exact match
    for (const fileName of fileNames) {
        const normalizedFileName = normalizeName(
            fileName.replace(/\.(png|jpg|jpeg|webp)$/i, ""),
        );
        if (normalizedPlayerName === normalizedFileName) {
            return fileName;
        }
    }

    // Try partial matches
    for (const fileName of fileNames) {
        const normalizedFileName = normalizeName(
            fileName.replace(/\.(png|jpg|jpeg|webp)$/i, ""),
        );

        // Check if player name contains file name or vice versa
        if (
            normalizedPlayerName.includes(normalizedFileName) ||
            normalizedFileName.includes(normalizedPlayerName)
        ) {
            return fileName;
        }

        // Check for word-by-word matching
        const playerWords = normalizedPlayerName.split(" ");
        const fileWords = normalizedFileName.split(" ");

        const matchingWords = playerWords.filter((word) =>
            fileWords.some((fileWord) =>
                fileWord.includes(word) || word.includes(fileWord)
            )
        );

        if (
            matchingWords.length >=
                Math.min(playerWords.length, fileWords.length) * 0.7
        ) {
            return fileName;
        }
    }

    return null;
}

async function main() {
    console.log("Starting BANGA M player image update process...");

    // List all files in the bucket
    const files = await listStorageFiles();
    if (!files || files.length === 0) {
        console.log("No files found in bucket");
        return;
    }

    const fileNames = files.map((f) => f.name);
    console.log("Available files:", fileNames);

    // Get current BANGA M players
    const players = await getCurrentPlayers();
    console.log(`Found ${players.length} BANGA M players`);

    // Update player images
    let updatedCount = 0;
    const manualMatches: { player: string; suggestedFile: string }[] = [];

    for (const player of players) {
        const matchedFile = findBestMatch(player.name, fileNames);

        if (matchedFile) {
            const publicUrl = await getPublicUrl(matchedFile);
            if (publicUrl) {
                const success = await updatePlayerImage(player.id, publicUrl);
                if (success) {
                    updatedCount++;
                    console.log(`✓ Matched: ${player.name} -> ${matchedFile}`);
                }
            }
        } else {
            // Find potential matches for manual review
            const potentialMatches = fileNames.filter((fileName) => {
                const normalizedFileName = normalizeName(
                    fileName.replace(/\.(png|jpg|jpeg|webp)$/i, ""),
                );
                const normalizedPlayerName = normalizeName(player.name);

                // Check if any words match
                const playerWords = normalizedPlayerName.split(" ");
                const fileWords = normalizedFileName.split(" ");

                return playerWords.some((word) =>
                    fileWords.some((fileWord) =>
                        word.length > 2 &&
                        fileWord.length > 2 &&
                        (word.includes(fileWord) || fileWord.includes(word))
                    )
                );
            });

            if (potentialMatches.length > 0) {
                manualMatches.push({
                    player: player.name,
                    suggestedFile: potentialMatches[0],
                });
            }

            console.log(`✗ No match: ${player.name}`);
        }
    }

    console.log(
        `\nUpdate complete! Updated ${updatedCount} out of ${players.length} players`,
    );

    if (manualMatches.length > 0) {
        console.log("\nPotential manual matches:");
        manualMatches.forEach((match) => {
            console.log(`${match.player} -> ${match.suggestedFile}`);
        });
    }
}

main().catch(console.error);
