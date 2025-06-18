import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import type { TicketWithDetails, Team } from './types'
import { formatCurrency } from './utils'

// Helper to fetch image as Uint8Array
async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return new Uint8Array(await res.arrayBuffer())
  } catch {
    return null
  }
}

// Helper to replace unsupported Lithuanian characters with ASCII equivalents
function replaceUnsupportedChars(str: string): string {
  return str
    .replace(/ų/g, 'u')
    .replace(/ū/g, 'u')
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/ė/g, 'e')
    .replace(/į/g, 'i')
    .replace(/ą/g, 'a')
    .replace(/Ų/g, 'U')
    .replace(/Ū/g, 'U')
    .replace(/Č/g, 'C')
    .replace(/Š/g, 'S')
    .replace(/Ž/g, 'Z')
    .replace(/Ė/g, 'E')
    .replace(/Į/g, 'I')
    .replace(/Ą/g, 'A')
}

const SUPABASE_TEAM_LOGO_BASE_URL = 'https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//';

export async function generateTicketPDF(
  ticket: TicketWithDetails,
  team1?: Team,
  team2?: Team
): Promise<Uint8Array> {
  console.log('Ticket passed to PDF generator:', ticket);
  console.log('team1_id:', ticket.team1_id, 'team2_id:', ticket.team2_id);
  console.log('Fetched team1:', team1);
  console.log('Fetched team2:', team2);
  const pdfDoc = await PDFDocument.create()
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

  // Backgrounds
  page.drawRectangle({ x: 0, y: 0, width: blueWidth, height, color: mainBg })

  // Orange section: use image if available, else solid color
  const bgImageBytes = await fetchImage('/bg%20qr.jpg')
  if (bgImageBytes) {
    try {
      const bgImage = await pdfDoc.embedJpg(bgImageBytes)
      page.drawImage(bgImage, {
        x: blueWidth, y: 0, width: orangeWidth, height,
      })
    } catch {
      page.drawRectangle({ x: blueWidth, y: 0, width: orangeWidth, height, color: orange })
    }
  } else {
    page.drawRectangle({ x: blueWidth, y: 0, width: orangeWidth, height, color: orange })
  }

  // Use built-in Helvetica font
  const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // League logo (static or placeholder)
  const leagueLogoUrl = 'https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//pic.logo-topsport-no-bg-1.png'
  const leagueLogoBytes = await fetchImage(leagueLogoUrl)
  if (leagueLogoBytes) {
    try {
      const logoImage = await pdfDoc.embedPng(leagueLogoBytes)
      page.drawImage(logoImage, {
        x: 24, y: height - 24 - 48, width: 64, height: 48,
      })
    } catch {}
  }

  // === Constants ===
  const logoSize = 56
  const nameFontSize = 10
  const groupGap = 8
  const groupHeight = logoSize + groupGap + nameFontSize
  const groupY = height - 120

  // === TEAM 1 ===
  // Only use real logo; if missing, do not display any logo
  let team1LogoUrl = team1?.logo
    ? (team1.logo.startsWith('http') ? team1.logo : SUPABASE_TEAM_LOGO_BASE_URL + team1.logo.replace(/^\/+/, ''))
    : undefined;
  if (team1LogoUrl) {
    const logoBytes = await fetchImage(team1LogoUrl)
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: 50,
          y: groupY + nameFontSize + groupGap + 10,
          width: logoSize,
          height: logoSize,
        })
      } catch {}
    }
  }
  // Draw team1 name in bold, larger font, with white shadow for contrast
  const team1Name = replaceUnsupportedChars(team1?.team_name || '')
  const teamNameFontSize = 18
  // Shadow
  page.drawText(team1Name, {
    x: 50 + 1,
    y: groupY - 8 - 1,
    size: teamNameFontSize,
    font: customFont,
    color: rgb(1,1,1),
  })
  // Main text
  page.drawText(team1Name, {
    x: 50,
    y: groupY - 8,
    size: teamNameFontSize,
    font: customFont,
    color: mainBg,
  })

  // === TEAM 2 ===
  // Only use real logo; if missing, do not display any logo
  let team2LogoUrl = team2?.logo
    ? (team2.logo.startsWith('http') ? team2.logo : SUPABASE_TEAM_LOGO_BASE_URL + team2.logo.replace(/^\/+/, ''))
    : undefined;
  if (team2LogoUrl) {
    const logoBytes = await fetchImage(team2LogoUrl)
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: blueWidth - logoSize - 50,
          y: groupY + nameFontSize + groupGap + 10,
          width: logoSize,
          height: logoSize,
        })
      } catch {}
    }
  }
  // Draw team2 name in bold, larger font, with white shadow for contrast
  const team2Name = replaceUnsupportedChars(team2?.team_name || '')
  // Shadow
  page.drawText(team2Name, {
    x: blueWidth - 120 + 1,
    y: groupY - 8 - 1,
    size: teamNameFontSize,
    font: customFont,
    color: rgb(1,1,1),
  })
  // Main text
  page.drawText(team2Name, {
    x: blueWidth - 120,
    y: groupY - 8,
    size: teamNameFontSize,
    font: customFont,
    color: mainBg,
  })

  // === "prieš" text ===
  const vsText = 'prieš'
  const vsFontSize = 16
  const vsWidth = customFont.widthOfTextAtSize(vsText, vsFontSize)
  page.drawText(vsText, {
    x: (blueWidth - vsWidth) / 2,
    y: groupY + logoSize / 2 + nameFontSize / 2,
    size: vsFontSize,
    font: customFont,
    color: white,
  })

  // Event start (large orange)
  page.drawText(`RUNGtyniu PRADzIA: ${ticket.event.time}`, {
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
    x: 40, y: 20, size: 12, font: customFont, color: white,
  })
  page.drawText((ticket.tier.name || '').toUpperCase(), {
    x: 180, y: 20, size: 12, font: customFont, color: white,
  })

  // QR code (centered in orange section)
  if (!ticket.qr_code_url || typeof ticket.qr_code_url !== 'string' || ticket.qr_code_url.trim() === '') {
    throw new Error(`Ticket ${ticket.id}: Missing or empty qr_code_url for QR code generation.`)
  }
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code_url, { width: 180, margin: 1 })
  const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), c => c.charCodeAt(0))
  const qrImage = await pdfDoc.embedPng(qrImageBytes)
  page.drawImage(qrImage, {
    x: blueWidth + (orangeWidth-160)/2, y: (height-160)/2, width: 160, height: 160,
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Helper for browser: convert Uint8Array to Blob for download
 */
export function uint8ArrayToPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes], { type: 'application/pdf' });
}
