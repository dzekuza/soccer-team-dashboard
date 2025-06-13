import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await dbService.validateTicket(params.id)

    if (!result.success && !result.ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error validating ticket:", error)
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 })
  }
}
