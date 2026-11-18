import { cache } from "react"
import { createPublicClient } from "@/lib/supabase-public"
import { z } from "zod"

export type FixtureStatus = "upcoming" | "completed" | "live"

export type MatchEventType =
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution_in"
  | "substitution_out"
  | "other"

export interface MatchEvent {
  team: "home" | "away"
  type: MatchEventType
  minute: number
  player: string
}

/** One comparable statistic (home vs away) that has real numbers on both sides. */
export interface StatRow {
  key: string
  label: string
  home: number
  away: number
  suffix?: string
}

export interface Fixture {
  id: string
  status: FixtureStatus
  matchDate: string
  matchTime: string | null
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  homeLogo: string | null
  awayLogo: string | null
  venue: string | null
  /** Competition name, e.g. "TOPLYGA". */
  round: string | null
  /** Which Banga squad the match belongs to, e.g. "Banga A". */
  squad: string | null
  events: MatchEvent[]
  stats: StatRow[]
}

const FIXTURE_ID = z.union([z.string().uuid(), z.string().regex(/^[a-f0-9]{40}$/i)])
const UUID = z.string().uuid()

/** Display order and Lithuanian labels for statistics. */
const STAT_DEFINITIONS: { key: string; label: string; suffix?: string }[] = [
  { key: "possession", label: "Kamuolio valdymas", suffix: "%" },
  { key: "shots", label: "Smūgiai" },
  { key: "shots_on_target", label: "Smūgiai į vartus" },
  { key: "shots_off_target", label: "Smūgiai pro šalį" },
  { key: "corners", label: "Kampiniai" },
  { key: "fouls", label: "Pražangos" },
  { key: "yellow_cards", label: "Geltonos kortelės" },
  { key: "red_cards", label: "Raudonos kortelės" },
  { key: "substitutions", label: "Keitimai" },
  { key: "attacks", label: "Atakos" },
  { key: "dangerous_attacks", label: "Pavojingos atakos" },
]

const EVENT_TYPES: MatchEventType[] = [
  "goal",
  "yellow_card",
  "red_card",
  "substitution_in",
  "substitution_out",
  "other",
]

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function toEvents(raw: unknown): MatchEvent[] {
  const list = parseJson(raw)
  if (!Array.isArray(list)) return []

  return list
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && isNumber((item as Record<string, unknown>).minute),
    )
    .map((item) => ({
      team: item.team === "away" ? ("away" as const) : ("home" as const),
      type: EVENT_TYPES.includes(item.type as MatchEventType) ? (item.type as MatchEventType) : "other",
      minute: item.minute as number,
      player: typeof item.player === "string" ? item.player.trim() : "",
    }))
    .sort((a, b) => a.minute - b.minute)
}

function toStats(row: Record<string, unknown>): StatRow[] {
  const nested = parseJson(row.statistics)
  const source = typeof nested === "object" && nested !== null ? (nested as Record<string, unknown>) : {}

  return STAT_DEFINITIONS.flatMap(({ key, label, suffix }) => {
    // Prefer the statistics object; fall back to the flat `home_*` / `away_*` columns.
    const entry = source[key] as { home?: unknown; away?: unknown } | undefined
    const home = isNumber(entry?.home) ? entry.home : row[`home_${key}`] ?? row[`home_${key}_total`]
    const away = isNumber(entry?.away) ? entry.away : row[`away_${key}`] ?? row[`away_${key}_total`]

    return isNumber(home) && isNumber(away) ? [{ key, label, home, away, suffix }] : []
  })
}

/**
 * Loads one published fixture by id or fingerprint. The id is validated before it
 * reaches the query, and a missing or malformed id simply returns null.
 */
export const getFixtureById = cache(async (id: string): Promise<Fixture | null> => {
  if (!FIXTURE_ID.safeParse(id).success) return null

  const supabase = createPublicClient()

  const query = supabase.from("fixtures_all_new").select("*")
  const { data, error } = await (UUID.safeParse(id).success
    ? query.eq("id", id)
    : query.eq("fingerprint", id)
  ).maybeSingle()

  if (error || !data) {
    if (error) console.error("getFixtureById failed:", error.message)
    return null
  }

  return {
    id: data.id,
    status: data.status,
    matchDate: data.match_date,
    matchTime: data.match_time ? String(data.match_time).slice(0, 5) : null,
    homeTeam: data.team1,
    awayTeam: data.team2,
    homeScore: isNumber(data.team1_score) ? data.team1_score : null,
    awayScore: isNumber(data.team2_score) ? data.team2_score : null,
    homeLogo: data.team1_logo || null,
    awayLogo: data.team2_logo || null,
    venue: data.venue?.trim() || null,
    round: data.round?.trim() || null,
    squad: data.league_key?.trim() || null,
    events: toEvents(data.events),
    stats: toStats(data),
  }
})

