import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import qr from "qrcode";
import type { Team, TicketWithDetails } from "./types";
import { formatCurrency } from "./utils";
import fontkit from "@pdf-lib/fontkit";
import { QRCodeService } from "./qr-code-service";

// Helper to fetch image as Uint8Array
async function fetchImage(url: string | undefined): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

// Helper to replace unsupported Lithuanian characters with ASCII equivalents
function replaceUnsupportedChars(str: string | undefined): string {
  if (!str) return "";

  return str
    .replace(/ą/g, "a")
    .replace(/č/g, "c")
    .replace(/ę/g, "e")
    .replace(/ė/g, "e")
    .replace(/į/g, "i")
    .replace(/š/g, "s")
    .replace(/ų/g, "u")
    .replace(/ū/g, "u")
    .replace(/ž/g, "z")
    .replace(/Ą/g, "A")
    .replace(/Č/g, "C")
    .replace(/Ę/g, "E")
    .replace(/Ė/g, "E")
    .replace(/Į/g, "I")
    .replace(/Š/g, "S")
    .replace(/Ų/g, "U")
    .replace(/Ū/g, "U")
    .replace(/Ž/g, "Z");
}

// Don't replace characters if we have a good font
const SUPABASE_TEAM_LOGO_BASE_URL =
  "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//";

