import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function batchFixturesScrape(batchSize: number = 10) {
    console.log(
        `🚀 Starting batch fixtures scraping (batch size: ${batchSize})...`,
    );

    try {
        // Get all completed fixtures that need statistics
        const { data: allFixtures, error: fetchError } = await supabase
            .from("fixtures_all_new")
            .select(
                "fingerprint, team1, team2, match_date, lff_url_slug, statistics, events",
            )
            .eq("status", "completed")
            .order("match_date", { ascending: false });

        if (fetchError) {
            console.error("❌ Error fetching fixtures:", fetchError);
            return;
        }

        console.log(`📊 Total completed fixtures: ${allFixtures?.length || 0}`);

        // Find fixtures that need statistics
        const fixturesNeedingStats = allFixtures?.filter(
            (fixture) =>
                !fixture.statistics ||
                Object.keys(fixture.statistics).length === 0,
        ) || [];

        console.log(
            `📈 Fixtures needing statistics: ${fixturesNeedingStats.length}`,
        );

        if (fixturesNeedingStats.length === 0) {
            console.log("✅ All fixtures already have statistics!");
            return;
        }

        // Process only the first batch
        const currentBatch = fixturesNeedingStats.slice(0, batchSize);
        console.log(`\n🔄 Processing batch 1: ${currentBatch.length} fixtures`);

        let successCount = 0;
        let errorCount = 0;

        for (const fixture of currentBatch) {
            try {
                console.log(
                    `\n📡 Processing: ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`,
                );

                // Check if we have a URL
                if (!fixture.lff_url_slug) {
                    console.log(`   ⚠️ No URL found, skipping...`);
                    errorCount++;
                    continue;
                }

                console.log(`   🔗 URL: ${fixture.lff_url_slug}`);

                // Scrape statistics
                const statistics = await LFFScraper.scrapeMatchStatistics(
                    fixture.lff_url_slug,
                );

                // Scrape events
                const events = await LFFScraper.scrapeMatchEvents(
                    fixture.lff_url_slug,
                );

                // Update the database
                const updateData: any = {
                    updated_at: new Date().toISOString(),
                };

                if (statistics && Object.keys(statistics).length > 0) {
                    updateData.statistics = statistics;
                    console.log(
                        `   ✅ Statistics: ${
                            Object.keys(statistics).length
                        } categories`,
                    );
                }

                if (events && events.length > 0) {
                    updateData.events = events;
                    console.log(`   ✅ Events: ${events.length} events`);
                }

                if (Object.keys(updateData).length > 1) { // More than just updated_at
                    const { error: updateError } = await supabase
                        .from("fixtures_all_new")
                        .update(updateData)
                        .eq("fingerprint", fixture.fingerprint);

                    if (updateError) {
                        console.error(
                            `   ❌ Error updating fixture:`,
                            updateError,
                        );
                        errorCount++;
                    } else {
                        console.log(`   ✅ Successfully updated fixture`);
                        successCount++;
                    }
                } else {
                    console.log(`   ⚠️ No new data to update`);
                    errorCount++;
                }

                // Add a delay between requests
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`   ❌ Error processing fixture:`, error);
                errorCount++;
            }
        }

        console.log(`\n✅ Batch completed!`);
        console.log(`📊 Summary:`);
        console.log(`   Processed: ${currentBatch.length}`);
        console.log(`   Successful: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(
            `\n📋 Remaining fixtures: ${
                fixturesNeedingStats.length - currentBatch.length
            }`,
        );

        if (fixturesNeedingStats.length > currentBatch.length) {
            console.log(
                `\n🔄 To continue, run this script again to process the next batch.`,
            );
        }
    } catch (error) {
        console.error("❌ Error during batch scraping:", error);
    }
}

// Get batch size from command line argument or use default
const batchSize = parseInt(process.argv[2]) || 10;

// Run the script
if (require.main === module) {
    batchFixturesScrape(batchSize)
        .then(() => {
            console.log("✅ Batch scraping completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Batch scraping failed:", error);
            process.exit(1);
        });
}
