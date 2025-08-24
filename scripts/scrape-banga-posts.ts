import * as cheerio from "cheerio";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface BangaPost {
    id: string;
    title: string;
    content: string;
    url: string;
    published_date: string;
    image_url?: string;
    excerpt?: string;
}

async function scrapeBangaPosts() {
    console.log("🚀 Starting FK Banga posts scraping...");

    try {
        // Fetch the sitemap
        const sitemapUrl = "https://www.fkbanga.lt/wp-sitemap-posts-post-1.xml";
        console.log(`📄 Fetching sitemap from: ${sitemapUrl}`);

        const sitemapResponse = await fetch(sitemapUrl);
        const sitemapText = await sitemapResponse.text();

        // Parse the sitemap XML
        const $ = cheerio.load(sitemapText, { xmlMode: true });
        const urls: string[] = [];

        // Extract all URLs from the sitemap
        $("url").each((_, element) => {
            const loc = $(element).find("loc").text();
            const lastmod = $(element).find("lastmod").text();

            if (loc && lastmod) {
                // Filter for posts from 2025 onwards
                const date = new Date(lastmod);
                if (date.getFullYear() >= 2025) {
                    urls.push(loc);
                }
            }
        });

        console.log(`📊 Found ${urls.length} posts from 2025 onwards`);

        // Take only the last 20 posts
        const postsToScrape = urls.slice(-20);
        console.log(`🎯 Scraping last 20 posts...`);

        const scrapedPosts: BangaPost[] = [];

        // Scrape each post
        for (let i = 0; i < postsToScrape.length; i++) {
            const url = postsToScrape[i];
            console.log(
                `📝 Scraping post ${i + 1}/${postsToScrape.length}: ${url}`,
            );

            try {
                const postResponse = await fetch(url);
                const postHtml = await postResponse.text();
                const $post = cheerio.load(postHtml);

                // Extract post data from div.blog-post
                const blogPost = $post("div.blog-post");

                if (blogPost.length === 0) {
                    console.log(`⚠️  No div.blog-post found for ${url}`);
                    continue;
                }

                // Extract title from blog-post-title span
                const title =
                    $post("span.blog-post-title").first().text().trim() ||
                    $post("h1, h2, .post-title, .entry-title").first().text()
                        .trim();

                // Extract content from div.blog-post
                const content = blogPost.html() || "";

                // Extract main image
                const mainImage = $post("div.blog-post img").first();
                const imageUrl = mainImage.attr("src") ||
                    mainImage.attr("data-src");

                // Extract excerpt (first paragraph or meta description)
                const excerpt =
                    $post("div.blog-post p").first().text().trim().substring(
                        0,
                        200,
                    ) + "...";

                // Extract published date
                const publishedDate =
                    $post("time, .published, .post-date").first().attr(
                        "datetime",
                    ) ||
                    $post("time, .published, .post-date").first().text()
                        .trim() ||
                    new Date().toISOString();

                // Generate a unique ID from the URL
                const urlParts = url.split("/");
                const postId = urlParts[urlParts.length - 1] ||
                    urlParts[urlParts.length - 2];

                const post: BangaPost = {
                    id: postId,
                    title: title || "Untitled Post",
                    content: content,
                    url: url,
                    published_date: publishedDate,
                    image_url: imageUrl,
                    excerpt: excerpt,
                };

                scrapedPosts.push(post);
                console.log(`✅ Scraped: ${post.title}`);

                // Add a small delay to be respectful to the server
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Error scraping ${url}:`, error);
            }
        }

        console.log(`🎉 Successfully scraped ${scrapedPosts.length} posts`);

        // Save to JSON file for backup
        const fs = require("fs");
        const outputPath = "scripts/output/banga-posts-2025.json";
        fs.mkdirSync("scripts/output", { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(scrapedPosts, null, 2));
        console.log(`📁 Saved backup to: ${outputPath}`);

        // Try to save to database if table exists
        try {
            const { createClient } = await import("@supabase/supabase-js");

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

            if (supabaseUrl && supabaseServiceKey) {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);

                console.log("💾 Attempting to save posts to database...");

                const { data, error } = await supabase
                    .from("banga_posts")
                    .upsert(scrapedPosts, { onConflict: "id" });

                if (error) {
                    console.log(
                        "⚠️  Database table might not exist yet. Posts saved to JSON only.",
                    );
                    console.log("📝 Error:", error.message);
                } else {
                    console.log(
                        `✅ Saved ${scrapedPosts.length} posts to database`,
                    );
                }
            }
        } catch (dbError) {
            console.log(
                "⚠️  Database connection failed. Posts saved to JSON only.",
            );
        }

        return scrapedPosts;
    } catch (error) {
        console.error("❌ Scraping failed:", error);
        throw error;
    }
}

// Run the scraper
if (require.main === module) {
    scrapeBangaPosts()
        .then(() => {
            console.log("✅ Scraping completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Scraping failed:", error);
            process.exit(1);
        });
}

export { scrapeBangaPosts };
