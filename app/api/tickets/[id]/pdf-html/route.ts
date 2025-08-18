export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { dbService } from "@/lib/db-service";
import { renderTicketHtml } from "@/lib/ticket-html";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const ticket = await dbService.getTicketWithDetails(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const html = await renderTicketHtml({ ticket, origin });

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1600, height: 700, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: "1600px",
      height: "700px",
      pageRanges: "1",
      preferCSSPageSize: true,
    });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ticket-${ticket.id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("[pdf-html] generation error", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
