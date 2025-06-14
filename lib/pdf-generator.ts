import { PDFDocument, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import type { TicketWithDetails, Team } from './types'
import { formatCurrency } from './utils'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs'
import path from 'path'

export async function generateTicketPDF(ticket: TicketWithDetails, team1?: Team, team2?: Team): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const width = 595, height = 283 // ~A5 landscape
  const page = pdfDoc.addPage([width, height])

  // Colors
  const mainBg = rgb(10/255, 22/255, 91/255) // #0A165B
  const orange = rgb(241/255, 86/255, 1/255) // #F15601
  const white = rgb(1, 1, 1)
  const gray = rgb(0.7, 0.7, 0.7)

  // Layout
  const blueWidth = width * 0.6
  const orangeWidth = width - blueWidth
  const leftPad = 32
  const rightPad = 32

  // Backgrounds
  page.drawRectangle({ x: 0, y: 0, width: blueWidth, height, color: mainBg })

  // Orange section: use image if available, else solid color
  try {
    const bgPath = path.join(process.cwd(), 'public', 'bg qr.jpg')
    if (fs.existsSync(bgPath)) {
      const bgBytes = fs.readFileSync(bgPath)
      const bgImage = await pdfDoc.embedJpg(bgBytes)
      page.drawImage(bgImage, {
        x: blueWidth, y: 0, width: orangeWidth, height,
      })
    } else {
      page.drawRectangle({ x: blueWidth, y: 0, width: orangeWidth, height, color: orange })
    }
  } catch {
    page.drawRectangle({ x: blueWidth, y: 0, width: orangeWidth, height, color: orange })
  }

  // Load Inter font from disk (server-side only)
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter_18pt-Regular.ttf')
  const fontBytes = fs.readFileSync(fontPath)
  const customFont = await pdfDoc.embedFont(fontBytes)

  // League logo (static or placeholder)
  const leagueLogoUrl = process.env.NEXT_PUBLIC_LEAGUE_LOGO_URL || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/league-logo.png`
  try {
    const res = await fetch(leagueLogoUrl)
    if (res.ok) {
      const logoBytes = new Uint8Array(await res.arrayBuffer())
      const logoImage = await pdfDoc.embedPng(logoBytes)
      page.drawImage(logoImage, {
        x: 24, y: height - 24 - 48, width: 64, height: 48,
      })
    }
  } catch {}

  // === Constants ===
  const logoSize = 56
  const nameFontSize = 13
  const groupGap = 8
  const groupHeight = logoSize + groupGap + nameFontSize

  // Move the group higher (e.g., 60% from the top)
  const groupY = height * 0.60

  // === TEAM 1 ===
  if (team1?.logo) {
    try {
      const res = await fetch(team1.logo)
      if (res.ok) {
        const logoBytes = new Uint8Array(await res.arrayBuffer())
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: 50,
          y: groupY + nameFontSize + groupGap,
          width: logoSize,
          height: logoSize,
        })
      }
    } catch {}
  }
  page.drawText(team1?.team_name || 'Team 1', {
    x: 50,
    y: groupY,
    size: nameFontSize,
    font: customFont,
    color: white,
    maxWidth: 100,
  })

  // === TEAM 2 ===
  if (team2?.logo) {
    try {
      const res = await fetch(team2.logo)
      if (res.ok) {
        const logoBytes = new Uint8Array(await res.arrayBuffer())
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: blueWidth - logoSize - 50,
          y: groupY + nameFontSize + groupGap,
          width: logoSize,
          height: logoSize,
        })
      }
    } catch {}
  }
  page.drawText(team2?.team_name || 'Team 2', {
    x: blueWidth - 120,
    y: groupY,
    size: nameFontSize,
    font: customFont,
    color: white,
    maxWidth: 100,
  })

  // === "prieš" text ===
  const vsText = 'prieš'
  const vsFontSize = 22
  const vsWidth = customFont.widthOfTextAtSize(vsText, vsFontSize)
  page.drawText(vsText, {
    x: (blueWidth - vsWidth) / 2,
    y: groupY + logoSize / 2 + nameFontSize / 2,
    size: vsFontSize,
    font: customFont,
    color: white,
  })

  // Event start (large orange)
  page.drawText(`RUNGtynių PRADŽIA: ${ticket.event.time}`, {
    x: 40, y: height/2 - 40, size: 22, font: customFont, color: orange,
  })
  // Date (gray)
  page.drawText(ticket.event.date, {
    x: 40, y: height/2 - 65, size: 13, font: customFont, color: gray,
  })

  // Details row (uppercase labels, bold)
  page.drawText('LOKACIJA', {
    x: 40, y: 40, size: 10, font: customFont, color: gray,
  })
  page.drawText('BILIETO TIPAS', {
    x: 180, y: 40, size: 10, font: customFont, color: gray,
  })
  // Values
  page.drawText((ticket.event.location || '').toUpperCase(), {
    x: 40, y: 28, size: 13, font: customFont, color: white,
  })
  page.drawText((ticket.tier.name || '').toUpperCase(), {
    x: 180, y: 28, size: 13, font: customFont, color: white,
  })

  // QR code (centered in orange section)
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCodeUrl, { width: 180, margin: 1 })
  const qrImageBytes = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64')
  const qrImage = await pdfDoc.embedPng(qrImageBytes)
  page.drawImage(qrImage, {
    x: blueWidth + (orangeWidth-160)/2, y: (height-160)/2, width: 160, height: 160,
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
