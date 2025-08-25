import { JSDOM } from "jsdom";

export interface StandingRow {
    position: number;
    team: {
        name: string;
        logo?: string;
    };
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    league: string;
    lastUpdated: string;
}

export interface FixtureRow {
    id: string;
    date: string;
    time: string;
    home_team: {
        name: string;
        logo?: string;
    };
    away_team: {
        name: string;
        logo?: string;
    };
    home_score?: number;
    away_score?: number;
    stadium: string;
    league: string;
    status: "upcoming" | "completed" | "live";
    round?: string;
    match_url?: string;
    statistics?: MatchStatistics;
    events?: MatchEvent[];
}

export interface MatchEvent {
    minute: number;
    type:
        | "goal"
        | "assist"
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "other";
    player: string;
    team: "home" | "away";
    description?: string;
}

export interface MatchStatistics {
    possession?: {
        home: number;
        away: number;
    };
    shots?: {
        home: number;
        away: number;
    };
    shots_on_target?: {
        home: number;
        away: number;
    };
    corners?: {
        home: number;
        away: number;
    };
    fouls?: {
        home: number;
        away: number;
    };
    yellow_cards?: {
        home: number;
        away: number;
    };
    red_cards?: {
        home: number;
        away: number;
    };
    offsides?: {
        home: number;
        away: number;
    };
    goals?: {
        home: number;
        away: number;
    };
    substitutions?: {
        home: number;
        away: number;
    };
}

export interface ScrapedData {
    league: string;
    standings: StandingRow[];
    lastUpdated: string;
}

export interface ScrapedFixturesData {
    league: string;
    fixtures: FixtureRow[];
    lastUpdated: string;
}

