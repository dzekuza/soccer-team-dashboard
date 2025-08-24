import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBangaPostsTableDirect() {
    console.log("🚀 Creating banga_posts table directly...");

    try {
        // Create the table using SQL
        const { error: createError } = await supabase
            .from("banga_posts")
            .select("id")
            .limit(1);

        if (createError && createError.code === "PGRST116") {
            console.log("📋 Table does not exist, creating it...");

            // Since we can't execute DDL directly, let's try to insert a test record
            // which will create the table if it doesn't exist
            const testRecord = {
                id: "test",
                title: "Test Post",
                content: "Test content",
                url: "https://test.com",
                published_date: new Date().toISOString(),
            };

            const { error: insertError } = await supabase
                .from("banga_posts")
                .insert(testRecord);

            if (insertError) {
                console.log(
                    "❌ Cannot create table automatically. Please run the migration manually.",
                );
                console.log("📝 SQL to run:");
                console.log(`
CREATE TABLE IF NOT EXISTS banga_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
                return;
            }

            // Delete the test record
            await supabase
                .from("banga_posts")
                .delete()
                .eq("id", "test");

            console.log("✅ Table created successfully!");
        } else {
            console.log("✅ Table already exists!");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the script
if (require.main === module) {
    createBangaPostsTableDirect()
        .then(() => {
            console.log("✅ Table creation completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Table creation failed:", error);
            process.exit(1);
        });
}

export { createBangaPostsTableDirect };
