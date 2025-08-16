import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Await params for dynamic API routes per Next.js 15+ requirements
    const { params } = await Promise.resolve(context)
    const ticket = await dbService.getTicketWithDetails(params.id)

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Await params for dynamic API routes per Next.js 15+ requirements
    const { params } = await Promise.resolve(context)
    const success = await dbService.deleteTicket(params.id)

    if (!success) {
      return NextResponse.json({ error: "Ticket not found or could not be deleted" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ticket deleted successfully" })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 })
  }
}
