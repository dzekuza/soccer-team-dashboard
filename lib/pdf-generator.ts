import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import qr from 'qrcode'
import type { TicketWithDetails, Team } from './types'
import { formatCurrency } from './utils'
import fontkit from '@pdf-lib/fontkit'

// Helper to fetch image as Uint8Array
async function fetchImage(url: string | undefined): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

// Helper to replace unsupported Lithuanian characters with ASCII equivalents
function replaceUnsupportedChars(str: string | undefined): string {
  if (!str) return '';
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

// Don't replace characters if we have a good font
const SUPABASE_TEAM_LOGO_BASE_URL = 'https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//';

export async function generateTicketPDF(
  ticket: TicketWithDetails,
  team1?: Team,
  team2?: Team
): Promise<Uint8Array> {
  // Revert to previous wide ticket design
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const width = 842, height = 400 // A4 landscape proportions
  const page = pdfDoc.addPage([width, height])

  // Colors matching your design
  const mainBlue = rgb(10/255, 22/255, 91/255) // #0A165B
  const orange = rgb(241/255, 86/255, 1/255) // #F15601
  const white = rgb(1, 1, 1)
  const lightGray = rgb(0.95, 0.95, 0.97)
  const darkGray = rgb(0.4, 0.4, 0.5)
  const mediumGray = rgb(0.6, 0.6, 0.65)

  // Get ticket type colors
  function getTicketTypeColors(ticketType: string) {
    const type = ticketType?.toLowerCase() || 'normal';
    if (type.includes('vip')) {
      return { bg: orange, text: white };
    } else if (type.includes('premium')) {
      return { bg: rgb(0.4, 0.4, 0.5), text: white };
    } else {
      return { bg: rgb(0.35, 0.35, 0.45), text: white };
    }
  }

  const ticketColors = getTicketTypeColors(ticket.tier.name || 'Normal');

  // Load custom font
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const fontUrl = `${siteUrl}/fonts/DMSans-Regular.ttf`
  const fontBytes = await fetchImage(fontUrl)
  const customFont = await pdfDoc.embedFont(fontBytes || StandardFonts.Helvetica)

  // === TICKET HEADER SECTION ===
  const headerHeight = 80;
  page.drawRectangle({ 
    x: 0, y: height - headerHeight, 
    width: width, height: headerHeight, 
    color: ticketColors.bg 
  });

  // Event title
  const eventTitle = ticket.event.title || 'Futbolo rungtynės';
  page.drawText(eventTitle, {
    x: 40, y: height - 35, 
    size: 24, font: customFont, color: ticketColors.text,
  });

  // Ticket type badge
  const ticketTypeText = `${ticket.tier.name?.toUpperCase() || 'NORMAL'} BILIETAS`;
  page.drawText(ticketTypeText, {
    x: 40, y: height - 60, 
    size: 12, font: customFont, color: ticketColors.text,
  });

  // Price (top right)
  const priceText = typeof ticket.tier.price === 'number' ? `€${ticket.tier.price.toFixed(2)}` : '€0.00';
  const priceWidth = customFont.widthOfTextAtSize(priceText, 18);
  page.drawText(priceText, {
    x: width - priceWidth - 40, y: height - 35,
    size: 18, font: customFont, color: ticketColors.text,
  });

  // Seat info (top right)
  const seatText = 'Vieta nenurodyta';
  const seatWidth = customFont.widthOfTextAtSize(seatText, 12);
  page.drawText(seatText, {
    x: width - seatWidth - 40, y: height - 58,
    size: 12, font: customFont, color: ticketColors.text,
  });

  // === MAIN BODY SECTION ===
  const bodyY = height - headerHeight;
  const bodyHeight = 280;
  
  // Main body background
  page.drawRectangle({ 
    x: 0, y: bodyY - bodyHeight, 
    width: width, height: bodyHeight, 
    color: white 
  });

  // === TEAMS SECTION ===
  const teamsY = bodyY - 80;
  const logoSize = 64;

  // Team 1
  const team1Name = team1?.team_name || 'Komanda 1';
  let team1LogoUrl = team1?.logo
    ? (team1.logo.startsWith('http') ? team1.logo : SUPABASE_TEAM_LOGO_BASE_URL + team1.logo.replace(/^\/+/, ''))
    : undefined;
  
  if (team1LogoUrl) {
    const logoBytes = await fetchImage(team1LogoUrl)
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: 120, y: teamsY - logoSize,
          width: logoSize, height: logoSize,
        })
      } catch {}
    }
  }
  
  // Team 1 name
  const team1Width = customFont.widthOfTextAtSize(team1Name, 16);
  page.drawText(team1Name, {
    x: 120 + (logoSize - team1Width) / 2, y: teamsY - logoSize - 25,
    size: 16, font: customFont, color: mainBlue,
  });

  // VS text
  const vsText = 'PRIEŠ';
  const vsWidth = customFont.widthOfTextAtSize(vsText, 20);
  page.drawText(vsText, {
    x: (width - vsWidth) / 2, y: teamsY - 35,
    size: 20, font: customFont, color: darkGray,
  });

  // VS line
  page.drawRectangle({
    x: (width - 60) / 2, y: teamsY - 50,
    width: 60, height: 2, color: mediumGray
  });

  // Team 2
  const team2Name = team2?.team_name || 'Komanda 2';
  let team2LogoUrl = team2?.logo
    ? (team2.logo.startsWith('http') ? team2.logo : SUPABASE_TEAM_LOGO_BASE_URL + team2.logo.replace(/^\/+/, ''))
    : undefined;
  
  if (team2LogoUrl) {
    const logoBytes = await fetchImage(team2LogoUrl)
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, {
          x: width - 120 - logoSize, y: teamsY - logoSize,
          width: logoSize, height: logoSize,
        })
      } catch {}
    }
  }
  
  // Team 2 name
  const team2Width = customFont.widthOfTextAtSize(team2Name, 16);
  page.drawText(team2Name, {
    x: width - 120 - logoSize + (logoSize - team2Width) / 2, y: teamsY - logoSize - 25,
    size: 16, font: customFont, color: mainBlue,
  });

  // === SEPARATOR LINE ===
  page.drawRectangle({
    x: 40, y: teamsY - 140,
    width: width - 80, height: 1, color: mediumGray
  });

  // === MATCH DETAILS SECTION ===
  const detailsY = teamsY - 180;
  const detailSpacing = (width - 80) / 4;

  // Date
  page.drawText('DATA', {
    x: 40, y: detailsY + 15,
    size: 10, font: customFont, color: darkGray,
  });
  page.drawText(ticket.event.date || '', {
    x: 40, y: detailsY - 5,
    size: 14, font: customFont, color: mainBlue,
  });

  // Time
  page.drawText('LAIKAS', {
    x: 40 + detailSpacing, y: detailsY + 15,
    size: 10, font: customFont, color: darkGray,
  });
  page.drawText(ticket.event.time || '', {
    x: 40 + detailSpacing, y: detailsY - 5,
    size: 14, font: customFont, color: mainBlue,
  });

  // Location
  page.drawText('MIESTAS', {
    x: 40 + detailSpacing * 2, y: detailsY + 15,
    size: 10, font: customFont, color: darkGray,
  });
  page.drawText(replaceUnsupportedChars(ticket.event.location || ''), {
    x: 40 + detailSpacing * 2, y: detailsY - 5,
    size: 14, font: customFont, color: mainBlue,
  });

  // Venue
  page.drawText('STADIONAS', {
    x: 40, y: detailsY - 40,
    size: 10, font: customFont, color: darkGray,
  });
  page.drawText(replaceUnsupportedChars(ticket.event.location || ''), {
    x: 40, y: detailsY - 60,
    size: 14, font: customFont, color: mainBlue,
  });

  // === QR CODE SECTION ===
  const qrY = detailsY - 120;
  
  // Gate info
  page.drawText('VARTAI', {
    x: 40, y: qrY + 20,
    size: 10, font: customFont, color: darkGray,
  });
  page.drawText('A', {
    x: 40, y: qrY,
    size: 14, font: customFont, color: mainBlue,
  });

  // Ticket ID
  page.drawText('BILIETO ID', {
    x: 40, y: qrY - 25,
    size: 10, font: customFont, color: darkGray,
  });
  const ticketIdText = ticket.id.slice(0, 16) + '...';
  page.drawText(ticketIdText, {
    x: 40, y: qrY - 45,
    size: 10, font: customFont, color: darkGray,
  });

  // QR Code
  const qrCodeValue = ticket.id;
  try {
    const qrCodeDataUrl = await qr.toDataURL(qrCodeValue, { width: 120, margin: 1 })
    const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), c => c.charCodeAt(0))
    const qrImage = await pdfDoc.embedPng(qrImageBytes)
    page.drawImage(qrImage, {
      x: width - 160, y: qrY - 40, width: 120, height: 120,
    })
    
    // QR Code label
    page.drawText('Skenuokite įėjimui', {
      x: width - 150, y: qrY - 55,
      size: 8, font: customFont, color: darkGray,
    });
  } catch (error) {
    console.error(`Error generating QR code for ticket ${ticket.id}:`, error)
  }

  // === PERFORATED EDGE EFFECT ===
  const perfY = bodyY - bodyHeight - 10;
  
  // Draw perforated dots
  for (let i = 0; i < 40; i++) {
    const dotX = 20 + (i * (width - 40) / 39);
    page.drawCircle({
      x: dotX, y: perfY,
      size: 2, color: mediumGray
    });
  }

  // === STUB SECTION ===
  const stubHeight = 50;
  page.drawRectangle({ 
    x: 0, y: 0, 
    width: width, height: stubHeight, 
    color: lightGray 
  });

  // Stub dashed border
  const dashLength = 8;
  const gapLength = 4;
  for (let x = 0; x < width; x += dashLength + gapLength) {
    page.drawRectangle({
      x: x, y: stubHeight,
      width: Math.min(dashLength, width - x), height: 1,
      color: mediumGray
    });
  }

  // Stub content
  const stubText = `${team1Name} vs ${team2Name}`;
  page.drawText(stubText, {
    x: 40, y: 30,
    size: 12, font: customFont, color: darkGray,
  });

  const stubDetails = `${ticket.event.date || ''}`;
  page.drawText(stubDetails, {
    x: 40, y: 10,
    size: 10, font: customFont, color: darkGray,
  });

  // Stub right side
  const stubType = ticket.tier.name?.toUpperCase() || 'NORMAL';
  const stubTypeWidth = customFont.widthOfTextAtSize(stubType, 10);
  page.drawText(stubType, {
    x: width - stubTypeWidth - 40, y: 30,
    size: 10, font: customFont, color: darkGray,
  });

  const stubPriceWidth = customFont.widthOfTextAtSize(priceText, 12);
  page.drawText(priceText, {
    x: width - stubPriceWidth - 40, y: 10,
    size: 12, font: customFont, color: darkGray,
  });

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

