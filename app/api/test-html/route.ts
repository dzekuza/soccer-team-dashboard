export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        console.log("[test-html] Route called");
        
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
  <h1>Test HTML Route</h1>
  <div class="test">Route is working!</div>
  <div class="test">Time: ${new Date().toISOString()}</div>
  <div class="test">URL: ${request.url}</div>
</body>
</html>`;

        console.log("[test-html] Returning HTML");

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (err: any) {
        console.error("[test-html] error", err);
        return NextResponse.json({ 
            error: "Failed to generate HTML", 
            details: err.message,
        }, {
            status: 500,
        });
    }
}
