export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
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
            return NextResponse.json({ error: "Ticket not found" }, {
                status: 404,
            });
        }

        const origin = new URL(request.url).origin;
        const html = await renderTicketHtml({ ticket, origin });

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition":
                    `inline; filename="ticket-${ticket.id}.html"`,
            },
        });
    } catch (err: any) {
        console.error("[pdf-html] generation error", err);
        return NextResponse.json({ error: "Failed to generate ticket" }, {
            status: 500,
        });
    }
}
