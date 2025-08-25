import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        },
    );

    try {
        const today = new Date().toISOString().split("T")[0];

        // Get the next upcoming match for Banga (either team1 or team2 contains "Banga")
        const { data, error } = await supabase
            .from("fixtures_all_new")
            .select("*")
            .or(`team1.ilike.%Banga%,team2.ilike.%Banga%`)
            .gte("match_date", today)
            .order("match_date", { ascending: true })
            .order("match_time", { ascending: true })
            .limit(1)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No upcoming matches found
                return NextResponse.json(null);
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching upcoming match:", error);
        const message = error instanceof Error
            ? error.message
            : "Unknown error";
        return NextResponse.json({
            error: "Failed to fetch upcoming match",
            details: message,
        }, { status: 500 });
    }
}
