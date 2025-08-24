import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, {
                status: 401,
            });
        }

        // First, get the count of records before cleaning
        const { count: beforeCount } = await supabase
            .from("banga_playerss")
            .select("*", { count: "exact", head: true });

        // Remove duplicates using a more efficient approach
        // Keep only the most recent record for each unique player
        const { data: uniquePlayers, error: selectError } = await supabase
            .from("banga_playerss")
            .select("*")
            .order("inserted_at", { ascending: false });

        if (selectError) {
            console.error("Error selecting players:", selectError);
            return NextResponse.json({
                error: "Failed to select players",
                details: selectError.message,
            }, { status: 500 });
        }

        // Group by name and team_key, keeping only the most recent
        const seen = new Set();
        const uniqueRecords = uniquePlayers?.filter((player) => {
            const key = `${player.name}-${player.team_key}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        }) || [];

        // Delete all records
        const { error: deleteError } = await supabase
            .from("banga_playerss")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) {
            console.error("Error deleting players:", deleteError);
            return NextResponse.json({
                error: "Failed to delete players",
                details: deleteError.message,
            }, { status: 500 });
        }

        // Insert back only unique records
        if (uniqueRecords.length > 0) {
            const { error: insertError } = await supabase
                .from("banga_playerss")
                .insert(uniqueRecords);

            if (insertError) {
                console.error("Error inserting unique players:", insertError);
                return NextResponse.json({
                    error: "Failed to insert unique players",
                    details: insertError.message,
                }, { status: 500 });
            }
        }

        // Get the count after cleaning
        const { count: afterCount } = await supabase
            .from("banga_playerss")
            .select("*", { count: "exact", head: true });

        const removedCount = (beforeCount || 0) - (afterCount || 0);

        return NextResponse.json({
            success: true,
            message:
                `Database cleaned successfully. Removed ${removedCount} duplicate records.`,
            beforeCount,
            afterCount,
            removedCount,
        });
    } catch (error) {
        console.error("Error in /api/players/clean-duplicates:", error);
        const message = error instanceof Error
            ? error.message
            : "Unknown error";
        return NextResponse.json(
            { error: "Failed to clean duplicates", details: message },
            { status: 500 },
        );
    }
}
