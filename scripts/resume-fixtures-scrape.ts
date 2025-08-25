import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resumeFixturesScrape() {
  console.log("🚀 Starting resumed fixtures scraping and update...");

  try {
    // First, check what fixtures already have statistics
    console.log("📊 Checking existing fixtures with statistics...");
    const { data: existingFixtures, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, statistics, events")
      .eq("status", "completed")
      .not("lff_url_slug", "eq", "");

    if (fetchError) {
      console.error("❌ Error fetching existing fixtures:", fetchError);
      return;
    }

    console.log(`📋 Found ${existingFixtures?.length || 0} completed fixtures with URLs`);

    // Find fixtures that don't have statistics yet
    const fixturesNeedingStats = existingFixtures?.filter(
      (fixture) => !fixture.statistics || Object.keys(fixture.statistics).length === 0
    ) || [];

    console.log(`📈 Found ${fixturesNeedingStats.length} fixtures needing statistics`);

    if (fixturesNeedingStats.length === 0) {
      console.log("✅ All fixtures already have statistics!");
      return;
    }

    // Process fixtures in smaller batches to avoid timeouts
    const batchSize = 5;
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fixturesNeedingStats.length; i += batchSize) {
      const batch = fixturesNeedingStats.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(fixturesNeedingStats.length / batchSize)}`);

      for (const fixture of batch) {
        try {
          console.log(`\n📡 Processing: ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);
          
          // Scrape statistics
          const statistics = await LFFScraper.scrapeMatchStatistics(fixture.lff_url_slug);
          
          // Scrape events
          const events = await LFFScraper.scrapeMatchEvents(fixture.lff_url_slug);

          // Update the database
          const updateData: any = {
            updated_at: new Date().toISOString(),
          };

          if (statistics && Object.keys(statistics).length > 0) {
            updateData.statistics = statistics;
            console.log(`   ✅ Statistics: ${Object.keys(statistics).length} categories`);
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
              console.error(`   ❌ Error updating fixture:`, updateError);
              errorCount++;
            } else {
              console.log(`   ✅ Successfully updated fixture`);
              successCount++;
            }
          } else {
            console.log(`   ⚠️ No new data to update`);
          }

          processedCount++;

          // Add a delay between requests to avoid overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`   ❌ Error processing fixture:`, error);
          errorCount++;
          processedCount++;
        }
      }

      // Add a longer delay between batches
      if (i + batchSize < fixturesNeedingStats.length) {
        console.log(`\n⏳ Waiting 5 seconds before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log(`\n✅ Scraping completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${processedCount}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error("❌ Error during resumed scraping:", error);
  }
}

// Run the script
if (require.main === module) {
  resumeFixturesScrape()
    .then(() => {
      console.log("✅ Resumed scraping completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Resumed scraping failed:", error);
      process.exit(1);
    });
}
