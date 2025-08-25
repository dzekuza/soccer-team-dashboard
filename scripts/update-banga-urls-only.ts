import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBangaUrlsOnly() {
  console.log("🚀 Starting Banga A URL update...");

  try {
    // Scrape fixtures to get URLs
    console.log("🔍 Scraping fixtures to get URLs...");
    const scrapedFixtures = await LFFScraper.scrapeAllFixtures();
    
    console.log(`📊 Scraped ${scrapedFixtures.length} leagues`);

    // Get all Banga A fixtures from database
    const { data: dbFixtures, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, lff_url_slug")
      .or("team1.eq.FK Banga,team2.eq.FK Banga")
      .order("match_date", { ascending: false });

    if (fetchError) {
      console.error("❌ Error fetching Banga fixtures:", fetchError);
      return;
    }

    console.log(`📋 Found ${dbFixtures?.length || 0} Banga A fixtures in database`);

    // Create a map of scraped fixtures by fingerprint
    const scrapedFixturesMap = new Map();
    scrapedFixtures.forEach(leagueData => {
      leagueData.fixtures.forEach(fixture => {
        const key = `${fixture.home_team.name}_${fixture.away_team.name}_${fixture.date}`;
        scrapedFixturesMap.set(key, fixture);
      });
    });

    let updatedCount = 0;
    let errorCount = 0;

    // Update URLs for Banga fixtures
    for (const dbFixture of dbFixtures || []) {
      try {
        const key = `${dbFixture.team1}_${dbFixture.team2}_${dbFixture.match_date}`;
        const scrapedFixture = scrapedFixturesMap.get(key);

        if (scrapedFixture && scrapedFixture.match_url) {
          console.log(`📝 Updating URL for: ${dbFixture.team1} vs ${dbFixture.team2} (${dbFixture.match_date})`);
          console.log(`   New URL: ${scrapedFixture.match_url}`);

          const { error: updateError } = await supabase
            .from("fixtures_all_new")
            .update({
              lff_url_slug: scrapedFixture.match_url,
              updated_at: new Date().toISOString()
            })
            .eq("fingerprint", dbFixture.fingerprint);

          if (updateError) {
            console.error(`   ❌ Error updating fixture:`, updateError);
            errorCount++;
          } else {
            console.log(`   ✅ Successfully updated URL`);
            updatedCount++;
          }
        } else {
          console.log(`⚠️ No URL found for: ${dbFixture.team1} vs ${dbFixture.team2} (${dbFixture.match_date})`);
          errorCount++;
        }

        // Add a small delay
        await new Promise((resolve) => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing fixture:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ URL update completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total fixtures: ${dbFixtures?.length || 0}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error("❌ Error during URL update:", error);
  }
}

// Run the script
if (require.main === module) {
  updateBangaUrlsOnly()
    .then(() => {
      console.log("✅ Banga URL update completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Banga URL update failed:", error);
      process.exit(1);
    });
}
