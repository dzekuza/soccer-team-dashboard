import { type NextRequest, NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try to fetch ticket details first
    const ticket = await supabaseService.getTicketWithDetails(params.id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    // If already validated, return warning
    if (ticket.isValidated) {
      return NextResponse.json({
        success: false,
        message: "Bilietas jau buvo panaudotas.",
        ticket
      })
    }
    // Validate the ticket
    const validated = await supabaseService.validateTicket(params.id)
    if (!validated) {
      return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 })
    }
    // Fetch updated ticket details
    const updatedTicket = await supabaseService.getTicketWithDetails(params.id)
    return NextResponse.json({
      success: true,
      message: "Bilietas sėkmingai patvirtintas!",
      ticket: updatedTicket
    })
  } catch (error) {
    console.error("Error validating ticket:", error)
    return NextResponse.json({ error: "Failed to validate ticket" }, { status: 500 })
  }
}
