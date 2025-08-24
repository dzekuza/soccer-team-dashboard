import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadToExistingTable() {
    console.log("🚀 Testing upload to existing table...");

    try {
        // Read the JSON file
        const jsonPath = "scripts/output/banga-posts-2025.json";

        if (!fs.existsSync(jsonPath)) {
            console.error("❌ JSON file not found:", jsonPath);
            return;
        }

        const jsonData = fs.readFileSync(jsonPath, "utf8");
        const posts = JSON.parse(jsonData);

        console.log(`📊 Found ${posts.length} posts in JSON file`);

        // Test upload to banga_playerss table (which exists)
        console.log("📝 Testing upload to banga_playerss table...");

        const testPlayer = {
            id: "test-upload-player",
            name: "Test Player",
            surname: "Test Surname",
            position: "Test Position",
            number: "99",
            team_key: "test",
            matches: 0,
            goals: 0,
            minutes: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
        };

        const { data, error } = await supabase
            .from("banga_playerss")
            .insert(testPlayer);

        if (error) {
            console.error("❌ Upload to banga_playerss failed:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            return;
        }

        console.log("✅ Upload to banga_playerss successful!");

        // Clean up test player
        await supabase
            .from("banga_playerss")
            .delete()
            .eq("id", "test-upload-player");

        console.log("🧹 Test player cleaned up");

        // Now let's try to create a simple posts table
        console.log(
            "📝 Attempting to create posts table with minimal structure...",
        );

        // Try to create a table by inserting data with a simple structure
        const simplePost = {
            id: "test-post-1",
            title: "Test Post Title",
            content: "Test content",
            url: "https://test.com/post1",
            published_date: new Date().toISOString(),
        };

        const { data: postData, error: postError } = await supabase
            .from("banga_posts")
            .insert(simplePost);

        if (postError) {
            console.error("❌ Posts table creation failed:", postError);
            console.error("Error details:", JSON.stringify(postError, null, 2));

            // Try without RLS
            console.log("📝 Trying to create table without RLS...");

            // Let's try a different approach - create a simple table name
            const { data: altData, error: altError } = await supabase
                .from("posts")
                .insert(simplePost);

            if (altError) {
                console.error(
                    "❌ Alternative table creation failed:",
                    altError,
                );
                console.log(
                    "📝 The database might not allow table creation through the client.",
                );
                console.log(
                    "📝 Please create the table manually in the Supabase dashboard.",
                );
            } else {
                console.log("✅ Alternative table created successfully!");

                // Clean up
                await supabase
                    .from("posts")
                    .delete()
                    .eq("id", "test-post-1");

                console.log("🧹 Alternative test record cleaned up");
            }
        } else {
            console.log("✅ Posts table created successfully!");

            // Clean up
            await supabase
                .from("banga_posts")
                .delete()
                .eq("id", "test-post-1");

            console.log("🧹 Test post cleaned up");
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// Run the test
if (require.main === module) {
    uploadToExistingTable()
        .then(() => {
            console.log("✅ Upload test completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Upload test failed:", error);
            process.exit(1);
        });
}

export { uploadToExistingTable };
