export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const purchaseData = await request.json();

        // Validate required fields
        if (
            !purchaseData.subscription_type_id ||
            !purchaseData.purchaser_name ||
            !purchaseData.purchaser_email || !purchaseData.valid_from ||
            !purchaseData.valid_to
        ) {
            return NextResponse.json({
                error: "Missing required fields",
            }, { status: 400 });
        }

        // Generate subscription ID
        const subscriptionId = uuidv4();

        // Create the subscription
        const newSubscription = await supabaseService.createSubscription({
            id: subscriptionId,
            purchaser_name: purchaseData.purchaser_name,
            purchaser_surname: purchaseData.purchaser_surname || "",
            purchaser_email: purchaseData.purchaser_email,
            valid_from: purchaseData.valid_from,
            valid_to: purchaseData.valid_to,
            owner_id: "system", // For public purchases, use system as owner
            subscription_type_id: purchaseData.subscription_type_id,
        });

        return NextResponse.json({
            success: true,
            subscription: newSubscription,
            message: "Subscription purchased successfully",
        });
    } catch (error) {
        console.error("Error purchasing subscription:", error);
        const message = error instanceof Error
            ? error.message
            : "Internal Server Error";
        return NextResponse.json({
            error: "Failed to purchase subscription",
            details: message,
        }, { status: 500 });
    }
}
