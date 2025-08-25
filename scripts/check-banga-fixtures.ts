import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBangaFixtures() {
  console.log("🔍 Checking Banga A fixtures in database...");

  try {
    // Get Banga A fixtures
    const { data: fixtures, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, lff_url_slug, statistics, events")
      .or("team1.eq.FK Banga,team2.eq.FK Banga")
      .order("match_date", { ascending: false });

    if (fetchError) {
      console.error("❌ Error fetching Banga fixtures:", fetchError);
      return;
    }

    console.log(`📊 Found ${fixtures?.length || 0} Banga A fixtures`);

    // Show fixtures with URLs
    console.log("\n📋 Fixtures with URLs:");
    fixtures?.forEach((fixture, index) => {
      const hasUrl = fixture.lff_url_slug ? "✅" : "❌";
      const hasStats = fixture.statistics && Object.keys(fixture.statistics).length > 0 ? "✅" : "❌";
      const hasEvents = fixture.events && fixture.events.length > 0 ? "✅" : "❌";
      
      console.log(`${index + 1}. ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);
      console.log(`   URL: ${hasUrl} ${fixture.lff_url_slug || "No URL"}`);
      console.log(`   Stats: ${hasStats} Events: ${hasEvents}`);
      
      // Check if this is the problematic URL
      if (fixture.lff_url_slug && fixture.lff_url_slug.includes("fk-kauno-zalgiris-fk-banga-20649212")) {
        console.log(`   🚫 THIS IS THE PROBLEMATIC FIXTURE!`);
      }
      console.log("");
    });

    // Count statistics
    const withUrls = fixtures?.filter(f => f.lff_url_slug).length || 0;
    const withStats = fixtures?.filter(f => f.statistics && Object.keys(f.statistics).length > 0).length || 0;
    const withEvents = fixtures?.filter(f => f.events && f.events.length > 0).length || 0;

    console.log(`📈 Summary:`);
    console.log(`   Total fixtures: ${fixtures?.length || 0}`);
    console.log(`   With URLs: ${withUrls}`);
    console.log(`   With statistics: ${withStats}`);
    console.log(`   With events: ${withEvents}`);

  } catch (error) {
    console.error("❌ Error checking Banga fixtures:", error);
  }
}

// Run the script
if (require.main === module) {
  checkBangaFixtures()
    .then(() => {
      console.log("✅ Banga fixtures check completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Banga fixtures check failed:", error);
      process.exit(1);
    });
}
