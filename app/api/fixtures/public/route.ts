import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        // Get league filter from query params
        const { searchParams } = new URL(request.url);
        const league = searchParams.get("league");

        // Fetch fixtures from database
        let query = supabase
            .from("fixtures_all_new")
            .select("*")
            .order("match_date", { ascending: true });

        if (league) {
            query = query.eq("league_key", league);
        }

        const { data: fixtures, error } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: fixtures,
        });
    } catch (error) {
        console.error("Error fetching fixtures:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch fixtures",
        }, { status: 500 });
    }
}
