import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTableSQL() {
    console.log("🚀 Creating banga_posts table using SQL...");

    try {
        // First, let's check if the table exists
        const { data: existingData, error: existingError } = await supabase
            .from("banga_posts")
            .select("id")
            .limit(1);

        if (!existingError) {
            console.log("✅ Table already exists!");
            return;
        }

        console.log("📋 Table does not exist, creating it...");

        // Since we can't execute DDL directly through the client,
        // let's try to create the table by inserting a record
        // and letting Supabase create the table structure

        const testRecord = {
            id: "temp-create-table",
            title: "Temporary record for table creation",
            content: "<p>Temporary content</p>",
            url: "https://temp.com/temp",
            published_date: new Date().toISOString(),
            image_url: "https://temp.com/image.jpg",
            excerpt: "Temporary excerpt...",
        };

        console.log(
            "📝 Attempting to create table by inserting test record...",
        );

        const { data, error } = await supabase
            .from("banga_posts")
            .insert(testRecord);

        if (error) {
            console.error("❌ Failed to create table:", error);
            console.log("📝 Please create the table manually using this SQL:");
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_banga_posts_published_date ON banga_posts(published_date);
CREATE INDEX IF NOT EXISTS idx_banga_posts_title ON banga_posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_banga_posts_content ON banga_posts USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE banga_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON banga_posts FOR SELECT USING (true);
CREATE POLICY "Admin insert access" ON banga_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update access" ON banga_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete access" ON banga_posts FOR DELETE USING (auth.role() = 'authenticated');
      `);
            return;
        }

        console.log("✅ Table created successfully!");

        // Clean up the test record
        await supabase
            .from("banga_posts")
            .delete()
            .eq("id", "temp-create-table");

        console.log("🧹 Test record cleaned up");

        // Verify the table exists
        const { data: verifyData, error: verifyError } = await supabase
            .from("banga_posts")
            .select("id")
            .limit(1);

        if (verifyError) {
            console.error("❌ Table verification failed:", verifyError);
        } else {
            console.log("✅ Table verified successfully!");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run the script
if (require.main === module) {
    createTableSQL()
        .then(() => {
            console.log("✅ Table creation completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Table creation failed:", error);
            process.exit(1);
        });
}

export { createTableSQL };
