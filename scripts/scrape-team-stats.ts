import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function scrapeTeamStats(teamName: string) {
  console.log(`🚀 Starting ${teamName} statistics scraping...`);

  try {
    // Get team's completed fixtures that need statistics
    const { data: fixtures, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, lff_url_slug, statistics, events")
      .eq("status", "completed")
      .or(`team1.eq.${teamName},team2.eq.${teamName}`)
      .order("match_date", { ascending: false });

    if (fetchError) {
      console.error(`❌ Error fetching ${teamName} fixtures:`, fetchError);
      return;
    }

    console.log(`📊 Found ${fixtures?.length || 0} ${teamName} fixtures`);

    // Find fixtures that need statistics
    const fixturesNeedingStats = fixtures?.filter(
      (fixture) => !fixture.statistics || Object.keys(fixture.statistics).length === 0
    ) || [];

    console.log(`📈 ${teamName} fixtures needing statistics: ${fixturesNeedingStats.length}`);

    if (fixturesNeedingStats.length === 0) {
      console.log(`✅ All ${teamName} fixtures already have statistics!`);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const fixture of fixturesNeedingStats) {
      try {
        console.log(`\n📡 Processing: ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);
        
        // Check if we have a URL
        if (!fixture.lff_url_slug) {
          console.log(`   ⚠️ No URL found, skipping...`);
          errorCount++;
          continue;
        }

        console.log(`   🔗 URL: ${fixture.lff_url_slug}`);
        
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
          errorCount++;
        }

        // Add a delay between requests
        await new Promise((resolve) => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`   ❌ Error processing fixture:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ ${teamName} scraping completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Processed: ${fixturesNeedingStats.length}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error(`❌ Error during ${teamName} scraping:`, error);
  }
}

// Run the script
if (require.main === module) {
  const teamName = process.argv[2];
  
  if (!teamName) {
    console.error("❌ Please provide a team name as an argument");
    console.log("Usage: npx tsx scripts/scrape-team-stats.ts \"Team Name\"");
    console.log("Example: npx tsx scripts/scrape-team-stats.ts \"FK Banga\"");
    process.exit(1);
  }

  scrapeTeamStats(teamName)
    .then(() => {
      console.log(`✅ ${teamName} scraping completed`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`❌ ${teamName} scraping failed:`, error);
      process.exit(1);
    });
}
