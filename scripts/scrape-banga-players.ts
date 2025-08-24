#!/usr/bin/env tsx

import puppeteer from "puppeteer";

export interface ScrapedPlayer {
  name: string;
  surname?: string;
  number: string | null;
  position: string | null;
  matches: number | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  team_key: "BANGA A" | "BANGA B" | "BANGA M";
  profile_url?: string | null;
  image_url?: string | null;
}

export async function scrapeBangaPlayers(): Promise<ScrapedPlayer[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const players: ScrapedPlayer[] = [];

    // Scrape from A lyga website - BANGA team page
    console.log("Scraping from: https://www.alyga.lt/komanda/banga");
    await page.goto("https://www.alyga.lt/komanda/banga", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const scrapedPlayers = await page.evaluate(() => {
      const players: ScrapedPlayer[] = [];

      // Look for the player roster table
      const tables = Array.from(document.querySelectorAll("table"));
      console.log(`Found ${tables.length} tables on the page`);

      for (const table of tables) {
        const headerCells = Array.from(
          table.querySelectorAll("thead tr th, tr th"),
        );
        const headerText = headerCells.map((th) =>
          th.textContent?.toLowerCase() || ""
        ).join(" ");

        console.log(`Table header: ${headerText}`);

        // Check if this table contains player statistics (look for Lithuanian headers)
        if (
          headerText.includes("žaidėjas") || headerText.includes("pozicija") ||
          headerText.includes("r") || headerText.includes("min") ||
          headerText.includes("įv") || headerText.includes("rp")
        ) {
          const rows = Array.from(table.querySelectorAll("tbody tr"));
          console.log(`Found ${rows.length} player rows`);

          for (const row of rows) {
            const cells = Array.from(row.querySelectorAll("td"));
            if (cells.length < 5) continue;

            // Extract player information from the row
            let playerName = "";
            let playerSurname = "";
            let playerNumber = null;
            let playerPosition = null;
            let matches = null;
            let minutes = null;
            let goals = null;
            let assists = null;
            let yellowCards = null;
            let redCards = null;
            let imageUrl = null;

            // Get player image if available
            const imgElement = row.querySelector("img");
            if (imgElement) {
              imageUrl = imgElement.getAttribute("src");
            }

            // Extract data from cells - corrected parsing based on actual table structure
            for (let i = 0; i < cells.length; i++) {
              const cellText = cells[i]?.textContent?.trim() || "";

              // Cell 0: Player number (e.g., "55.")
              if (i === 0) {
                const numberMatch = cellText.match(/(\d+)\./);
                if (numberMatch) {
                  playerNumber = numberMatch[1];
                }
              } // Cell 1: Player name (e.g., "Mantas Bertašius")
              else if (i === 1) {
                const fullName = cellText;
                // Keep the full name as is, don't split it
                playerName = fullName;
              } // Cell 2: Position (e.g., "Vartininkas")
              else if (i === 2) {
                playerPosition = cellText;
              } // Cell 3: Matches played (e.g., "26")
              else if (i === 3) {
                if (cellText && !isNaN(Number(cellText))) {
                  matches = Number(cellText);
                }
              } // Cell 4: Minutes played (e.g., "2340")
              else if (i === 4) {
                if (cellText && !isNaN(Number(cellText))) {
                  minutes = Number(cellText);
                }
              } // Cell 5: Goals (e.g., "(27)" or "4")
              else if (i === 5) {
                // Handle goals in parentheses (goals conceded for goalkeepers)
                const goalsMatch = cellText.match(/\((\d+)\)/);
                if (goalsMatch) {
                  goals = Number(goalsMatch[1]);
                } else if (cellText && !isNaN(Number(cellText))) {
                  goals = Number(cellText);
                }
              } // Cell 6: Assists (e.g., "0")
              else if (i === 6) {
                if (cellText && !isNaN(Number(cellText))) {
                  assists = Number(cellText);
                }
              } // Cell 7: Yellow cards (e.g., "1")
              else if (i === 7) {
                if (cellText && !isNaN(Number(cellText))) {
                  yellowCards = Number(cellText);
                }
              } // Cell 8: Red cards (e.g., "0")
              else if (i === 8) {
                if (cellText && !isNaN(Number(cellText))) {
                  redCards = Number(cellText);
                }
              }
            }

            // Only add player if we have a valid name
            if (playerName && playerName.length > 1) {
              console.log(
                `Found player: ${playerName} ${playerSurname} (${playerNumber}) - ${playerPosition}`,
              );

              players.push({
                name: playerName,
                surname: playerSurname || undefined,
                number: playerNumber,
                position: playerPosition,
                matches: matches,
                minutes: minutes,
                goals: goals,
                assists: assists,
                yellow_cards: yellowCards,
                red_cards: redCards,
                team_key: "BANGA A",
                image_url: imageUrl,
              });
            }
          }
        }
      }

      return players;
    });

    players.push(...scrapedPlayers);
    console.log(
      `Found ${scrapedPlayers.length} BANGA A players from A lyga website`,
    );

    // Scrape BANGA B players from lietuvosfutbolas.lt
    try {
      console.log("Scraping BANGA B players from lietuvosfutbolas.lt...");
      const bangaBPlayers = await scrapeBangaBPlayers();
      players.push(...bangaBPlayers);
      console.log(
        `Found ${bangaBPlayers.length} BANGA B players from lietuvosfutbolas.lt`,
      );
    } catch (error) {
      console.error("Error scraping BANGA B players:", error);
    }

    // Scrape BANGA M (women's team) players from lietuvosfutbolas.lt
    try {
      console.log(
        "Scraping BANGA M (women's team) players from lietuvosfutbolas.lt...",
      );
      const bangaMPlayers = await scrapeBangaMPlayers();
      players.push(...bangaMPlayers);
      console.log(
        `Found ${bangaMPlayers.length} BANGA M players from lietuvosfutbolas.lt`,
      );
    } catch (error) {
      console.error("Error scraping BANGA M players:", error);
    }

    await browser.close();

    // Remove duplicates based on name and team
    const uniquePlayers = players.filter((player, index, self) =>
      index ===
        self.findIndex((p) =>
          p.name === player.name && p.team_key === player.team_key
        )
    );

    console.log(`Total unique players found: ${uniquePlayers.length}`);
    return uniquePlayers;
  } catch (error) {
    console.error("Scraping error:", error);
    await browser.close();
    return [];
  }
}