export class LFFScraper {
    private static async fetchWithRetry(
        url: string,
        retries = 3,
    ): Promise<string> {
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                        "Accept":
                            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Accept-Encoding": "gzip, deflate",
                        "Connection": "keep-alive",
                        "Upgrade-Insecure-Requests": "1",
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`,
                    );
                }

                return await response.text();
            } catch (error) {
                console.error(`Attempt ${i + 1} failed for ${url}:`, error);
                if (i === retries - 1) throw error;
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * (i + 1))
                ); // Exponential backoff
            }
        }
        throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
    }

    private static parseStandingsTable(
        html: string,
        league: string,
    ): StandingRow[] {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const standings: StandingRow[] = [];

        // Look for the active league table (the one that's currently displayed)
        const activeTable = document.querySelector(
            ".league_table_border:not(.notactive) table",
        );

        if (!activeTable) {
            console.warn(`No active standings table found for ${league}`);
            return [];
        }

        const rows = activeTable.querySelectorAll("tbody tr");

        rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 10) return; // Need at least 10 columns for LFF format

            try {
                const position = parseInt(cells[0]?.textContent?.trim() || "0");

                // Extract team name and logo from the second cell
                const teamCell = cells[1];
                const teamNameElement = teamCell?.querySelector(
                    ".league-table-club-name",
                );
                const teamName = teamNameElement?.textContent?.trim() ||
                    `Team ${index + 1}`;

                // Extract logo URL from background-image style
                const logoElement = teamCell?.querySelector(
                    ".league-table-club-img",
                );
                let logo: string | undefined;
                if (logoElement) {
                    const style = logoElement.getAttribute("style");
                    if (style) {
                        const match = style.match(/background:url\(([^)]+)\)/);
                        logo = match ? match[1] : undefined;
                    }
                }

                const played = parseInt(cells[2]?.textContent?.trim() || "0");
                const won = parseInt(cells[3]?.textContent?.trim() || "0");
                const drawn = parseInt(cells[4]?.textContent?.trim() || "0");
                const lost = parseInt(cells[5]?.textContent?.trim() || "0");
                const goalsFor = parseInt(cells[6]?.textContent?.trim() || "0");
                const goalsAgainst = parseInt(
                    cells[7]?.textContent?.trim() || "0",
                );

                // Goal difference is already calculated in the HTML
                const goalDifferenceText = cells[8]?.textContent?.trim() || "0";
                const goalDifference =
                    parseInt(goalDifferenceText.replace(/[+-]/g, "")) *
                    (goalDifferenceText.startsWith("-") ? -1 : 1);

                const points = parseInt(cells[9]?.textContent?.trim() || "0");

                standings.push({
                    position,
                    team: {
                        name: teamName,
                        logo,
                    },
                    played,
                    won,
                    drawn,
                    lost,
                    goalsFor,
                    goalsAgainst,
                    goalDifference,
                    points,
                    league,
                    lastUpdated: new Date().toISOString(),
                });
            } catch (error) {
                console.error(
                    `Error parsing row ${index} for ${league}:`,
                    error,
                );
            }
        });

        return standings;
    }

    private static parseFixturesTable(
        html: string,
        league: string,
    ): FixtureRow[] {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const fixtures: FixtureRow[] = [];

        // Look for fixtures tables - try multiple selectors
        const fixturesTables = document.querySelectorAll(
            ".fixtures_table table, .matches_table table, .matches-table, table.matches-table",
        );

        if (fixturesTables.length === 0) {
            console.warn(`No fixtures tables found for ${league}`);
            return [];
        }

        // Process all found tables
        fixturesTables.forEach((fixturesTable, tableIndex) => {
            console.log(`Processing table ${tableIndex + 1} for ${league}`);

            const rows = fixturesTable.querySelectorAll("tbody tr");

            rows.forEach((row, index) => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 5) return; // Need at least 5 columns for fixtures format

                try {
                    // Extract date and time
                    const dateCell = cells[0];
                    const timeCell = cells[1];
                    const dateText = dateCell?.textContent?.trim() || "";
                    const timeText = timeCell?.textContent?.trim() || "";

                    // Parse date from LFF format (YYYY MM DD)
                    const dateMatch = dateText.match(
                        /(\d{4})\s+(\d{1,2})\s+(\d{1,2})/,
                    );
                    let date = "";
                    if (dateMatch) {
                        const [, year, month, day] = dateMatch;
                        date = `${year}-${month.padStart(2, "0")}-${
                            day.padStart(2, "0")
                        }`;
                    }

                    // Parse time (HH:MM)
                    let time = timeText;

                    // Extract stadium
                    const stadiumCell = cells[2];
                    const stadium = stadiumCell?.textContent?.trim() || "";

                    // Extract home team
                    const homeTeamCell = cells[3];
                    const homeTeamName = homeTeamCell?.textContent?.trim() ||
                        "";
                    const homeTeamLogo = this.extractTeamLogo(homeTeamCell);

                    // Extract score (if available)
                    const scoreCell = cells[4];
                    const scoreText = scoreCell?.textContent?.trim() || "";
                    let homeScore: number | undefined;
                    let awayScore: number | undefined;
                    let status: "upcoming" | "completed" | "live" = "upcoming";

                    // Clean up the score text by removing newlines and extra spaces
                    const cleanScoreText = scoreText.replace(/\s+/g, " ")
                        .trim();

                    if (
                        cleanScoreText && cleanScoreText !== "- -" &&
                        cleanScoreText !== "-"
                    ) {
                        // Try different score patterns
                        let scoreMatch = cleanScoreText.match(
                            /(\d+)\s*-\s*(\d+)/,
                        );
                        if (!scoreMatch) {
                            // Try pattern with newlines or other separators
                            scoreMatch = cleanScoreText.match(
                                /(\d+)\s*\n\s*(\d+)/,
                            );
                        }
                        if (!scoreMatch) {
                            // Try pattern with just numbers separated by spaces
                            scoreMatch = cleanScoreText.match(/(\d+)\s+(\d+)/);
                        }

                        if (scoreMatch) {
                            homeScore = parseInt(scoreMatch[1]);
                            awayScore = parseInt(scoreMatch[2]);
                            status = "completed";
                        }
                    }

                    // Also check if the match date has passed to determine status
                    if (date) {
                        const matchDate = new Date(date);
                        const currentDate = new Date();

                        if (matchDate < currentDate && status === "upcoming") {
                            // If the date has passed but no score, mark as completed with no score
                            status = "completed";
                        }
                    }

                    // Extract away team
                    const awayTeamCell = cells[5];
                    const awayTeamName = awayTeamCell?.textContent?.trim() ||
                        "";
                    const awayTeamLogo = this.extractTeamLogo(awayTeamCell);

                    // Check if this is a Banga match
                    const isBangaMatch =
                        homeTeamName.toLowerCase().includes("banga") ||
                        awayTeamName.toLowerCase().includes("banga");

                    if (isBangaMatch) {
                        // Extract match URL from the "Rungtynių informacija" link
                        let matchUrl = "";
                        const allLinks = row.querySelectorAll("a");
                        for (const link of allLinks) {
                            const href = link.getAttribute("href");
                            const text = link.textContent?.trim();
                            if (
                                href && text &&
                                text.includes("Rungtynių informacija")
                            ) {
                                matchUrl = href.startsWith("http")
                                    ? href
                                    : `https://www.lff.lt${href}`;
                                break;
                            }
                        }

                        // Create a unique fingerprint based on match data to prevent duplicates
                        const fingerprint =
                            `${league}_${homeTeamName}_${awayTeamName}_${date}_${time}_${index}`
                                .toLowerCase().replace(/\s+/g, "_").replace(
                                    /[^a-z0-9_]/g,
                                    "",
                                );

                        fixtures.push({
                            id: fingerprint,
                            date,
                            time,
                            home_team: {
                                name: homeTeamName,
                                logo: homeTeamLogo,
                            },
                            away_team: {
                                name: awayTeamName,
                                logo: awayTeamLogo,
                            },
                            home_score: homeScore,
                            away_score: awayScore,
                            stadium,
                            league,
                            status,
                            round: this.extractRoundInfo(document),
                            match_url: matchUrl,
                        });
                    }
                } catch (error) {
                    console.error(
                        `Error parsing fixture row ${index} for ${league}:`,
                        error,
                    );
                }
            });
        });

        return fixtures;
    }

    private static extractTeamLogo(teamCell: Element): string | undefined {
        const logoElement = teamCell?.querySelector("img");
        if (logoElement) {
            return logoElement.getAttribute("src") || undefined;
        }

        // Try to extract from background image
        const style = teamCell?.getAttribute("style");
        if (style) {
            const match = style.match(/background:url\(([^)]+)\)/);
            return match ? match[1] : undefined;
        }

        return undefined;
    }

    private static extractRoundInfo(document: Document): string | undefined {
        // Try to extract round information from page headers
        const roundElement = document.querySelector("h1, h2, .round-title");
        if (roundElement) {
            const roundText = roundElement.textContent?.trim();
            if (roundText) {
                const roundMatch = roundText.match(/(\d+)\s*\.?\s*TURAS/i);
                return roundMatch ? `Round ${roundMatch[1]}` : roundText;
            }
        }
        return undefined;
    }

    public static async scrapeLeague(
        url: string,
        league: string,
    ): Promise<StandingRow[]> {
        try {
            console.log(`Scraping ${league} from ${url}`);
            const html = await this.fetchWithRetry(url);
            const standings = this.parseStandingsTable(html, league);

            console.log(
                `Successfully scraped ${standings.length} teams for ${league}`,
            );
            return standings;
        } catch (error) {
            console.error(`Failed to scrape ${league}:`, error);
            return [];
        }
    }

    public static async scrapeFixtures(
        url: string,
        league: string,
    ): Promise<FixtureRow[]> {
        try {
            console.log(`Scraping fixtures for ${league} from ${url}`);
            const html = await this.fetchWithRetry(url);
            const fixtures = this.parseFixturesTable(html, league);

            console.log(
                `Successfully scraped ${fixtures.length} Banga fixtures for ${league}`,
            );
            return fixtures;
        } catch (error) {
            console.error(`Failed to scrape fixtures for ${league}:`, error);
            return [];
        }
    }

    public static async scrapeAllLeagues(): Promise<ScrapedData[]> {
        const leagues = [
            {
                name: "Banga A",
                url: "https://www.lff.lt/lygos/a-lyga/",
                leagueKey: "a_lyga",
            },
            {
                name: "Banga B",
                url: "https://www.lff.lt/lygos/ii-lyga-a-divizionas-2025/",
                leagueKey: "ii_lyga_a",
            },
            {
                name: "Banga M",
                url: "https://www.lff.lt/lygos/2025-m-moter-a-lyga/",
                leagueKey: "moteru_a_lyga",
            },
        ];

        const results: ScrapedData[] = [];

        for (const league of leagues) {
            const standings = await this.scrapeLeague(league.url, league.name);

            if (standings.length > 0) {
                results.push({
                    league: league.name,
                    standings,
                    lastUpdated: new Date().toISOString(),
                });
            }
        }

        return results;
    }

    public static async scrapeMatchStatistics(
        matchUrl: string,
    ): Promise<MatchStatistics | null> {
        try {
            console.log(`Scraping match statistics from ${matchUrl}`);
            const html = await this.fetchWithRetry(matchUrl);
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Look for the "Mačo eiga" (Match Progress) tab specifically
            const statsTab = document.querySelector(
                '[data-tab="3"], [data-tabname="stats_tab"], #stats_tab, .stats_tab, [data-tab="stats"]',
            );
            if (!statsTab) {
                console.log(
                    "Match Progress tab not found, trying to find statistics in the page",
                );
            }

            // Try to find statistics in the current page or stats tab
            const statsContainer = statsTab || document;

            const statistics: MatchStatistics = {};

            // Extract statistics from match timeline
            const matchTimeline = statsContainer.querySelector(
                ".lff-match-timeline",
            );
            if (matchTimeline) {
                console.log("Found match timeline, extracting statistics...");

                // Count different types of events
                let homeGoals = 0;
                let awayGoals = 0;
                let homeYellowCards = 0;
                let awayYellowCards = 0;
                let homeRedCards = 0;
                let awayRedCards = 0;
                let homeSubstitutions = 0;
                let awaySubstitutions = 0;

                const matchItems = matchTimeline.querySelectorAll(
                    ".match-item",
                );
                console.log(`Found ${matchItems.length} match events`);

                matchItems.forEach((item, index) => {
                    const eventElement = item.querySelector(".event");
                    const eventType = eventElement?.className || "";

                    // Determine if this is a home or away team event
                    const isHomeEvent =
                        item.querySelector(".match-event-item-left")
                            ?.textContent?.trim() !== "";
                    const isAwayEvent =
                        item.querySelector(".match-event-item-right")
                            ?.textContent?.trim() !== "";

                    if (eventType.includes("goal")) {
                        if (isAwayEvent) awayGoals++;
                        else if (isHomeEvent) homeGoals++;
                    } else if (eventType.includes("yellow_card")) {
                        if (isAwayEvent) awayYellowCards++;
                        else if (isHomeEvent) homeYellowCards++;
                    } else if (eventType.includes("red_card")) {
                        if (isAwayEvent) awayRedCards++;
                        else if (isHomeEvent) homeRedCards++;
                    } else if (eventType.includes("substitution")) {
                        if (isAwayEvent) awaySubstitutions++;
                        else if (isHomeEvent) homeSubstitutions++;
                    }
                });

                // Set the statistics
                if (homeGoals > 0 || awayGoals > 0) {
                    statistics.goals = { home: homeGoals, away: awayGoals };
                }
                if (homeYellowCards > 0 || awayYellowCards > 0) {
                    statistics.yellow_cards = {
                        home: homeYellowCards,
                        away: awayYellowCards,
                    };
                }
                if (homeRedCards > 0 || awayRedCards > 0) {
                    statistics.red_cards = {
                        home: homeRedCards,
                        away: awayRedCards,
                    };
                }
                if (homeSubstitutions > 0 || awaySubstitutions > 0) {
                    statistics.substitutions = {
                        home: homeSubstitutions,
                        away: awaySubstitutions,
                    };
                }

                console.log(
                    `Extracted: Goals (${homeGoals}-${awayGoals}), Yellow Cards (${homeYellowCards}-${awayYellowCards}), Red Cards (${homeRedCards}-${awayRedCards}), Substitutions (${homeSubstitutions}-${awaySubstitutions})`,
                );
            }

            // Extract possession (fallback to old method)
            const possessionElements = statsContainer.querySelectorAll(
                '[class*="possession"], [class*="valdymas"], [class*="valdymo"]',
            );
            if (possessionElements.length >= 2 && !statistics.possession) {
                const homePossession = this.extractNumber(
                    possessionElements[0]?.textContent,
                );
                const awayPossession = this.extractNumber(
                    possessionElements[1]?.textContent,
                );
                if (homePossession !== null && awayPossession !== null) {
                    statistics.possession = {
                        home: homePossession,
                        away: awayPossession,
                    };
                }
            }

            // Extract shots
            const shotsElements = statsContainer.querySelectorAll(
                '[class*="shot"], [class*="smūgis"], [class*="smūgių"]',
            );
            if (shotsElements.length >= 2) {
                const homeShots = this.extractNumber(
                    shotsElements[0]?.textContent,
                );
                const awayShots = this.extractNumber(
                    shotsElements[1]?.textContent,
                );
                if (homeShots !== null && awayShots !== null) {
                    statistics.shots = { home: homeShots, away: awayShots };
                }
            }

            // Extract shots on target
            const shotsOnTargetElements = statsContainer.querySelectorAll(
                '[class*="target"], [class*="įvartis"], [class*="įvartių"]',
            );
            if (shotsOnTargetElements.length >= 2) {
                const homeShotsOnTarget = this.extractNumber(
                    shotsOnTargetElements[0]?.textContent,
                );
                const awayShotsOnTarget = this.extractNumber(
                    shotsOnTargetElements[1]?.textContent,
                );
                if (homeShotsOnTarget !== null && awayShotsOnTarget !== null) {
                    statistics.shots_on_target = {
                        home: homeShotsOnTarget,
                        away: awayShotsOnTarget,
                    };
                }
            }

            // Extract corners
            const cornersElements = statsContainer.querySelectorAll(
                '[class*="corner"], [class*="kampinis"]',
            );
            if (cornersElements.length >= 2) {
                const homeCorners = this.extractNumber(
                    cornersElements[0]?.textContent,
                );
                const awayCorners = this.extractNumber(
                    cornersElements[1]?.textContent,
                );
                if (homeCorners !== null && awayCorners !== null) {
                    statistics.corners = {
                        home: homeCorners,
                        away: awayCorners,
                    };
                }
            }

            // Extract fouls
            const foulsElements = statsContainer.querySelectorAll(
                '[class*="foul"], [class*="pažeidimas"]',
            );
            if (foulsElements.length >= 2) {
                const homeFouls = this.extractNumber(
                    foulsElements[0]?.textContent,
                );
                const awayFouls = this.extractNumber(
                    foulsElements[1]?.textContent,
                );
                if (homeFouls !== null && awayFouls !== null) {
                    statistics.fouls = { home: homeFouls, away: awayFouls };
                }
            }

            // Extract cards
            const yellowCardsElements = statsContainer.querySelectorAll(
                '[class*="yellow"], [class*="geltona"]',
            );
            if (yellowCardsElements.length >= 2) {
                const homeYellowCards = this.extractNumber(
                    yellowCardsElements[0]?.textContent,
                );
                const awayYellowCards = this.extractNumber(
                    yellowCardsElements[1]?.textContent,
                );
                if (homeYellowCards !== null && awayYellowCards !== null) {
                    statistics.yellow_cards = {
                        home: homeYellowCards,
                        away: awayYellowCards,
                    };
                }
            }

            const redCardsElements = statsContainer.querySelectorAll(
                '[class*="red"], [class*="raudona"]',
            );
            if (redCardsElements.length >= 2) {
                const homeRedCards = this.extractNumber(
                    redCardsElements[0]?.textContent,
                );
                const awayRedCards = this.extractNumber(
                    redCardsElements[1]?.textContent,
                );
                if (homeRedCards !== null && awayRedCards !== null) {
                    statistics.red_cards = {
                        home: homeRedCards,
                        away: awayRedCards,
                    };
                }
            }

            // Extract offsides
            const offsidesElements = statsContainer.querySelectorAll(
                '[class*="offside"], [class*="ofsaid"]',
            );
            if (offsidesElements.length >= 2) {
                const homeOffsides = this.extractNumber(
                    offsidesElements[0]?.textContent,
                );
                const awayOffsides = this.extractNumber(
                    offsidesElements[1]?.textContent,
                );
                if (homeOffsides !== null && awayOffsides !== null) {
                    statistics.offsides = {
                        home: homeOffsides,
                        away: awayOffsides,
                    };
                }
            }

            // If we found any statistics, return them
            if (Object.keys(statistics).length > 0) {
                console.log(
                    `Found ${
                        Object.keys(statistics).length
                    } statistics categories`,
                );
                return statistics;
            }

            console.log("No statistics found");
            return null;
        } catch (error) {
            console.error(
                `Failed to scrape match statistics from ${matchUrl}:`,
                error,
            );
            return null;
        }
    }

    private static extractNumber(
        text: string | null | undefined,
    ): number | null {
        if (!text) return null;
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    public static async scrapeMatchEvents(
        matchUrl: string,
    ): Promise<MatchEvent[] | null> {
        try {
            console.log(`Scraping match events from ${matchUrl}`);
            const html = await this.fetchWithRetry(matchUrl);
            const dom = new JSDOM(html);
            const document = dom.window.document;

            const events: MatchEvent[] = [];
            const seenEvents = new Set<string>();

            // Look for the "Mačo eiga" (Match Progress) tab content specifically
            const matchProgressContent = document.querySelector(
                '.lff-tab-content[data-tab="3"]',
            );
            let allText = "";

            if (matchProgressContent) {
                console.log(
                    "✅ Found Match Progress tab content, extracting events...",
                );
                allText = matchProgressContent.textContent || "";
            } else {
                console.log(
                    "⚠️ Match Progress tab content not found, using fallback...",
                );
                allText = document.body.textContent || "";
            }

            // Look for multiple patterns:
            // 1. "Player Name 9'Player Name 33'Player Name 6'" (continuous format)
            // 2. "7'min Pijus Srėbalius" (individual format)
            const eventPatterns = [
                /([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+)*)\s+(\d+)'/g,
                /(\d+)'min\s+([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+)*)/g,
            ];

            let allMatches: string[] = [];
            for (const pattern of eventPatterns) {
                const patternMatches = allText.match(pattern);
                if (patternMatches) {
                    allMatches = allMatches.concat(patternMatches);
                }
            }

            if (allMatches.length > 0) {
                for (const match of allMatches) {
                    // Try pattern 1: "Player Name 9'"
                    let playerMinuteMatch = match.match(
                        /([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+)*)\s+(\d+)'/,
                    );

                    let player = "";
                    let minute = 0;

                    if (playerMinuteMatch) {
                        player = playerMinuteMatch[1].trim();
                        minute = parseInt(playerMinuteMatch[2]);
                    } else {
                        // Try pattern 2: "7'min Player Name"
                        const minutePlayerMatch = match.match(
                            /(\d+)'min\s+([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+(?:\s+[A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+)*)/,
                        );

                        if (minutePlayerMatch) {
                            minute = parseInt(minutePlayerMatch[1]);
                            player = minutePlayerMatch[2].trim();
                        }
                    }

                    // Skip if minute is invalid or player name is too short
                    if (
                        isNaN(minute) || minute < 1 || minute > 120 ||
                        player.length < 2
                    ) continue;

                    // Skip navigation text and other irrelevant content
                    if (
                        player.toLowerCase().includes("statistika") ||
                        player.toLowerCase().includes("naujienos") ||
                        player.toLowerCase().includes("veteranų") ||
                        player.toLowerCase().includes("pilna") ||
                        player.toLowerCase().includes("fk banga") ||
                        player.toLowerCase().includes("dfk dainava") ||
                        player.toLowerCase().includes("topsport") ||
                        player.toLowerCase().includes("lyga")
                    ) continue;

                    // Create unique key to avoid duplicates
                    const eventKey = `${minute}-${player}`;
                    if (seenEvents.has(eventKey)) continue;
                    seenEvents.add(eventKey);

                    events.push({
                        minute,
                        type: "other",
                        player,
                        team: "home",
                        description: match,
                    });
                }
            }

            // Sort events by minute
            events.sort((a, b) => a.minute - b.minute);

            return events.length > 0 ? events : null;
        } catch (error) {
            console.error(
                `Error scraping match events from ${matchUrl}:`,
                error,
            );
            return null;
        }
    }

    public static async scrapeAllFixturesWithStatistics(): Promise<
        ScrapedFixturesData[]
    > {
        try {
            console.log("Scraping all fixtures with statistics...");
            const fixturesData = await this.scrapeAllFixtures();

            // For each fixture, try to scrape statistics if it has a match URL
            for (const leagueData of fixturesData) {
                for (const fixture of leagueData.fixtures) {
                    if (fixture.match_url && fixture.status === "completed") {
                        console.log(
                            `Scraping statistics for ${fixture.home_team.name} vs ${fixture.away_team.name}`,
                        );
                        const statistics = await this.scrapeMatchStatistics(
                            fixture.match_url,
                        );
                        if (statistics) {
                            fixture.statistics = statistics;
                        }

                        // Scrape events
                        const events = await this.scrapeMatchEvents(
                            fixture.match_url,
                        );
                        if (events) {
                            fixture.events = events;
                        }

                        // Add a small delay to avoid overwhelming the server
                        await new Promise((resolve) =>
                            setTimeout(resolve, 1000)
                        );
                    }
                }
            }

            return fixturesData;
        } catch (error) {
            console.error("Failed to scrape fixtures with statistics:", error);
            return [];
        }
    }

    public static async scrapeAllFixtures(): Promise<ScrapedFixturesData[]> {
        const fixtureUrls = [
            {
                name: "Banga A",
                url: "https://www.lff.lt/varzybos/a-lyga-20647154/",
                leagueKey: "a_lyga",
            },
            {
                name: "Banga B",
                url: "https://www.lff.lt/varzybos/ii-lyga-a-divizionas-2025-20708568/",
                leagueKey: "ii_lyga_a",
            },
            {
                name: "Banga M",
                url: "https://www.lff.lt/varzybos/2025-m-moter-a-lyga-20732722/",
                leagueKey: "moteru_a_lyga",
            },
        ];

        const results: ScrapedFixturesData[] = [];

        for (const fixture of fixtureUrls) {
            const fixtures = await this.scrapeFixtures(
                fixture.url,
                fixture.name,
            );

            if (fixtures.length > 0) {
                results.push({
                    league: fixture.name,
                    fixtures,
                    lastUpdated: new Date().toISOString(),
                });
            }
        }

        return results;
    }
}
