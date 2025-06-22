import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
  }

  try {
    await notificationService.sendTicketConfirmation(id);
    return NextResponse.json({ success: true, message: "Email resent successfully." });
  } catch (error) {
    console.error(`Error resending email for ticket ${id}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to resend email", details: errorMessage },
      { status: 500 }
    );
  }
} 