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

async function uploadBangaPosts() {
    console.log("🚀 Starting upload of Banga posts to Supabase...");

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

        // Upload posts to Supabase
        console.log("💾 Uploading posts to Supabase...");

        const { data, error } = await supabase
            .from("banga_posts")
            .upsert(posts, { onConflict: "id" });

        if (error) {
            console.error("❌ Upload failed:", error);

            // Check if table doesn't exist
            if (error.code === "PGRST116") {
                console.log("📝 Table does not exist. Please create it first:");
                console.log("pnpm run create:banga-posts-table-direct");
            }
            return;
        }

        console.log(
            `✅ Successfully uploaded ${posts.length} posts to Supabase!`,
        );

        // Verify the upload by counting records
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
    uploadBangaPosts()
        .then(() => {
            console.log("✅ Upload completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Upload failed:", error);
            process.exit(1);
        });
}

export { uploadBangaPosts };
