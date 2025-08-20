import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";

export interface PDFGenerationOptions {
    html: string;
    width?: string;
    height?: string;
    format?: string;
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    margin?: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
}

export async function generatePDFFromHTML(
    options: PDFGenerationOptions,
): Promise<Buffer> {
    const {
        html,
        width = "1600px",
        height = "700px",
        format,
        printBackground = true,
        preferCSSPageSize = true,
        margin = { top: "0", right: "0", bottom: "0", left: "0" },
    } = options;

    let browser;

    try {
        // Try serverless-compatible approach first
        console.log("Attempting to launch browser with @sparticuz/chromium...");
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        console.log("Browser launched with @sparticuz/chromium successfully");
    } catch (error) {
        console.warn("Failed to launch with @sparticuz/chromium:", error);

        // Fallback to standard Puppeteer for local development
        try {
            console.log(
                "Attempting to launch browser with standard Puppeteer...",
            );
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--single-process",
                    "--disable-gpu",
                ],
            });
            console.log(
                "Browser launched with standard Puppeteer successfully",
            );
        } catch (fallbackError) {
            console.error(
                "Failed to launch browser with both methods:",
                fallbackError,
            );
            throw new Error("Could not launch browser for PDF generation");
        }
    }

    try {
        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({
            width: 1600,
            height: 700,
            deviceScaleFactor: 2,
        });

        // Set content and wait for resources to load
        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 15000,
        });

        // Wait for images and fonts to load
        await page.evaluate(() => {
            return Promise.all([
                ...Array.from(document.images).map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve, reject) => {
                        img.addEventListener("load", resolve);
                        img.addEventListener("error", reject);
                    });
                }),
                document.fonts.ready,
            ]);
        });

        // Additional wait to ensure everything is rendered
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate PDF
        const pdfOptions: any = {
            printBackground,
            preferCSSPageSize,
            margin,
        };

        if (format) {
            pdfOptions.format = format;
        } else {
            pdfOptions.width = width;
            pdfOptions.height = height;
        }

        const pdfBuffer = await page.pdf(pdfOptions);
        console.log("PDF generated successfully");

        return pdfBuffer as Buffer;
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed");
        }
    }
}
