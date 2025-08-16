import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subscriptionId = searchParams.get("id");

        if (!subscriptionId) {
            return NextResponse.json({ error: "Subscription ID is required" }, {
                status: 400,
            });
        }

        const { error } = await supabaseService.deleteSubscription(
            subscriptionId,
        );

        if (error) {
            console.error(
                `Error deleting subscription ${subscriptionId}:`,
                error,
            );
            return NextResponse.json(
                {
                    error: "Failed to delete subscription",
                    details: error.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Subscription deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "Internal Server Error";
        return NextResponse.json(
            { error: "Failed to delete subscription", details: errorMessage },
            { status: 500 },
        );
    }
}
