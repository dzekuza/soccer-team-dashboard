#!/usr/bin/env tsx

import { generatePDFFromHTML } from "../lib/pdf-service";

async function testPDFGeneration() {
  console.log("Testing PDF generation service...");

  try {
    // Test with a simple HTML
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Test PDF Generation</h1>
          <p>This is a test to verify that the PDF generation service is working correctly.</p>
          <p>If you can see this PDF, the setup is working!</p>
        </body>
      </html>
    `;

    console.log("Generating PDF...");
    const pdfBuffer = await generatePDFFromHTML({
      html: testHtml,
      format: "A4",
      printBackground: true,
    });

    console.log(`PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
    console.log("✅ Test passed! PDF generation is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testPDFGeneration();
