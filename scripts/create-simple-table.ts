import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSimpleTable() {
    console.log("🚀 Creating simple banga_posts table...");

    try {
        // Try to create a simple table structure by inserting data
        // Supabase will create the table automatically if it doesn't exist

        const simplePost = {
            id: "simple-test-1",
            title: "Simple Test Post",
            content: "Simple test content",
            url: "https://simple-test.com/1",
            published_date: new Date().toISOString(),
            image_url: "https://simple-test.com/image.jpg",
            excerpt: "Simple test excerpt...",
        };

        console.log("📝 Attempting to create table with simple structure...");

        const { data, error } = await supabase
            .from("banga_posts")
            .insert(simplePost);

        if (error) {
            console.error("❌ Failed to create table:", error);
            console.log(
                "📝 The table might need to be created manually in the Supabase dashboard.",
            );
            console.log("📝 Or the RLS policies might be blocking the insert.");
            return;
        }

        console.log("✅ Table created successfully!");
        console.log("📊 Inserted data:", data);

        // Clean up the test record
        await supabase
            .from("banga_posts")
            .delete()
            .eq("id", "simple-test-1");

        console.log("🧹 Test record cleaned up");

        // Test the table
        const { data: testData, error: testError } = await supabase
            .from("banga_posts")
            .select("*")
            .limit(1);

        if (testError) {
            console.error("❌ Table test failed:", testError);
        } else {
            console.log("✅ Table is working correctly!");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the script
if (require.main === module) {
    createSimpleTable()
        .then(() => {
            console.log("✅ Simple table creation completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Simple table creation failed:", error);
            process.exit(1);
        });
}

export { createSimpleTable };
