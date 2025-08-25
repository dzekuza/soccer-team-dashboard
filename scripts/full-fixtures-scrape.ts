import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fullFixturesScrape() {
    console.log("🚀 Starting full fixtures scraping and update...");

    try {
        // Scrape all fixtures with statistics
        console.log("🔍 Scraping fixtures with statistics...");
        const scrapedFixtures = await LFFScraper
            .scrapeAllFixturesWithStatistics();

        if (scrapedFixtures.length === 0) {
            console.log("❌ No fixtures found during scraping");
            return;
        }

        console.log(`📈 Found ${scrapedFixtures.length} leagues`);

        // Prepare fixtures for insertion/update
        const fixturesToUpsert = scrapedFixtures.flatMap((leagueData) =>
            leagueData.fixtures.map((fixture) => ({
                fingerprint: fixture.id,
                match_date: fixture.date,
                match_time: fixture.time,
                team1: fixture.home_team.name,
                team2: fixture.away_team.name,
                team1_score: fixture.home_score,
                team2_score: fixture.away_score,
                team1_logo: fixture.home_team.logo,
                team2_logo: fixture.away_team.logo,
                venue: fixture.stadium,
                league_key: fixture.league,
                status: fixture.status,
                round: fixture.round,
                lff_url_slug: fixture.match_url || "",
                statistics: fixture.statistics
                    ? JSON.stringify(fixture.statistics)
                    : null,
                events: fixture.events ? JSON.stringify(fixture.events) : null,
                owner_id: null, // Using service role, so no user context
                is_draft: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }))
        );

        console.log(
            `📝 Prepared ${fixturesToUpsert.length} fixtures for upsert`,
        );

        // Show summary by league
        scrapedFixtures.forEach((league) => {
            console.log(
                `🏆 ${league.league}: ${league.fixtures.length} fixtures`,
            );
        });

        // Upsert all fixtures (this will update existing ones and insert new ones)
        console.log("💾 Upserting fixtures...");
        const { data: upsertedFixtures, error: upsertError } = await supabase
            .from("fixtures_all_new")
            .upsert(fixturesToUpsert, {
                onConflict: "fingerprint",
                ignoreDuplicates: false,
            })
            .select();

        if (upsertError) {
            console.error("❌ Error upserting fixtures:", upsertError);
            return;
        }

        console.log(
            `✅ Successfully upserted ${
                upsertedFixtures?.length || 0
            } fixtures`,
        );

        // Verify the data
        console.log("🔍 Verifying updated data...");
        const { data: verifyData, error: verifyError } = await supabase
            .from("fixtures_all_new")
            .select(
                "fingerprint, team1, team2, team1_logo, team2_logo, league_key, match_date",
            )
            .not("team1", "is", null)
            .order("match_date", { ascending: true })
            .limit(10);

        if (verifyError) {
            console.error("❌ Error verifying data:", verifyError);
        } else {
            console.log(
                `📋 Verified ${
                    verifyData?.length || 0
                } fixtures with team data`,
            );
            if (verifyData && verifyData.length > 0) {
                console.log("📋 Sample verified fixtures:");
                verifyData.forEach((fixture, index) => {
                    console.log(
                        `   ${
                            index + 1
                        }. ${fixture.team1} vs ${fixture.team2} (${fixture.league_key}) - ${fixture.match_date}`,
                    );
                });
            }
        }

        // Check for any remaining fixtures without team data
        console.log("🔍 Checking for fixtures without team data...");
        const { data: nullTeamData, error: nullTeamError } = await supabase
            .from("fixtures_all_new")
            .select("fingerprint, league_key, match_date")
            .or("team1.is.null,team2.is.null")
            .limit(5);

        if (nullTeamError) {
            console.error("❌ Error checking null team data:", nullTeamError);
        } else {
            console.log(
                `📋 Found ${
                    nullTeamData?.length || 0
                } fixtures still without team data`,
            );
            if (nullTeamData && nullTeamData.length > 0) {
                console.log("📋 Sample fixtures without team data:");
                nullTeamData.forEach((fixture) => {
                    console.log(
                        `   - ${fixture.fingerprint} (${fixture.league_key}) - ${fixture.match_date}`,
                    );
                });
            }
        }

        console.log("🎉 Full fixtures scraping and update completed!");
    } catch (error) {
        console.error("❌ Error during full fixtures scrape:", error);
    }
}

// Run the full scrape
if (require.main === module) {
    fullFixturesScrape()
        .then(() => {
            console.log("✅ Full scrape completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Full scrape failed:", error);
            process.exit(1);
        });
}
