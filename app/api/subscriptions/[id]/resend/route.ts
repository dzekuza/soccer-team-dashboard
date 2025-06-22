import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
  }

  try {
    await notificationService.sendSubscriptionConfirmation(id);
    return NextResponse.json({ success: true, message: "Email resent successfully." });
  } catch (error) {
    console.error(`Error resending email for subscription ${id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to resend email", details: errorMessage },
      { status: 500 }
    );
  }
} 