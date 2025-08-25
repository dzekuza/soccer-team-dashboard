import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { LFFScraper } from "../lib/lff-scraper";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFixturesUrls() {
  console.log("🚀 Starting fixtures URL update...");

  try {
    // Scrape all fixtures to get URLs
    console.log("🔍 Scraping fixtures to get URLs...");
    const allFixtures = await LFFScraper.scrapeAllFixturesWithStatistics();
    
    console.log(`📊 Scraped ${allFixtures.length} fixtures with URLs`);

    // Update database with URLs
    let updatedCount = 0;
    let errorCount = 0;

    for (const fixture of allFixtures) {
      try {
        if (fixture.lff_url_slug) {
          const { error: updateError } = await supabase
            .from("fixtures_all_new")
            .update({ 
              lff_url_slug: fixture.lff_url_slug,
              updated_at: new Date().toISOString()
            })
            .eq("fingerprint", fixture.fingerprint);

          if (updateError) {
            console.error(`❌ Error updating URL for ${fixture.team1} vs ${fixture.team2}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Updated URL for ${fixture.team1} vs ${fixture.team2}: ${fixture.lff_url_slug}`);
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing fixture:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ URL update completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error("❌ Error during URL update:", error);
  }
}

// Run the script
if (require.main === module) {
  updateFixturesUrls()
    .then(() => {
      console.log("✅ URL update completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ URL update failed:", error);
      process.exit(1);
    });
}

