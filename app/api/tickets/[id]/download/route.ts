import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { generateTicketPDF } from "@/lib/pdf-generator"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await dbService.getTicketWithDetails(params.id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    const pdfBlob = await generateTicketPDF(ticket)
    const arrayBuffer = await pdfBlob.arrayBuffer()
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ticket-${ticket.id}.pdf`,
      },
    })
  } catch (error) {
    console.error("Error generating ticket PDF:", error)
    return NextResponse.json({ error: "Failed to generate ticket PDF" }, { status: 500 })
  }
} 