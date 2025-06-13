import { NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET() {
  try {
    // Fetch all tickets
    const tickets = await dbService.getTicketsWithDetails()

    // Prepare CSV header
    const header = [
      "ticket_id",
      "event_id",
      "tier_id",
      "qr_code_url",
      "purchaser_name",
      "purchaser_email",
      "is_validated",
      "created_at"
    ]

    // Prepare CSV rows
    const rows = tickets.map(ticket => [
      ticket.id,
      ticket.eventId,
      ticket.tierId,
      ticket.qrCodeUrl,
      ticket.purchaserName || "",
      ticket.purchaserEmail || "",
      ticket.isValidated ? "yes" : "no",
      ticket.createdAt
    ])

    // Convert to CSV string
    const csv = [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n")

    // Return as CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=tickets-export.csv"
      }
    })
  } catch (error) {
    console.error("Error exporting tickets as CSV:", error)
    return NextResponse.json({ error: "Failed to export tickets" }, { status: 500 })
  }
} 