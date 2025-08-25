import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseState() {
  console.log("🔍 Checking database state...");

  try {
    // Check all fixtures
    const { data: allFixtures, error: allError } = await supabase
      .from("fixtures_all_new")
      .select("*");

    if (allError) {
      console.error("❌ Error fetching all fixtures:", allError);
      return;
    }

    console.log(`📊 Total fixtures in database: ${allFixtures?.length || 0}`);

    // Check fixtures by status
    const { data: completedFixtures, error: completedError } = await supabase
      .from("fixtures_all_new")
      .select("*")
      .eq("status", "completed");

    if (completedError) {
      console.error("❌ Error fetching completed fixtures:", completedError);
      return;
    }

    console.log(`📋 Completed fixtures: ${completedFixtures?.length || 0}`);

    // Check fixtures with URLs
    const { data: fixturesWithUrls, error: urlsError } = await supabase
      .from("fixtures_all_new")
      .select("*")
      .not("lff_url_slug", "eq", "");

    if (urlsError) {
      console.error("❌ Error fetching fixtures with URLs:", urlsError);
      return;
    }

    console.log(`🔗 Fixtures with URLs: ${fixturesWithUrls?.length || 0}`);

    // Check fixtures with statistics
    const { data: fixturesWithStats, error: statsError } = await supabase
      .from("fixtures_all_new")
      .select("*")
      .not("statistics", "is", null);

    if (statsError) {
      console.error("❌ Error fetching fixtures with statistics:", statsError);
      return;
    }

    console.log(`📈 Fixtures with statistics: ${fixturesWithStats?.length || 0}`);

    // Show sample fixtures
    if (allFixtures && allFixtures.length > 0) {
      console.log("\n📋 Sample fixtures:");
      allFixtures.slice(0, 5).forEach((fixture, index) => {
        console.log(`   ${index + 1}. ${fixture.team1} vs ${fixture.team2}`);
        console.log(`      Status: ${fixture.status}`);
        console.log(`      URL: ${fixture.lff_url_slug || 'No URL'}`);
        console.log(`      Statistics: ${fixture.statistics ? 'Present' : 'Missing'}`);
        console.log(`      Events: ${fixture.events ? 'Present' : 'Missing'}`);
      });
    }

    // Check if we need to update URLs
    if (completedFixtures && completedFixtures.length > 0) {
      const fixturesWithoutUrls = completedFixtures.filter(f => !f.lff_url_slug);
      console.log(`\n⚠️ Completed fixtures without URLs: ${fixturesWithoutUrls.length}`);
      
      if (fixturesWithoutUrls.length > 0) {
        console.log("   Sample fixtures without URLs:");
        fixturesWithoutUrls.slice(0, 3).forEach((fixture, index) => {
          console.log(`     ${index + 1}. ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);
        });
      }
    }

  } catch (error) {
    console.error("❌ Error during database check:", error);
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseState()
    .then(() => {
      console.log("✅ Database check completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database check failed:", error);
      process.exit(1);
    });
}
