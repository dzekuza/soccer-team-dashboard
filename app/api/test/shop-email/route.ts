import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Send customer confirmation email
    await notificationService.sendShopOrderConfirmation(orderId);
    
    // Send admin notification email
    await notificationService.sendShopOrderNotificationToAdmin(orderId);

    return NextResponse.json({ 
      success: true, 
      message: "Emails sent successfully" 
    });
  } catch (error) {
    console.error("Error sending test emails:", error);
    return NextResponse.json({ 
      error: "Failed to send emails", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