// Alternative approach: Scrape from specific team pages
export async function scrapeBangaPlayersFromTeamPages(): Promise<
  ScrapedPlayer[]
> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const players: ScrapedPlayer[] = [];

    // Try to find BANGA team pages and scrape player rosters
    const teamUrls = [
      "https://www.lff.lt/komandos/fk-banga-gargzdai-17256501/",
      "https://www.lff.lt/komandos/fk-banga-b-gargzdai-20708568/",
    ];

    for (const url of teamUrls) {
      try {
        await page.goto(url);
        await page.waitForSelector("body", { timeout: 10000 });

        const teamPlayers = await page.evaluate((currentUrl) => {
          const teamPlayers: ScrapedPlayer[] = [];
          const isTeamA = currentUrl.includes("17256501");
          const teamKey: "BANGA A" | "BANGA B" = isTeamA
            ? "BANGA A"
            : "BANGA B";

          // Look for player roster sections
          const playerSections = Array.from(
            document.querySelectorAll("div, section, table"),
          );

          for (const section of playerSections) {
            const text = section.textContent?.toLowerCase() || "";
            if (
              text.includes("žaidėjai") || text.includes("players") ||
              text.includes("roster")
            ) {
              const playerElements = Array.from(
                section.querySelectorAll("tr, div, li"),
              );

              for (const element of playerElements) {
                const elementText = element.textContent?.trim();
                if (!elementText) continue;

                // Try to extract player information
                const nameMatch = elementText.match(
                  /(\d+)\s+([A-ZĄČĘĖĮŠŲŪŽ][a-ząčęėįšųūž\s]+)/,
                );
                if (nameMatch) {
                  const [, number, fullName] = nameMatch;
                  const nameParts = fullName.trim().split(/\s+/);
                  const playerName = nameParts[0];
                  const playerSurname = nameParts.slice(1).join(" ");

                  teamPlayers.push({
                    name: playerName,
                    surname: playerSurname || undefined,
                    number: number,
                    position: null,
                    matches: null,
                    minutes: null,
                    goals: null,
                    assists: null,
                    yellow_cards: null,
                    red_cards: null,
                    team_key: teamKey,
                  });
                }
              }
            }
          }

          return teamPlayers;
        }, url);

        players.push(...teamPlayers);
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    await browser.close();
    return players;
  } catch (error) {
    console.error("Scraping error:", error);
    await browser.close();
    return [];
  }
}

