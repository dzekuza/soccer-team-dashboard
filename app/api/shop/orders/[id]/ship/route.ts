import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notificationService } from "@/lib/notification-service";

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { tracking_number } = await request.json();
        const orderId = params.id;

        if (!tracking_number) {
            return NextResponse.json(
                { error: "Tracking number is required" },
                { status: 400 },
            );
        }

        // Get the order to verify it exists and get customer email
        const { data: order, error: orderError } = await supabaseAdmin
            .from("shop_orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        // Send shipping confirmation email
        try {
            await notificationService.sendShopOrderShippingConfirmation(
                orderId,
                tracking_number,
            );

            console.log(
                `📧 Shipping confirmation email sent for order ${orderId}`,
            );
        } catch (emailError) {
            console.error(
                "Failed to send shipping confirmation email:",
                emailError,
            );
            // Don't fail the request if email fails, just log it
        }

        return NextResponse.json({
            success: true,
            message: "Shipping confirmation email sent",
        });
    } catch (error) {
        console.error("Error in ship order endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
