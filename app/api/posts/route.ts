import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const source = searchParams.get("source");
        const category = searchParams.get("category");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        let query = supabase
            .from("banga_posts")
            .select("*", { count: "exact" })
            .order("published_date", { ascending: false });

        // Apply filters if provided
        if (source) {
            query = query.eq("source", source);
        }

        if (category) {
            query = query.eq("category", category);
        }

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: posts, error, count } = await query
            .range(from, to);

        console.log("API Debug - Query result:", {
            posts: posts?.length,
            error,
            count,
        });

        if (error) {
            console.error("Error fetching posts:", error);
            return NextResponse.json(
                { error: "Failed to fetch posts" },
                { status: 500 },
            );
        }

        const response = NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });

        // Add cache control headers to prevent caching
        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, must-revalidate",
        );
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");

        return response;
    } catch (error) {
        console.error("Error in posts API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