// Scrape BANGA B players from lietuvosfutbolas.lt
export async function scrapeBangaBPlayers(): Promise<ScrapedPlayer[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    console.log("Scraping BANGA B players from lietuvosfutbolas.lt...");

    await page.goto("https://lietuvosfutbolas.lt/klubai/fk-banga-b-12577/", {
      waitUntil: "networkidle2",
    });

    // Wait for the page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const players = await page.evaluate(() => {
      const players: any[] = [];

      // Look for the player statistics table
      const tables = document.querySelectorAll("table");

      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll("tr"));

        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll("td"));

          // Skip header rows and rows with insufficient data
          if (cells.length < 5) continue;

          // Check if this row contains player data (has matches played)
          const matchesCell = cells[1]?.textContent?.trim();
          if (
            !matchesCell || matchesCell === "-" || isNaN(Number(matchesCell))
          ) continue;

          // Extract player name from first cell
          const nameCell = cells[0]?.textContent?.trim();
          if (!nameCell || nameCell.length < 2) continue;

          // Skip category headers like "Vartininkai", "Gynėjai", etc.
          if (
            nameCell.includes("Vartininkai") || nameCell.includes("Gynėjai") ||
            nameCell.includes("Saugai") || nameCell.includes("Puolėjai") ||
            nameCell.includes("Žaidėjai")
          ) continue;

          const playerName = nameCell;
          const matches = Number(matchesCell) || 0;
          const minutes = Number(cells[2]?.textContent?.trim()) || 0;
          const goals = cells[3]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[3]?.textContent?.trim()) || 0;
          const yellowCards = cells[4]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[4]?.textContent?.trim()) || 0;
          const redCards = cells[5]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[5]?.textContent?.trim()) || 0;

          // Determine position based on the section
          let position = "Žaidėjas"; // Default
          let currentSection = "";

          // Find the section this player belongs to
          for (let i = 0; i < rows.length; i++) {
            const rowCells = Array.from(rows[i].querySelectorAll("td"));
            if (rowCells.length === 1) {
              const sectionText = rowCells[0]?.textContent?.trim();
              if (sectionText === "Vartininkai") currentSection = "Vartininkas";
              else if (sectionText === "Gynėjai") currentSection = "Gynėjas";
              else if (sectionText === "Saugai") currentSection = "Saugas";
              else if (sectionText === "Puolėjai") currentSection = "Puolėjas";
            }

            if (rows[i] === row) break;
          }

          if (currentSection) position = currentSection;

          // Generate a number based on player name (since numbers aren't shown)
          const playerNumber = (players.length + 1).toString();

          players.push({
            name: playerName,
            number: playerNumber,
            position: position,
            matches: matches,
            minutes: minutes,
            goals: goals,
            assists: 0, // Not available in this table
            yellow_cards: yellowCards,
            red_cards: redCards,
            team_key: "BANGA B",
            image_url: null,
          });
        }
      }

      return players;
    });

    console.log(
      `Found ${players.length} BANGA B players from lietuvosfutbolas.lt`,
    );

    // Show some examples
    if (players.length > 0) {
      console.log("Example BANGA B players:");
      players.slice(0, 5).forEach((player) => {
        console.log(
          `- ${player.name} (${player.team_key}) - #${player.number} - ${player.position}`,
        );
        console.log(
          `  Matches: ${player.matches}, Goals: ${player.goals}, Minutes: ${player.minutes}`,
        );
      });
    }

    await browser.close();
    return players;
  } catch (error) {
    console.error("Error scraping BANGA B players:", error);
    await browser.close();
    return [];
  }
}

