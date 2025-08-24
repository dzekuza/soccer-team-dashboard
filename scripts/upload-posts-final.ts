import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BangaPost {
    id: string;
    title: string;
    content: string;
    url: string;
    published_date: string;
    image_url?: string;
    excerpt?: string;
}

async function uploadPostsFinal() {
    console.log("🚀 Final upload of Banga posts to Supabase...");

    try {
        // Read the JSON file
        const jsonPath = "scripts/output/banga-posts-2025.json";

        if (!fs.existsSync(jsonPath)) {
            console.error("❌ JSON file not found:", jsonPath);
            console.log(
                "📝 Please run the scraper first: pnpm run scrape:banga-posts",
            );
            return;
        }

        const jsonData = fs.readFileSync(jsonPath, "utf8");
        const posts: BangaPost[] = JSON.parse(jsonData);

        console.log(`📊 Found ${posts.length} posts to upload`);

        // First, let's check if the table exists
        console.log("🔍 Checking if banga_posts table exists...");

        const { data: existingData, error: existingError } = await supabase
            .from("banga_posts")
            .select("id")
            .limit(1);

        if (existingError) {
            console.log(
                "❌ Table does not exist. Please create it manually in Supabase dashboard.",
            );
            console.log("📝 SQL to create the table:");
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

-- Enable RLS
ALTER TABLE banga_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON banga_posts FOR SELECT USING (true);
CREATE POLICY "Admin insert access" ON banga_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update access" ON banga_posts FOR UPDATE USING (true);
CREATE POLICY "Admin delete access" ON banga_posts FOR DELETE USING (true);
      `);
            return;
        }

        console.log("✅ Table exists! Proceeding with upload...");

        // Upload posts in batches to avoid overwhelming the database
        const batchSize = 5;
        let uploadedCount = 0;

        for (let i = 0; i < posts.length; i += batchSize) {
            const batch = posts.slice(i, i + batchSize);
            console.log(
                `📝 Uploading batch ${Math.floor(i / batchSize) + 1}/${
                    Math.ceil(posts.length / batchSize)
                } (${batch.length} posts)...`,
            );

            const { data, error } = await supabase
                .from("banga_posts")
                .upsert(batch, { onConflict: "id" });

            if (error) {
                console.error(`❌ Batch upload failed:`, error);
                console.error("Error details:", JSON.stringify(error, null, 2));
                return;
            }

            uploadedCount += batch.length;
            console.log(
                `✅ Batch uploaded successfully! (${uploadedCount}/${posts.length} total)`,
            );

            // Add a small delay between batches
            if (i + batchSize < posts.length) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        console.log(
            `🎉 Successfully uploaded ${uploadedCount} posts to Supabase!`,
        );

        // Verify the upload
        const { count, error: countError } = await supabase
            .from("banga_posts")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("❌ Error counting records:", countError);
        } else {
            console.log(`📊 Total posts in database: ${count}`);
        }

        // Show sample of uploaded posts
        const { data: samplePosts, error: sampleError } = await supabase
            .from("banga_posts")
            .select("id, title, published_date")
            .order("published_date", { ascending: false })
            .limit(5);

        if (sampleError) {
            console.error("❌ Error fetching sample posts:", sampleError);
        } else {
            console.log("📋 Sample uploaded posts:");
            samplePosts?.forEach((post) => {
                console.log(`  - ${post.title} (${post.id})`);
            });
        }
    } catch (error) {
        console.error("❌ Upload failed:", error);
    }
}

// Run the upload
if (require.main === module) {
    uploadPostsFinal()
        .then(() => {
            console.log("✅ Final upload completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Final upload failed:", error);
            process.exit(1);
        });
}

export { uploadPostsFinal };
