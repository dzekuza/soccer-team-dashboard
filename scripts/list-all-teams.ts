import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllTeams() {
    console.log("🔍 Listing all teams in the database...");

    try {
        // Get all unique team names from both team1 and team2 columns
        const { data: team1Data, error: team1Error } = await supabase
            .from("fixtures_all_new")
            .select("team1")
            .not("team1", "is", null);

        const { data: team2Data, error: team2Error } = await supabase
            .from("fixtures_all_new")
            .select("team2")
            .not("team2", "is", null);

        if (team1Error || team2Error) {
            console.error("❌ Error fetching teams:", team1Error || team2Error);
            return;
        }

        // Combine and get unique team names
        const allTeams = new Set<string>();

        team1Data?.forEach((row) => {
            if (row.team1) allTeams.add(row.team1);
        });

        team2Data?.forEach((row) => {
            if (row.team2) allTeams.add(row.team2);
        });

        const uniqueTeams = Array.from(allTeams).sort();

        console.log(`📊 Found ${uniqueTeams.length} unique teams:`);
        console.log(
            "\n" + uniqueTeams.map((team, index) =>
                `${index + 1}. ${team}`
            ).join("\n"),
        );

        // Also show team counts
        console.log("\n📈 Team match counts:");
        for (const team of uniqueTeams) {
            const { count: homeCount } = await supabase
                .from("fixtures_all_new")
                .select("*", { count: "exact", head: true })
                .eq("team1", team);

            const { count: awayCount } = await supabase
                .from("fixtures_all_new")
                .select("*", { count: "exact", head: true })
                .eq("team2", team);

            const totalMatches = (homeCount || 0) + (awayCount || 0);
            console.log(
                `   ${team}: ${totalMatches} matches (${homeCount || 0} home, ${
                    awayCount || 0
                } away)`,
            );
        }
    } catch (error) {
        console.error("❌ Error listing teams:", error);
    }
}

// Run the script
if (require.main === module) {
    listAllTeams()
        .then(() => {
            console.log("✅ Team listing completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Team listing failed:", error);
            process.exit(1);
        });
}
