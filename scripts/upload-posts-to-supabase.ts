import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { createHash } from "crypto";

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

interface Post {
    title: string;
    content: string;
    excerpt?: string;
    author?: string;
    published_date?: string;
    url: string;
    image_url?: string;
    category?: string;
    tags?: string[];
    source: string;
    fingerprint: string;
}

function generateFingerprint(post: BangaPost): string {
    // Create a unique fingerprint based on title and URL
    const content = `${post.title}-${post.url}-${post.published_date}`;
    return createHash("md5").update(content).digest("hex");
}

function transformPost(bangaPost: BangaPost): Post {
    return {
        title: bangaPost.title,
        content: bangaPost.content,
        excerpt: bangaPost.excerpt,
        author: "FK Banga", // Default author
        published_date: bangaPost.published_date
            ? new Date(bangaPost.published_date).toISOString()
            : undefined,
        url: bangaPost.url,
        image_url: bangaPost.image_url,
        category: "Football", // Default category
        tags: ["Banga", "Football", "Lithuania"], // Default tags
        source: "fkbanga.lt",
        fingerprint: generateFingerprint(bangaPost),
    };
}

async function uploadPosts() {
    console.log("🚀 Starting upload of posts to Supabase...");

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
        const bangaposts: BangaPost[] = JSON.parse(jsonData);

        console.log(`📊 Found ${bangaposts.length} posts to upload`);

        // Transform posts to match our new table structure
        const posts: Post[] = bangaposts.map(transformPost);

        console.log("💾 Uploading posts to Supabase...");

        const { data, error } = await supabase
            .from("posts")
            .upsert(posts, { onConflict: "fingerprint" });

        if (error) {
            console.error("❌ Upload failed:", error);
            return;
        }

        console.log(
            `✅ Successfully uploaded ${posts.length} posts to Supabase!`,
        );

        // Verify the upload by counting records
        const { count, error: countError } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("❌ Error counting records:", countError);
        } else {
            console.log(`📊 Total posts in database: ${count}`);
        }

        // Show sample of uploaded posts
        const { data: samplePosts, error: sampleError } = await supabase
            .from("posts")
            .select("title, published_date, source")
            .order("published_date", { ascending: false })
            .limit(5);

        if (sampleError) {
            console.error("❌ Error fetching sample posts:", sampleError);
        } else {
            console.log("📋 Sample uploaded posts:");
            samplePosts?.forEach((post) => {
                console.log(`  - ${post.title} (${post.source})`);
            });
        }
    } catch (error) {
        console.error("❌ Upload failed:", error);
    }
}

// Run the upload
if (require.main === module) {
    uploadPosts()
        .then(() => {
            console.log("✅ Upload completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Upload failed:", error);
            process.exit(1);
        });
}

export { uploadPosts };
