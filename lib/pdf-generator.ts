"use client"

import jsPDF from "jspdf"
// @ts-expect-error: No type definitions for 'qrcode'
import QRCode from "qrcode"
import type { TicketWithDetails } from "./types"
import { formatCurrency } from "./utils"

export async function generateTicketPDF(ticket: TicketWithDetails): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [100, 210], // Ticket size
  })

  // Generate QR code from the ticket's QR code URL
  const qrCodeDataURL = await QRCode.toDataURL(ticket.qrCodeUrl, {
    width: 200,
    margin: 1,
  })

  // Set background
  pdf.setFillColor(240, 248, 255)
  pdf.rect(0, 0, 210, 100, "F")

  // Add border
  pdf.setLineWidth(2)
  pdf.setDrawColor(59, 130, 246)
  pdf.rect(5, 5, 200, 90)

  // Title
  pdf.setFontSize(20)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(30, 64, 175)
  pdf.text("SOCCER TEAM TICKET", 105, 20, { align: "center" })

  // Event details
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(ticket.event.title, 15, 35)

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Date: ${ticket.event.date}`, 15, 45)
  pdf.text(`Time: ${ticket.event.time}`, 15, 52)
  pdf.text(`Location: ${ticket.event.location}`, 15, 59)
  pdf.text(`Tier: ${ticket.tier.name}`, 15, 66)
  pdf.text(`Price: ${formatCurrency(ticket.tier.price)}`, 15, 73)

  // Purchaser info
  pdf.text(`Name: ${ticket.purchaserName}`, 15, 83)
  pdf.text(`Email: ${ticket.purchaserEmail}`, 15, 90)

  // Add QR code
  const qrSize = 35
  pdf.addImage(qrCodeDataURL, "PNG", 210 - qrSize - 15, 20, qrSize, qrSize)

  // Ticket ID
  pdf.setFontSize(8)
  pdf.text(`Ticket ID: ${ticket.id}`, 210 - 15, 65, { align: "right" })

  // QR code instructions
  pdf.setFontSize(7)
  pdf.text("Scan to validate", 210 - qrSize / 2 - 15, 65, { align: "center" })

  return pdf.output("blob")
}
