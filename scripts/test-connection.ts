import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("🔍 Checking environment variables...");
console.log("Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("Service Key:", supabaseServiceKey ? "✅ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log("🚀 Testing Supabase connection...");

    try {
        // Test basic connection by querying a simple table
        console.log("📝 Testing basic query...");

        const { data, error } = await supabase
            .from("banga_playerss")
            .select("id")
            .limit(1);

        if (error) {
            console.error("❌ Query failed:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            return;
        }

        console.log("✅ Basic query successful!");
        console.log("📊 Data:", data);

        // Test banga_posts table
        console.log("📝 Testing banga_posts table...");

        const { data: postsData, error: postsError } = await supabase
            .from("banga_posts")
            .select("id")
            .limit(1);

        if (postsError) {
            console.error("❌ banga_posts query failed:", postsError);
            console.error(
                "Error details:",
                JSON.stringify(postsError, null, 2),
            );
            return;
        }

        console.log("✅ banga_posts query successful!");
        console.log("📊 Posts data:", postsData);
    } catch (error) {
        console.error("❌ Connection test failed:", error);
    }
}

// Run the test
if (require.main === module) {
    testConnection()
        .then(() => {
            console.log("✅ Connection test completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Connection test failed:", error);
            process.exit(1);
        });
}

export { testConnection };
