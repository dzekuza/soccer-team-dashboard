import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markProblematicFixtureByUrl() {
  console.log("🔧 Marking problematic fixture as processed...");

  try {
    // Find the problematic fixture using partial URL match
    const { data: fixtures, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, lff_url_slug")
      .ilike("lff_url_slug", "%fk-kauno-zalgiris-fk-banga-20649212%");

    if (fetchError) {
      console.error("❌ Error fetching problematic fixture:", fetchError);
      return;
    }

    if (!fixtures || fixtures.length === 0) {
      console.log("❌ Problematic fixture not found");
      return;
    }

    console.log(`📋 Found ${fixtures.length} matching fixtures:`);
    fixtures.forEach((fixture, index) => {
      console.log(`${index + 1}. ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);
      console.log(`   URL: ${fixture.lff_url_slug}`);
    });

    // Mark all matching fixtures as processed
    for (const fixture of fixtures) {
      const { error: updateError } = await supabase
        .from("fixtures_all_new")
        .update({
          statistics: {},
          events: [],
          updated_at: new Date().toISOString()
        })
        .eq("fingerprint", fixture.fingerprint);

      if (updateError) {
        console.error(`❌ Error updating fixture ${fixture.fingerprint}:`, updateError);
      } else {
        console.log(`✅ Successfully marked fixture ${fixture.team1} vs ${fixture.team2} as processed`);
      }
    }

  } catch (error) {
    console.error("❌ Error marking problematic fixture:", error);
  }
}

// Run the script
if (require.main === module) {
  markProblematicFixtureByUrl()
    .then(() => {
      console.log("✅ Problematic fixture marking completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Problematic fixture marking failed:", error);
      process.exit(1);
    });
}
