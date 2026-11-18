import { createPublicClient } from "@/lib/supabase-public"

export interface StandingRow {
  position: number
  team: { name: string; logo?: string }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface StandingsGroup {
  /** "a_lyga" | "ii_lyga_a" | "moteru_a_lyga" */
  leagueKey: string
  leagueName: string
  rows: StandingRow[]
  lastUpdated: string | null
}

/** League tables for all squads, or null when the query fails. */
export async function getStandings(): Promise<StandingsGroup[] | null> {
  const { data, error } = await createPublicClient()
    .from("standings")
    .select("league_key, league_name, standings_data, last_updated")

  if (error || !data) {
    console.error("getStandings failed:", error?.message)
    return null
  }

  return data.map((row) => ({
    leagueKey: row.league_key,
    leagueName: row.league_name,
    rows: Array.isArray(row.standings_data) ? (row.standings_data as StandingRow[]) : [],
    lastUpdated: row.last_updated,
  }))
}
