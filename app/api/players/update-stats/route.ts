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

        // Return error since player stats update functionality was removed during cleanup
        return NextResponse.json({
            error: "Player stats update functionality has been removed",
            message:
                "This feature is no longer available. Please use the dashboard to manage player stats manually.",
        }, { status: 501 });
    } catch (error) {
        console.error("Error in /api/players/update-stats:", error);
        const message = error instanceof Error
            ? error.message
            : "Unknown error";
        return NextResponse.json(
            { error: "Failed to process request", details: message },
            { status: 500 },
        );
    }
}
