#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { scrape, scrapeBangaB, ScrapedFixture } from "./scrape-banga-fixtures";

dotenv.config({ path: ".env.local" });

function normalize(str?: string | null) {
    return (str || "").replace(/\s+/g, " ").trim();
}

function parseDate(dateText: string | null | undefined): string | null {
    if (!dateText) return null;

    try {
        // Try different date formats
        const dateStr = dateText.trim();

        // Format: YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().slice(0, 10);
            }
        }

        // Format: YYYY MM DD
        if (/^\d{4}\s+\d{2}\s+\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split(/\s+/);
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
            );
            if (!isNaN(date.getTime())) {
                return date.toISOString().slice(0, 10);
            }
        }

        // Format: DD.MM.YYYY
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split(".");
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
            );
            if (!isNaN(date.getTime())) {
                return date.toISOString().slice(0, 10);
            }
        }

        // Format: DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split("/");
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
            );
            if (!isNaN(date.getTime())) {
                return date.toISOString().slice(0, 10);
            }
        }

        // Try to extract date from Lithuanian format (e.g., "15 Marijampolės")
        const match = dateStr.match(/(\d{1,2})\s+([A-Za-zĄČĘĖĮŠŲŪąčęėįšųū]+)/);
        if (match) {
            const day = parseInt(match[1]);
            const monthName = match[2].toLowerCase();

            // Map Lithuanian month names to numbers
            const monthMap: { [key: string]: number } = {
                "sausio": 0,
                "vasario": 1,
                "kovo": 2,
                "balandžio": 3,
                "gegužės": 4,
                "birželio": 5,
                "liepos": 6,
                "rugpjūčio": 7,
                "rugsėjo": 8,
                "spalio": 9,
                "lapkričio": 10,
                "gruodžio": 11,
            };

            const month = monthMap[monthName];
            if (month !== undefined) {
                const currentYear = new Date().getFullYear();
                const date = new Date(currentYear, month, day);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().slice(0, 10);
                }
            }
        }

        console.log(`Could not parse date: "${dateText}"`);
        return null;
    } catch (error) {
        console.log(`Error parsing date "${dateText}":`, error);
        return null;
    }
}

function extractTeams(teams: string[]): { team1: string; team2: string } {
    if (teams.length >= 2) {
        return {
            team1: normalize(teams[0]),
            team2: normalize(teams[1]),
        };
    }
    return { team1: "", team2: "" };
}

async function main() {
    const url = process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    try {
        console.log("🔄 Starting fixtures scrape (FK Banga + FK Banga B)...");
        const [aLyga, bangaB] = await Promise.all([
            scrape(),
            scrapeBangaB(),
        ]);

        const fixtures = [...aLyga, ...bangaB];

        if (fixtures.length === 0) {
            console.log("❌ No fixtures found");
            return;
        }

        console.log(
            `📊 Found ${fixtures.length} fixtures involving Banga/Banga B`,
        );

        let savedCount = 0;
        for (const fixture of fixtures) {
            const { team1, team2 } = extractTeams(fixture.teams);
            const date = parseDate(fixture.date);
            const time = normalize(fixture.time);

            if (!team1 || !team2) {
                console.log(
                    `⚠️ Skipping fixture with missing teams: ${fixture.rawText}`,
                );
                continue;
            }

            // Create a unique dedupe key
            const dedupeKey =
                `${team1.toLowerCase()} ${team2.toLowerCase()} ${date} ${time}`
                    .replace(/\s+/g, " ");

            const draftData = {
                dedupe_key: dedupeKey,
                source: "lff.lt",
                raw: {
                    link: fixture.link,
                    rawText: fixture.rawText,
                    teams: fixture.teams,
                    date: fixture.date,
                    time: fixture.time,
                },
                title: `${team1} vs ${team2}`,
                date: date,
                time: time,
                location: null,
                team1_name: team1,
                team2_name: team2,
            };

            try {
                const { error } = await supabase
                    .from("event_drafts")
                    .upsert(draftData, { onConflict: "dedupe_key" });

                if (error) {
                    console.error(`❌ Error saving draft:`, error);
                } else {
                    console.log(
                        `✅ Saved draft: ${team1} vs ${team2} (${date} ${time})`,
                    );
                    savedCount++;
                }
            } catch (error) {
                console.error(`❌ Error saving draft:`, error);
            }
        }

        console.log(`🎉 Completed: Saved/updated ${savedCount} drafts`);
    } catch (error) {
        console.error("❌ Failed to scrape and save drafts:", error);
        process.exit(1);
    }
}

main();