/**
 * Helper for browser: convert Uint8Array to Blob for download
 */
export function uint8ArrayToPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function generateSubscriptionPDF(subscription: {
  id: string;
  purchaser_name: string;
  purchaser_surname: string;
  purchaser_email: string;
  qr_code_url: string;
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([226.77, 453.54]); // 80mm x 160mm

  const font = await doc.embedFont(StandardFonts.Helvetica);

  // QR Code
  const qrCodeValue = subscription.qr_code_url || subscription.id;
  const qrImage = await qr.toDataURL(qrCodeValue, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 150,
    margin: 1,
  });
  const qrImageBytes = Buffer.from(qrImage.split(",")[1], "base64");
  const embeddedQrImage = await doc.embedPng(qrImageBytes);

  page.drawImage(embeddedQrImage, {
    x: 38,
    y: 280,
    width: 150,
    height: 150,
  });

  // Details
  page.drawText("Subscription Confirmation", {
    x: 30,
    y: 240,
    font,
    size: 16,
    color: rgb(0, 0, 0),
  });

  const detailsY = 200;
  const details = [
    `Name: ${subscription.purchaser_name} ${subscription.purchaser_surname}`,
    `Email: ${subscription.purchaser_email}`,
    `ID: ${subscription.id}`,
  ];

  details.forEach((text, i) => {
    page.drawText(text, {
      x: 30,
      y: detailsY - i * 20,
      font,
      size: 10,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  return doc.save();
}