// Scrape BANGA M (women's team) players from lietuvosfutbolas.lt
export async function scrapeBangaMPlayers(): Promise<ScrapedPlayer[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    console.log(
      "Scraping BANGA M (women's team) players from lietuvosfutbolas.lt...",
    );

    await page.goto("https://lietuvosfutbolas.lt/klubai/fk-banga-12512/", {
      waitUntil: "networkidle2",
    });

    // Wait for the page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const players = await page.evaluate(() => {
      const players: any[] = [];

      // Look for the player statistics table
      const tables = document.querySelectorAll("table");

      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll("tr"));

        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll("td"));

          // Skip header rows and rows with insufficient data
          if (cells.length < 5) continue;

          // Check if this row contains player data (has matches played)
          const matchesCell = cells[1]?.textContent?.trim();
          if (
            !matchesCell || matchesCell === "-" || isNaN(Number(matchesCell))
          ) continue;

          // Extract player name from first cell
          const nameCell = cells[0]?.textContent?.trim();
          if (!nameCell || nameCell.length < 2) continue;

          // Skip category headers like "Vartininkai", "Gynėjai", etc.
          if (
            nameCell.includes("Vartininkai") || nameCell.includes("Gynėjai") ||
            nameCell.includes("Saugai") || nameCell.includes("Puolėjai") ||
            nameCell.includes("Žaidėjai")
          ) continue;

          const playerName = nameCell;
          const matches = Number(matchesCell) || 0;
          const minutes = Number(cells[2]?.textContent?.trim()) || 0;
          const goals = cells[3]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[3]?.textContent?.trim()) || 0;
          const yellowCards = cells[4]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[4]?.textContent?.trim()) || 0;
          const redCards = cells[5]?.textContent?.trim() === "-"
            ? 0
            : Number(cells[5]?.textContent?.trim()) || 0;

          // Determine position based on the section
          let position = "Žaidėja"; // Default for women's team
          let currentSection = "";

          // Find the section this player belongs to
          for (let i = 0; i < rows.length; i++) {
            const rowCells = Array.from(rows[i].querySelectorAll("td"));
            if (rowCells.length === 1) {
              const sectionText = rowCells[0]?.textContent?.trim();
              if (sectionText === "Vartininkai") currentSection = "Vartininkė";
              else if (sectionText === "Gynėjai") currentSection = "Gynėja";
              else if (sectionText === "Saugai") currentSection = "Saugė";
              else if (sectionText === "Puolėjai") currentSection = "Puolėja";
            }

            if (rows[i] === row) break;
          }

          if (currentSection) position = currentSection;

          // Generate a number based on player name (since numbers aren't shown)
          const playerNumber = (players.length + 1).toString();

          players.push({
            name: playerName,
            number: playerNumber,
            position: position,
            matches: matches,
            minutes: minutes,
            goals: goals,
            assists: 0, // Not available in this table
            yellow_cards: yellowCards,
            red_cards: redCards,
            team_key: "BANGA M",
            image_url: null,
          });
        }
      }

      return players;
    });

    console.log(
      `Found ${players.length} BANGA M players from lietuvosfutbolas.lt`,
    );

    // Show some examples
    if (players.length > 0) {
      console.log("Example BANGA M players:");
      players.slice(0, 5).forEach((player) => {
        console.log(
          `- ${player.name} (${player.team_key}) - #${player.number} - ${player.position}`,
        );
        console.log(
          `  Matches: ${player.matches}, Goals: ${player.goals}, Minutes: ${player.minutes}`,
        );
      });
    }

    await browser.close();
    return players;
  } catch (error) {
    console.error("Error scraping BANGA M players:", error);
    await browser.close();
    return [];
  }
}

if (require.main === module) {
  scrapeBangaPlayers().then((players) => {
    console.log(`Found ${players.length} BANGA players:`);
    players.forEach((player, i) => {
      console.log(
        `${i + 1}. ${player.name} ${
          player.surname || ""
        } (${player.team_key}) - #${player.number || "N/A"} - ${
          player.position || "N/A"
        }`,
      );
      console.log(
        `   Matches: ${player.matches || 0}, Goals: ${
          player.goals || 0
        }, Assists: ${player.assists || 0}`,
      );
    });
  });
}
