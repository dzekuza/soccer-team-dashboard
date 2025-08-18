export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        console.log("[pdf-html] Processing ticket ID:", id);
        
        // Simple test HTML for now
        const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background: #0A165B; 
      color: white; 
    }
    .test { font-size: 24px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Ticket PDF Test</h1>
  <div class="test">Ticket ID: ${id}</div>
  <div class="test">Route is working!</div>
  <div class="test">Time: ${new Date().toISOString()}</div>
</body>
</html>`;

        console.log("[pdf-html] Returning test HTML");

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (err: any) {
        console.error("[pdf-html] generation error", err);
        console.error("[pdf-html] error stack:", err.stack);
        return NextResponse.json({ 
            error: "Failed to generate HTML", 
            details: err.message,
            stack: err.stack 
        }, {
            status: 500,
        });
    }
}
