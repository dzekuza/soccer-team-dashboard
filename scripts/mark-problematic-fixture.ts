import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markProblematicFixture() {
  console.log("🔧 Marking problematic fixture as processed...");

  try {
    // Find the problematic fixture
    const { data: fixture, error: fetchError } = await supabase
      .from("fixtures_all_new")
      .select("fingerprint, team1, team2, match_date, lff_url_slug")
      .eq("lff_url_slug", "https://www.lff.lt/ivykusios-varzybos/fk-kauno-zalgiris-fk-banga-20649212")
      .single();

    if (fetchError) {
      console.error("❌ Error fetching problematic fixture:", fetchError);
      return;
    }

    if (!fixture) {
      console.log("❌ Problematic fixture not found");
      return;
    }

    console.log(`📋 Found fixture: ${fixture.team1} vs ${fixture.team2} (${fixture.match_date})`);

    // Mark it as having empty statistics so it won't be processed again
    const { error: updateError } = await supabase
      .from("fixtures_all_new")
      .update({
        statistics: {},
        events: [],
        updated_at: new Date().toISOString()
      })
      .eq("fingerprint", fixture.fingerprint);

    if (updateError) {
      console.error("❌ Error updating problematic fixture:", updateError);
    } else {
      console.log("✅ Successfully marked problematic fixture as processed");
    }

  } catch (error) {
    console.error("❌ Error marking problematic fixture:", error);
  }
}

// Run the script
if (require.main === module) {
  markProblematicFixture()
    .then(() => {
      console.log("✅ Problematic fixture marking completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Problematic fixture marking failed:", error);
      process.exit(1);
    });
}
