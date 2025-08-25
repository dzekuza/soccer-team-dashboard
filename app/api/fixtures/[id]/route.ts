import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Fixture ID is required" },
                { status: 400 },
            );
        }

        // Fetch fixture by fingerprint (which is the ID)
        const { data: fixture, error } = await supabase
            .from("fixtures_all_new")
            .select("*")
            .eq("fingerprint", id)
            .single();

        if (error) {
            console.error("Error fetching fixture:", error);
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Fixture not found" },
                    { status: 404 },
                );
            }
            return NextResponse.json(
                { error: "Failed to fetch fixture" },
                { status: 500 },
            );
        }

        if (!fixture) {
            return NextResponse.json(
                { error: "Fixture not found" },
                { status: 404 },
            );
        }

        // Parse statistics and events if they exist
        let parsedFixture = { ...fixture };

        if (fixture.statistics && typeof fixture.statistics === "string") {
            try {
                parsedFixture.statistics = JSON.parse(fixture.statistics);
            } catch (e) {
                console.error("Error parsing statistics:", e);
                parsedFixture.statistics = {};
            }
        }

        if (fixture.events && typeof fixture.events === "string") {
            try {
                parsedFixture.events = JSON.parse(fixture.events);
            } catch (e) {
                console.error("Error parsing events:", e);
                parsedFixture.events = [];
            }
        }

        return NextResponse.json({
            fixture: parsedFixture,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