/** "2026 m. lapkričio 1 d., šeštadienis" (the date is a calendar day, so no timezone shift). */
export function formatMatchDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("lt-LT", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const STATUS_LABELS: Record<FixtureStatus, string> = {
  upcoming: "Artėja",
  live: "Tiesiogiai",
  completed: "Baigta",
}

/** One row of the schedule / results lists. */
export interface FixtureListItem {
  /** Fingerprint; `/fixtures/[id]` accepts it. */
  id: string
  date: string
  time: string | null
  homeName: string
  awayName: string
  homeLogo: string | null
  awayLogo: string | null
  homeScore: number | null
  awayScore: number | null
  venue: string | null
  /** "Banga A" | "Banga B" | "Banga M" */
  squad: string
  /** Ticketed event for this match, when one exists. */
  eventId: string | null
}

interface FixtureRow {
  fingerprint: string
  match_date: string
  match_time: string | null
  team1: string
  team2: string
  team1_logo: string | null
  team2_logo: string | null
  team1_score: number | null
  team2_score: number | null
  venue: string | null
  league_key: string | null
  status: FixtureStatus
}

const FIXTURE_LIST_COLUMNS =
  "fingerprint, match_date, match_time, team1, team2, team1_logo, team2_logo, team1_score, team2_score, venue, league_key, status"

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "")

function toListItem(row: FixtureRow, eventId: string | null): FixtureListItem {
  return {
    id: row.fingerprint,
    date: row.match_date,
    time: row.match_time ? row.match_time.slice(0, 5) : null,
    homeName: row.team1,
    awayName: row.team2,
    homeLogo: row.team1_logo || null,
    awayLogo: row.team2_logo || null,
    homeScore: row.team1_score,
    awayScore: row.team2_score,
    venue: row.venue?.trim() || null,
    squad: row.league_key ?? "",
    eventId,
  }
}

/** Upcoming matches (earliest first), each linked to its ticketed event when there is one. */
export async function getScheduleFixtures(): Promise<FixtureListItem[] | null> {
  const supabase = createPublicClient()
  const [fixturesResult, eventsResult] = await Promise.all([
    supabase.from("fixtures_all_new").select(FIXTURE_LIST_COLUMNS).order("match_date", { ascending: true }),
    supabase.from("events").select("id, title, date"),
  ])

  if (fixturesResult.error || !fixturesResult.data) {
    console.error("getScheduleFixtures failed:", fixturesResult.error?.message)
    return null
  }

  const events = eventsResult.data ?? []
  const today = new Date().toISOString().slice(0, 10)

  return (fixturesResult.data as FixtureRow[])
    .filter((row) => row.status !== "completed" && row.match_date >= today)
    .map((row) => {
      const home = normalizeName(row.team1)
      const away = normalizeName(row.team2)
      const event = events.find((candidate) => {
        const title = normalizeName(candidate.title ?? "")
        return (
          title.includes(home) &&
          title.includes(away) &&
          candidate.date &&
          String(candidate.date).slice(0, 10) === row.match_date
        )
      })
      return toListItem(row, event?.id ?? null)
    })
}

/** Finished matches with a score (newest first). */
export async function getResultFixtures(): Promise<FixtureListItem[] | null> {
  const { data, error } = await createPublicClient()
    .from("fixtures_all_new")
    .select(FIXTURE_LIST_COLUMNS)
    .eq("status", "completed")
    .not("team1_score", "is", null)
    .not("team2_score", "is", null)
    .order("match_date", { ascending: false })

  if (error || !data) {
    console.error("getResultFixtures failed:", error?.message)
    return null
  }

  return (data as FixtureRow[]).map((row) => toListItem(row, null))
}
