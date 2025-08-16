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
    .replace(/Ž/g, "Z")
    // Additional characters that might cause issues
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/ń/g, "n")
    .replace(/Ń/g, "N")
    .replace(/ó/g, "o")
    .replace(/Ó/g, "O")
    .replace(/ś/g, "s")
    .replace(/Ś/g, "S")
    .replace(/ź/g, "z")
    .replace(/Ź/g, "Z")
    .replace(/ż/g, "z")
    .replace(/Ż/g, "Z");
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

  // Use standard font to avoid encoding issues
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // === TICKET HEADER SECTION ===
  const headerHeight = 80;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: ticketColors.bg,
  });

  // Event title in header
  const eventTitle = replaceUnsupportedChars(ticket.event.title);
  page.drawText(eventTitle, {
    x: 20,
    y: height - 35,
    size: 24,
    font: font,
    color: ticketColors.text,
  });

  // === TICKET BODY SECTION ===
  const bodyY = height - headerHeight - 20;
  const bodyHeight = height - headerHeight - 40;
  const leftColumnWidth = width * 0.6;
  const rightColumnWidth = width * 0.4;

  // Left column - Event details
  let currentY = bodyY;

  // Event date
  const eventDate = replaceUnsupportedChars(ticket.event.date);
  page.drawText(`Data: ${eventDate}`, {
    x: 20,
    y: currentY,
    size: 14,
    font: font,
    color: mainBlue,
  });
  currentY -= 20;

  // Event time
  const eventTime = replaceUnsupportedChars(ticket.event.time);
  page.drawText(`Laikas: ${eventTime}`, {
    x: 20,
    y: currentY,
    size: 14,
    font: font,
    color: mainBlue,
  });
  currentY -= 20;

  // Event location
  const eventLocation = replaceUnsupportedChars(ticket.event.location);
  page.drawText(`Vieta: ${eventLocation}`, {
    x: 20,
    y: currentY,
    size: 14,
    font: font,
    color: mainBlue,
  });
  currentY -= 30;

  // Teams (if available)
  if (team1 && team2) {
    const team1Name = replaceUnsupportedChars(team1.team_name);
    const team2Name = replaceUnsupportedChars(team2.team_name);
    page.drawText(`${team1Name} vs ${team2Name}`, {
      x: 20,
      y: currentY,
      size: 18,
      font: font,
      color: mainBlue,
    });
    currentY -= 30;
  }

  // Purchaser details
  const purchaserName = replaceUnsupportedChars(ticket.purchaserName);
  page.drawText(`Bilieto savininkas: ${purchaserName}`, {
    x: 20,
    y: currentY,
    size: 14,
    font: font,
    color: mainBlue,
  });
  currentY -= 20;

  const purchaserEmail = replaceUnsupportedChars(ticket.purchaserEmail);
  page.drawText(`El. pastas: ${purchaserEmail}`, {
    x: 20,
    y: currentY,
    size: 14,
    font: font,
    color: mainBlue,
  });
  currentY -= 30;

  // Ticket type and price
  const tierName = replaceUnsupportedChars(ticket.tier.name);
  page.drawText(`Bilieto tipas: ${tierName}`, {
    x: 20,
    y: currentY,
    size: 16,
    font: font,
    color: mainBlue,
  });
  currentY -= 20;

  const tierPrice = ticket.tier.price;
  page.drawText(`Kaina: €${tierPrice.toFixed(2)}`, {
    x: 20,
    y: currentY,
    size: 16,
    font: font,
    color: orange,
  });

  // === QR CODE SECTION ===
  const qrY = bodyY - 100;

  try {
    // Always use ticket ID for QR code to ensure consistency
    const qrImageBytes = await qr.toBuffer(ticket.id, {
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
      font: font,
      color: mainBlue,
    });

    // QR Code subtitle
    page.drawText("Skenuokite iejimui", {
      x: qrX,
      y: qrYPos + qrSize + 5,
      size: 8,
      font: font,
      color: darkGray,
    });

    // Ticket ID below QR code
    const ticketIdText = ticket.id.slice(0, 16) + "...";
    page.drawText(ticketIdText, {
      x: qrX,
      y: qrYPos - 15,
      size: 8,
      font: font,
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
      font: font,
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
    x: 20,
    y: bodyY - bodyHeight + 20,
    size: 10,
    font: font,
    color: darkGray,
  });

  page.drawText(`Statusas: ${validationStatus}`, {
    x: 20,
    y: bodyY - bodyHeight + 10,
    size: 10,
    font: font,
    color: statusColor,
  });

  // === FOOTER ===
  const footerY = 30;
  page.drawText("FK Banga - Bilietu sistema", {
    x: 20,
    y: footerY,
    size: 12,
    font: font,
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

  try {
    // Always use subscription ID for QR code to ensure consistency
    const qrImageBytes = await qr.toBuffer(subscription.id, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 150,
      margin: 2,
      color: {
        dark: "#0A165B", // Main blue color
        light: "#FFFFFF",
      },
    });

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

  // === SUBSCRIPTION DETAILS ===
  page.drawText("PRENUMERATA", {
    x: 38,
    y: 230,
    font,
    size: 14,
    color: rgb(0.04, 0.09, 0.36), // Main blue
  });

  const purchaserName = replaceUnsupportedChars(subscription.purchaser_name);
  const purchaserSurname = replaceUnsupportedChars(
    subscription.purchaser_surname,
  );
  page.drawText(
    `${purchaserName} ${purchaserSurname}`,
    {
      x: 38,
      y: 210,
      font,
      size: 12,
      color: rgb(0.04, 0.09, 0.36), // Main blue
    },
  );

  const purchaserEmail = replaceUnsupportedChars(subscription.purchaser_email);
  page.drawText(`El. pastas: ${purchaserEmail}`, {
    x: 38,
    y: 190,
    font,
    size: 10,
    color: rgb(0.4, 0.4, 0.5), // Dark gray
  });

  const validFrom = replaceUnsupportedChars(subscription.valid_from);
  page.drawText(`Galioja nuo: ${validFrom}`, {
    x: 38,
    y: 170,
    font,
    size: 10,
    color: rgb(0.4, 0.4, 0.5), // Dark gray
  });

  const validTo = replaceUnsupportedChars(subscription.valid_to);
  page.drawText(`Galioja iki: ${validTo}`, {
    x: 38,
    y: 150,
    font,
    size: 10,
    color: rgb(0.4, 0.4, 0.5), // Dark gray
  });

  const pdfBytes = await doc.save();
  return pdfBytes;
}