export async function generateTicketPDF(
  ticket: TicketWithDetails,
  team1?: Team,
  team2?: Team,
): Promise<Uint8Array> {
  // Revert to previous wide ticket design
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const width = 842, height = 400; // A4 landscape proportions
  const page = pdfDoc.addPage([width, height]);

  // Colors matching your design
  const mainBlue = rgb(10 / 255, 22 / 255, 91 / 255); // #0A165B
  const orange = rgb(241 / 255, 86 / 255, 1 / 255); // #F15601
  const white = rgb(1, 1, 1);
  const lightGray = rgb(0.95, 0.95, 0.97);
  const darkGray = rgb(0.4, 0.4, 0.5);
  const mediumGray = rgb(0.6, 0.6, 0.65);

  // Get ticket type colors
  function getTicketTypeColors(ticketType: string) {
    const type = ticketType?.toLowerCase() || "normal";
    if (type.includes("vip")) {
      return { bg: orange, text: white };
    } else if (type.includes("premium")) {
      return { bg: rgb(0.4, 0.4, 0.5), text: white };
    } else {
      return { bg: rgb(0.35, 0.35, 0.45), text: white };
    }
  }

  const ticketColors = getTicketTypeColors(ticket.tier?.name || "Normal");

  // Load custom font
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const fontUrl = `${siteUrl}/fonts/DMSans-Regular.ttf`;
  const fontBytes = await fetchImage(fontUrl);
  const customFont = await pdfDoc.embedFont(
    fontBytes || StandardFonts.Helvetica,
  );

  // === TICKET HEADER SECTION ===
  const headerHeight = 80;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: ticketColors.bg,
  });

  // Event title
  const eventTitle = ticket.event.title || "Futbolo rungtynės";
  page.drawText(eventTitle, {
    x: 40,
    y: height - 35,
    size: 24,
    font: customFont,
    color: ticketColors.text,
  });

  // === TICKET BODY SECTION ===
  const bodyY = height - headerHeight - 20;
  const bodyHeight = 280;
  const bodyX = 40;
  const bodyWidth = width - 80;

  // Background for body section
  page.drawRectangle({
    x: bodyX,
    y: bodyY - bodyHeight,
    width: bodyWidth,
    height: bodyHeight,
    color: white,
  });

  // === EVENT DETAILS ===
  let currentY = bodyY - 30;

  // Date and time
  const eventDate = ticket.event.date;
  const eventTime = ticket.event.time;
  page.drawText(`Data: ${eventDate}`, {
    x: bodyX + 20,
    y: currentY,
    size: 14,
    font: customFont,
    color: mainBlue,
  });
  currentY -= 25;

  if (eventTime) {
    page.drawText(`Laikas: ${eventTime}`, {
      x: bodyX + 20,
      y: currentY,
      size: 14,
      font: customFont,
      color: mainBlue,
    });
    currentY -= 25;
  }

  // Location
  const eventLocation = ticket.event.location;
  page.drawText(`Vieta: ${eventLocation}`, {
    x: bodyX + 20,
    y: currentY,
    size: 14,
    font: customFont,
    color: mainBlue,
  });
  currentY -= 40;

  // === TEAM INFORMATION ===
  if (team1 && team2) {
    page.drawText(`${team1.team_name} vs ${team2.team_name}`, {
      x: bodyX + 20,
      y: currentY,
      size: 18,
      font: customFont,
      color: mainBlue,
    });
    currentY -= 40;
  }

  // === TICKET HOLDER INFORMATION ===
  page.drawText(`Bilieto savininkas: ${ticket.purchaserName}`, {
    x: bodyX + 20,
    y: currentY,
    size: 14,
    font: customFont,
    color: mainBlue,
  });
  currentY -= 25;

  page.drawText(`El. paštas: ${ticket.purchaserEmail}`, {
    x: bodyX + 20,
    y: currentY,
    size: 14,
    font: customFont,
    color: mainBlue,
  });
  currentY -= 40;

  // === TICKET TYPE AND PRICE ===
  const tierName = ticket.tier.name;
  const tierPrice = ticket.tier.price;
  page.drawText(`Bilieto tipas: ${tierName}`, {
    x: bodyX + 20,
    y: currentY,
    size: 16,
    font: customFont,
    color: mainBlue,
  });
  currentY -= 25;

  page.drawText(`Kaina: €${tierPrice.toFixed(2)}`, {
    x: bodyX + 20,
    y: currentY,
    size: 16,
    font: customFont,
    color: orange,
  });

  // === QR CODE SECTION ===
  const qrY = bodyY - 100;

  // Generate enhanced QR code with comprehensive data
  const qrCodeValue = await QRCodeService.updateTicketQRCode(ticket);

  try {
    // Generate QR code with better error correction and size
    const qrImageBytes = await qr.toBuffer(qrCodeValue, {
      width: 150,
      margin: 2,
      errorCorrectionLevel: "H", // High error correction
      color: {
        dark: "#0A165B", // Main blue color
        light: "#FFFFFF",
      },
    });

    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // Draw QR code with better positioning and size
    const qrSize = 140;
    const qrX = width - qrSize - 40;
    const qrYPos = qrY - 30;

    // Draw QR code background (white rectangle)
    page.drawRectangle({
      x: qrX - 10,
      y: qrYPos - 10,
      width: qrSize + 20,
      height: qrSize + 40,
      color: white,
    });

    // Draw QR code
    page.drawImage(qrImage, {
      x: qrX,
      y: qrYPos,
      width: qrSize,
      height: qrSize,
    });

    // QR Code title
    page.drawText("QR KODAS", {
      x: qrX,
      y: qrYPos + qrSize + 15,
      size: 12,
      font: customFont,
      color: mainBlue,
    });

    // QR Code subtitle
    page.drawText("Skenuokite įėjimui", {
      x: qrX,
      y: qrYPos + qrSize + 5,
      size: 8,
      font: customFont,
      color: darkGray,
    });

    // Ticket ID below QR code
    const ticketIdText = ticket.id.slice(0, 16) + "...";
    page.drawText(ticketIdText, {
      x: qrX,
      y: qrYPos - 15,
      size: 8,
      font: customFont,
      color: darkGray,
    });
  } catch (error) {
    console.error(`Error generating QR code for ticket ${ticket.id}:`, error);

    // Fallback: draw a placeholder
    page.drawRectangle({
      x: width - 180,
      y: qrY - 50,
      width: 160,
      height: 160,
      color: lightGray,
    });

    page.drawText("QR Code Error", {
      x: width - 170,
      y: qrY + 60,
      size: 10,
      font: customFont,
      color: darkGray,
    });
  }

  // === PERFORATED EDGE EFFECT ===
  const perfY = bodyY - bodyHeight - 10;

  // Draw perforated dots
  for (let i = 0; i < 40; i++) {
    const dotX = 20 + (i * (width - 40) / 39);
    page.drawCircle({
      x: dotX,
      y: perfY,
      size: 2,
      color: lightGray,
    });
  }

  // === TICKET ID AND VALIDATION STATUS ===
  const ticketId = ticket.id;
  const validationStatus = ticket.isValidated ? "VALIDUOTAS" : "NEVALIDUOTAS";
  const statusColor = ticket.isValidated ? orange : darkGray;

  page.drawText(`Bilieto ID: ${ticketId}`, {
    x: bodyX + 20,
    y: bodyY - bodyHeight + 20,
    size: 10,
    font: customFont,
    color: darkGray,
  });

  page.drawText(`Statusas: ${validationStatus}`, {
    x: bodyX + 20,
    y: bodyY - bodyHeight + 10,
    size: 10,
    font: customFont,
    color: statusColor,
  });

  // === FOOTER ===
  const footerY = 30;
  page.drawText("FK Banga - Bilietų sistema", {
    x: bodyX + 20,
    y: footerY,
    size: 12,
    font: customFont,
    color: mainBlue,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function uint8ArrayToPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes], { type: "application/pdf" });
}

