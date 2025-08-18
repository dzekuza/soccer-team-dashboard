#!/usr/bin/env tsx

import puppeteer from "puppeteer";

export interface ScrapedFixture {
    rawText: string;
    teams: string[]; // [home, away]
    date: string | null;
    time: string | null;
    link: string;
}

function normalizeKey(s: string) {
    return (s || "").toLowerCase().normalize("NFD").replace(
        /[\u0300-\u036f]/g,
        "",
    );
}

export async function scrapeFromUrl(
    url: string,
    teamKeywords: string[],
): Promise<ScrapedFixture[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        await page.waitForSelector("body", { timeout: 15000 });

        // Inject helper to avoid bundler's __name reference inside evaluated functions
        await page.evaluate(() => {
            // @ts-ignore
            (window as any).__name = (o: any, _n: any) => o;
        });

        // Expand possible "Daugiau" sections
        await page.evaluate(async () => {
            const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
            for (let i = 0; i < 4; i++) {
                const buttons = Array.from(document.querySelectorAll("button"));
                const daugiauBtns = buttons.filter((b) =>
                    /daugiau/i.test((b.textContent || "").trim())
                );
                if (daugiauBtns.length === 0) break;
                for (const btn of daugiauBtns) {
                    try {
                        (btn as HTMLButtonElement).click();
                    } catch {}
                }
                await wait(800);
            }
        });

        const fixtures = await page.evaluate((teamKeywordsIn) => {
            const strip = (s: string) =>
                (s || "")
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();

            const includesAnyKeyword = (text: string) => {
                const t = strip(text);
                return teamKeywordsIn.some((kw: string) =>
                    t.includes(strip(kw))
                );
            };

            const results: ScrapedFixture[] = [];
            const tables = Array.from(
                document.querySelectorAll("table"),
            ) as HTMLTableElement[];

            const matchingTables: HTMLTableElement[] = [];
            for (const tbl of tables) {
                const ths = Array.from(
                    tbl.querySelectorAll("thead tr th, tr th"),
                ) as HTMLTableCellElement[];
                if (ths.length === 0) continue;
                const headerKey = ths.map((th) => strip(th.textContent || ""))
                    .join("|");
                if (
                    headerKey.includes("namu komanda") &&
                    (headerKey.includes("sveciu komanda") ||
                        headerKey.includes("sveciu"))
                ) {
                    matchingTables.push(tbl);
                }
            }

            for (const table of matchingTables) {
                const headerCells = Array.from(
                    table.querySelectorAll("thead tr th, tr th"),
                ) as HTMLTableCellElement[];
                const idxMap: Record<string, number> = {};
                for (let i = 0; i < headerCells.length; i++) {
                    const k = strip(headerCells[i].textContent || "");
                    if (k.includes("data")) idxMap.date = i;
                    if (k.includes("laikas")) idxMap.time = i;
                    if (
                        k.includes("stadionas") || k.includes("arena") ||
                        k.includes("vieta")
                    ) idxMap.venue = i;
                    if (k.includes("namu komanda")) idxMap.home = i;
                    if (k.includes("sveciu komanda") || k.includes("sveciu")) {
                        idxMap.away = i;
                    }
                }

                const rows = Array.from(table.querySelectorAll("tbody tr"));
                for (const row of rows) {
                    const tds = Array.from(row.querySelectorAll("td"));
                    if (tds.length === 0) continue;

                    const getCell = (key: string) => {
                        const idx = (idxMap as any)[key];
                        if (typeof idx !== "number") return "";
                        return (tds[idx].textContent || "").replace(/\s+/g, " ")
                            .trim();
                    };

                    const date = (getCell("date") || null) as string | null;
                    const time = (getCell("time") || null) as string | null;
                    const home = getCell("home");
                    const away = getCell("away");
                    const venue = getCell("venue");

                    if (!home || !away) continue;
                    if (
                        !includesAnyKeyword(home) && !includesAnyKeyword(away)
                    ) continue;

                    const raw = `${date || ""} ${time || ""} ${
                        venue || ""
                    } ${home} vs ${away}`.replace(/\s+/g, " ").trim();
                    results.push({
                        rawText: raw,
                        teams: [home, away],
                        date,
                        time,
                        link: window.location.href,
                    });
                }
            }

            return results;
        }, teamKeywords);

        await browser.close();
        return fixtures;
    } catch (error) {
        console.error("Scraping error:", error);
        await browser.close();
        return [];
    }
}

// Back-compat default: scrape FK Banga in A lyga page
export async function scrape(): Promise<ScrapedFixture[]> {
    return scrapeFromUrl(
        "https://www.lff.lt/varzybos/topsport-a-lyga-17256501/",
        ["banga"],
    );
}

// Scrape FK Banga B (II lyga A divizionas 2025)
export async function scrapeBangaB(): Promise<ScrapedFixture[]> {
    return scrapeFromUrl(
        "https://www.lff.lt/varzybos/ii-lyga-a-divizionas-2025-20708568/",
        ["banga b", "fk banga b", "banga-2", "banga ii"],
    );
}

if (require.main === module) {
    scrape().then((fixtures) => {
        console.log(`Found ${fixtures.length} Banga fixtures:`);
        fixtures.forEach((fixture, i) => {
            console.log(`${i + 1}. ${fixture.rawText}`);
        });
    });
}
