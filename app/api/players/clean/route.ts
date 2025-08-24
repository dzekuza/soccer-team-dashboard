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

        // Delete all existing players
        const { error: deleteError } = await supabase
            .from("banga_playerss")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) {
            console.error("Error deleting players:", deleteError);
            return NextResponse.json({
                error: "Failed to clean database",
                details: deleteError.message,
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Database cleaned successfully",
        });
    } catch (error) {
        console.error("Error in /api/players/clean:", error);
        const message = error instanceof Error
            ? error.message
            : "Unknown error";
        return NextResponse.json(
            { error: "Failed to clean database", details: message },
            { status: 500 },
        );
    }
}
