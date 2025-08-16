import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function DELETE(request: NextRequest) {
    try {
        const { error } = await supabaseService.deleteAllSubscriptions();

        if (error) {
            console.error("Error deleting all subscriptions:", error);
            return NextResponse.json(
                {
                    error: "Failed to delete all subscriptions",
                    details: error.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "All subscriptions deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting all subscriptions:", error);
        const errorMessage = error instanceof Error
            ? error.message
            : "Internal Server Error";
        return NextResponse.json(
            {
                error: "Failed to delete all subscriptions",
                details: errorMessage,
            },
            { status: 500 },
        );
    }
}
