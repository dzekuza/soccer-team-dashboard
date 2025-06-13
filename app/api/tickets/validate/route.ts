import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId } = body

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    const result = await dbService.validateTicket(ticketId)

    if (!result.success && !result.ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error validating ticket:", error)
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 })
  }
}