export async function generateSubscriptionPDF(subscription: {
  id: string;
  purchaser_name: string;
  purchaser_surname: string;
  purchaser_email: string;
  qr_code_url: string;
  valid_from?: string;
  valid_to?: string;
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([226.77, 453.54]); // 80mm x 160mm

  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Generate enhanced QR code for subscription
  const qrCodeValue = await QRCodeService.updateSubscriptionQRCode({
    id: subscription.id,
    purchaser_name: subscription.purchaser_name,
    purchaser_surname: subscription.purchaser_surname,
    purchaser_email: subscription.purchaser_email,
    valid_from: subscription.valid_from || new Date().toISOString(),
    valid_to: subscription.valid_to || new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  try {
    // Generate QR code with better styling
    const qrImage = await qr.toDataURL(qrCodeValue, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 150,
      margin: 2,
      color: {
        dark: "#0A165B", // Main blue color
        light: "#FFFFFF",
      },
    });
    const qrImageBytes = Buffer.from(qrImage.split(",")[1], "base64");
    const embeddedQrImage = await doc.embedPng(qrImageBytes);

    // Draw QR code with background
    page.drawRectangle({
      x: 35,
      y: 275,
      width: 160,
      height: 160,
      color: rgb(1, 1, 1), // White background
    });

    page.drawImage(embeddedQrImage, {
      x: 38,
      y: 280,
      width: 150,
      height: 150,
    });

    // QR Code label
    page.drawText("QR KODAS", {
      x: 38,
      y: 270,
      font,
      size: 10,
      color: rgb(0.04, 0.09, 0.36), // Main blue
    });

    // Subscription ID below QR code
    const subscriptionIdText = subscription.id.slice(0, 16) + "...";
    page.drawText(subscriptionIdText, {
      x: 38,
      y: 250,
      font,
      size: 8,
      color: rgb(0.4, 0.4, 0.5), // Dark gray
    });
  } catch (error) {
    console.error(
      `Error generating QR code for subscription ${subscription.id}:`,
      error,
    );

    // Fallback: draw a placeholder
    page.drawRectangle({
      x: 35,
      y: 275,
      width: 160,
      height: 160,
      color: rgb(0.95, 0.95, 0.97), // Light gray
    });

    page.drawText("QR Code Error", {
      x: 45,
      y: 350,
      font,
      size: 10,
      color: rgb(0.4, 0.4, 0.5), // Dark gray
    });
  }

  // Subscription details
  page.drawText("PRENUMERATA", {
    x: 38,
    y: 400,
    font,
    size: 16,
    color: rgb(0.04, 0.09, 0.36), // Main blue
  });

  page.drawText(
    `Savininkas: ${subscription.purchaser_name} ${subscription.purchaser_surname}`,
    {
      x: 38,
      y: 380,
      font,
      size: 10,
      color: rgb(0.04, 0.09, 0.36), // Main blue
    },
  );

  if (subscription.valid_from && subscription.valid_to) {
    page.drawText(`Galioja nuo: ${subscription.valid_from}`, {
      x: 38,
      y: 360,
      font,
      size: 8,
      color: rgb(0.4, 0.4, 0.5), // Dark gray
    });

    page.drawText(`Galioja iki: ${subscription.valid_to}`, {
      x: 38,
      y: 345,
      font,
      size: 8,
      color: rgb(0.4, 0.4, 0.5), // Dark gray
    });
  }

  const pdfBytes = await doc.save();
  return pdfBytes;
}
