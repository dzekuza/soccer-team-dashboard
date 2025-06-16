import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // Await params for dynamic API routes per Next.js 15+ requirements
    const { params } = await Promise.resolve(context)
    const ticket = await dbService.getTicketWithDetails(params.id)
    if (!ticket) {
      console.error("[PDF API] Ticket not found for id:", params.id)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    const fileName = `ticket-${ticket.id}.pdf`
    // 1. Check if PDF already exists in Supabase Storage
    const { data: listData, error: listError } = await supabase.storage.from('ticket-pdfs').list('', { search: fileName })
    if (listError) {
      console.error("[PDF API] Error listing PDFs:", listError)
    }
    const alreadyExists = listData && listData.some((f: any) => f.name === fileName)
    if (!alreadyExists) {
      // 2. Generate and upload PDF
      try {
        const pdfBytes = await generateTicketPDF(ticket)
        const { error: uploadError } = await supabase.storage.from('ticket-pdfs').upload(fileName, Buffer.from(pdfBytes), {
          contentType: 'application/pdf',
          upsert: true,
        })
        if (uploadError) {
          console.error("[PDF API] Failed to upload PDF to storage:", uploadError)
          return NextResponse.json({ error: "Failed to upload PDF to storage" }, { status: 500 })
        }
      } catch (pdfError) {
        console.error("[PDF API] PDF generation error:", pdfError)
        return NextResponse.json({ error: `Failed to generate ticket PDF: ${pdfError instanceof Error ? pdfError.message : pdfError}` }, { status: 500 })
      }
    }
    // 3. Get public URL
    const { data: urlData } = supabase.storage.from('ticket-pdfs').getPublicUrl(fileName)
    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to get public URL for PDF" }, { status: 500 })
    }
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PDF API] Error generating ticket PDF:", error, error.stack)
    } else {
      console.error("[PDF API] Error generating ticket PDF:", error)
    }
    return NextResponse.json({ error: "Failed to generate ticket PDF" }, { status: 500 })
  }
} 