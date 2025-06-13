import { PDFDocument, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import type { TicketWithDetails } from './types'
import { formatCurrency } from './utils'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'
import path from 'path'

export async function generateTicketPDF(ticket: TicketWithDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const page = pdfDoc.addPage([595, 283]) // ~A5 landscape in points

  // Design system colors
  const mainBg = rgb(10/255, 22/255, 91/255) // #0A165B
  const borderColor = rgb(95/255, 95/255, 113/255) // rgba(95,95,113,0.31) (approx)
  const accentOrange = rgb(241/255, 86/255, 1/255) // #F15601
  const titleColor = rgb(255/255, 255/255, 255/255)

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 283, color: mainBg })
  // Border
  page.drawRectangle({ x: 10, y: 10, width: 575, height: 263, borderColor, borderWidth: 2 })

  // Embed logo (top-left) using fetch
  // Logo file: public/FK banga.png
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const logoUrl = `${baseUrl}/FK%20banga.png`
  try {
    const res = await fetch(logoUrl)
    if (res.ok) {
      const logoBytes = new Uint8Array(await res.arrayBuffer())
      const logoImage = await pdfDoc.embedPng(logoBytes)
      page.drawImage(logoImage, {
        x: 30,
        y: 200,
        width: 60,
        height: 60,
      })
    }
  } catch (e) {
    // Optionally log or ignore if logo fails to load
  }

  // Load Inter font from disk (server-side only)
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter_18pt-Regular.ttf')
  const fontBytes = fs.readFileSync(fontPath)
  const customFont = await pdfDoc.embedFont(fontBytes)

  // Title (centered, white)
  page.drawText('SOCCER TEAM TICKET', {
    x: 297.5 - 120,
    y: 250,
    size: 28,
    font: customFont,
    color: titleColor,
  })

  // Event details (white, accent for price/tier)
  page.drawText(ticket.event.title, { x: 110, y: 210, size: 18, font: customFont, color: titleColor })
  page.drawText(`Date: ${ticket.event.date}`, { x: 110, y: 185, size: 12, font: customFont, color: titleColor })
  page.drawText(`Time: ${ticket.event.time}`, { x: 110, y: 170, size: 12, font: customFont, color: titleColor })
  page.drawText(`Location: ${ticket.event.location}`, { x: 110, y: 155, size: 12, font: customFont, color: titleColor })
  page.drawText(`Tier: ${ticket.tier.name}`, { x: 110, y: 140, size: 12, font: customFont, color: accentOrange })
  page.drawText(`Price: ${formatCurrency(ticket.tier.price)}`, { x: 110, y: 125, size: 12, font: customFont, color: accentOrange })
  page.drawText(`Name: ${ticket.purchaserName}`, { x: 110, y: 105, size: 12, font: customFont, color: titleColor })
  page.drawText(`Email: ${ticket.purchaserEmail}`, { x: 110, y: 90, size: 12, font: customFont, color: titleColor })

  // QR code
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCodeUrl, { width: 200, margin: 1 })
  const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64')
  const qrImage = await pdfDoc.embedPng(qrImageBytes)
  page.drawImage(qrImage, {
    x: 430,
    y: 120,
    width: 100,
    height: 100,
  })
  // Ticket ID and instructions
  page.drawText(`Ticket ID: ${ticket.id}`, { x: 430, y: 110, size: 10, font: customFont, color: titleColor })
  page.drawText('Scan to validate', { x: 480, y: 105, size: 9, font: customFont, color: titleColor })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
