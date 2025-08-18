import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import qr from "qrcode";
import type { Team, TicketWithDetails } from "./types";
import { readFileSync } from "fs";
import { join } from "path";

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

// Helper to read local image file
function readLocalImage(path: string): Uint8Array | null {
  try {
    return readFileSync(path);
  } catch (error) {
    console.error("Error reading local image:", error);
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

// Base URL for team logos in Supabase storage (if used)
const SUPABASE_TEAM_LOGO_BASE_URL =
  "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/team-logo//";

// Add this small helper near your other utils:
function formatDateLt(dateISO: string, timeStr: string) {
  const d = new Date(dateISO);
  const months = [
    "Sausio",
    "Vasario",
    "Kovo",
    "Balandžio",
    "Gegužės",
    "Birželio",
    "Liepos",
    "Rugpjūčio",
    "Rugsėjo",
    "Spalio",
    "Lapkričio",
    "Gruodžio",
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  return `${month} ${day}d, ${timeStr}`;
}

// Replace your current generateTicketPDF with this one:
export async function generateTicketPDF(
  ticket: TicketWithDetails,
  team1?: Team,
  team2?: Team,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Canvas — wide ticket (similar proportions to your reference)
  const width = 1600;
  const height = 700;
  const page = pdfDoc.addPage([width, height]);

  // Colors
  const white = rgb(1, 1, 1);
  const gray = rgb(0.65, 0.68, 0.72);

  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Load and embed the background image
  try {
    const backgroundImageBytes = readLocalImage("public/ticketbg.jpg");
    if (backgroundImageBytes) {
      const backgroundImage = await pdfDoc.embedJpg(backgroundImageBytes);

      // Draw the background image to fill the entire page
      page.drawImage(backgroundImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }
  } catch (error) {
    console.error("Error loading background image:", error);
    // Fallback: draw a navy background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(10 / 255, 22 / 255, 91 / 255), // #0A165B
    });
  }

  // Content coordinates tuned for background image
  const perfX = Math.round(width * 0.66);
  const leftX = 120; // left margin inside navy panel
  const leftMaxX = perfX - 140; // keep distance from dashed line
  const leftWidth = leftMaxX - leftX;
  const rightX = perfX + 90; // start of right column (QR)

  // -------- Header: centered title with optional logos --------
  const headerLabelY = height - 120;
  page.drawText(replaceUnsupportedChars("Rungtynės"), {
    x: leftX,
    y: headerLabelY,
    size: 18,
    font,
    color: white,
  });

  // logos and title
  const title = replaceUnsupportedChars(
    team1 && team2
      ? `${team1.team_name} – ${team2.team_name}`
      : ticket.event.title,
  );
  const titleSize = 42;
  const titleWidth = bold.widthOfTextAtSize(title, titleSize);
  const logoSize = 46;
  const logoGap = 16;

  const [logo1Bytes, logo2Bytes] = await Promise.all([
    (async () => {
      if (!team1) return null;
      const u = (team1 as any).logo || (team1 as any).logo_url;
      return u ? fetchImage(u) : null;
    })(),
    (async () => {
      if (!team2) return null;
      const u = (team2 as any).logo || (team2 as any).logo_url;
      return u ? fetchImage(u) : null;
    })(),
  ]);
  let logo1Img = logo1Bytes
    ? await pdfDoc.embedPng(logo1Bytes).catch(async () =>
      await pdfDoc.embedJpg(logo1Bytes!)
    )
    : null;
  let logo2Img = logo2Bytes
    ? await pdfDoc.embedPng(logo2Bytes).catch(async () =>
      await pdfDoc.embedJpg(logo2Bytes!)
    )
    : null;

  const totalTitleW = (logo1Img ? logoSize + logoGap : 0) + titleWidth +
    (logo2Img ? logoGap + logoSize : 0);
  const titleAreaCenterX = leftX + leftWidth / 2;
  let cursorX = titleAreaCenterX - totalTitleW / 2;
  const titleY = headerLabelY - 36;

  if (logo1Img) {
    page.drawImage(logo1Img, {
      x: cursorX,
      y: titleY - 6,
      width: logoSize,
      height: logoSize,
    });
    cursorX += logoSize + logoGap;
  }
  page.drawText(title, {
    x: cursorX,
    y: titleY,
    size: titleSize,
    font: bold,
    color: white,
  });
  cursorX += titleWidth;
  if (logo2Img) {
    cursorX += logoGap;
    page.drawImage(logo2Img, {
      x: cursorX,
      y: titleY - 6,
      width: logoSize,
      height: logoSize,
    });
  }

  // -------- Left column rows (fixed Y) --------
  const row1Y = 480; // Location
  const row2Y = 380; // Time + Price
  const row3Y = 280; // Purchaser name
  const emailY = 245; // Purchaser email

  const label = (text: string, x: number, y: number) =>
    page.drawText(replaceUnsupportedChars(text), {
      x,
      y,
      size: 15,
      font,
      color: rgb(0.75, 0.77, 0.83),
    });
  const value = (text: string, x: number, y: number, size = 30) =>
    page.drawText(replaceUnsupportedChars(text), {
      x,
      y,
      size,
      font: bold,
      color: white,
    });

  // Row 1: Vieta
  label("Vieta", leftX, row1Y + 18);
  value(ticket.event.location, leftX, row1Y, 32);

  // Row 2: Laikas (left) and Bilieto tipas ir kaina (right)
  const midX = leftX + Math.floor(leftWidth * 0.52);
  label("Laikas", leftX, row2Y + 18);
  value(formatDateLt(ticket.event.date, ticket.event.time), leftX, row2Y, 30);
  label("Bilieto tipas ir kaina", midX, row2Y + 18);
  value(
    `${ticket.tier.name} / €${ticket.tier.price.toFixed(0)}`,
    midX,
    row2Y,
    30,
  );

  // Row 3: Pirkejas + email
  label("Pirkejas", leftX, row3Y + 18);
  value(ticket.purchaserName, leftX, row3Y, 28);
  page.drawText(replaceUnsupportedChars(ticket.purchaserEmail), {
    x: leftX,
    y: emailY,
    size: 16,
    font,
    color: white,
  });

  // -------- Right column QR block --------
  const qrSize = 300;
  const qrBottom = 320; // vertical position
  const cardX = rightX;

  try {
    const qrBytes = await qr.toBuffer(ticket.id, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qrImg = await pdfDoc.embedPng(qrBytes);
    page.drawRectangle({
      x: cardX - 10,
      y: qrBottom - 10,
      width: qrSize + 20,
      height: qrSize + 20,
      color: white,
      borderRadius: 12,
    });
    page.drawImage(qrImg, {
      x: cardX,
      y: qrBottom,
      width: qrSize,
      height: qrSize,
    });

    page.drawText(replaceUnsupportedChars("QR kodas"), {
      x: cardX,
      y: qrBottom - 40,
      size: 20,
      font: bold,
      color: white,
    });
    page.drawText(replaceUnsupportedChars("Skenuokite prie iejimo"), {
      x: cardX,
      y: qrBottom - 65,
      size: 14,
      font,
      color: white,
    });
  } catch {}

  // Footer ID
  page.drawText(`ID: ${ticket.id}`, {
    x: leftX,
    y: 30,
    size: 10,
    font,
    color: white,
  });

  return await pdfDoc.save();
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
