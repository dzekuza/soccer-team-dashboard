import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpload() {
    console.log("🚀 Testing upload to Supabase...");

    try {
        // Test with a single post first
        const testPost = {
            id: "test-upload-1",
            title: "Test Upload Post",
            content: "<p>This is a test post for upload</p>",
            url: "https://test.com/test-upload-1",
            published_date: new Date().toISOString(),
            image_url: "https://example.com/test.jpg",
            excerpt: "This is a test excerpt...",
        };

        console.log("📝 Testing single post upload...");

        const { data, error } = await supabase
            .from("banga_posts")
            .insert(testPost);

        if (error) {
            console.error("❌ Single post upload failed:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            return;
        }

        console.log("✅ Single post upload successful!");

        // Now try to read the JSON file
        const jsonPath = "scripts/output/banga-posts-2025.json";

        if (!fs.existsSync(jsonPath)) {
            console.error("❌ JSON file not found:", jsonPath);
            return;
        }

        const jsonData = fs.readFileSync(jsonPath, "utf8");
        const posts = JSON.parse(jsonData);

        console.log(`📊 Found ${posts.length} posts in JSON file`);
        console.log("📋 First post sample:");
        console.log(JSON.stringify(posts[0], null, 2));

        // Try uploading just the first post
        console.log("📝 Testing first post from JSON...");

        const { data: data2, error: error2 } = await supabase
            .from("banga_posts")
            .upsert([posts[0]], { onConflict: "id" });

        if (error2) {
            console.error("❌ First post upload failed:", error2);
            console.error("Error details:", JSON.stringify(error2, null, 2));
            return;
        }

        console.log("✅ First post upload successful!");

        // Clean up test post
        await supabase
            .from("banga_posts")
            .delete()
            .eq("id", "test-upload-1");

        console.log("🧹 Test post cleaned up");
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// Run the test
if (require.main === module) {
    testUpload()
        .then(() => {
            console.log("✅ Test completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Test failed:", error);
            process.exit(1);
        });
}

export { testUpload };
