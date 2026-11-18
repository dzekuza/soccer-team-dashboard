---
tags: [frontend, catalog, wip]
updated: 2026-11-18
---

# Utils Catalog

Pure helpers in `src/utils/`. A util is pure, typed, and unit-testable; anything
with I/O or client state belongs in `lib/` or a hook instead.

| Util | File | Signature | Purpose |
|------|------|-----------|---------|
| `CLUB_*`, `ACADEMY_*` | `lib/club-content.ts` | typed constants | Static copy and contacts for Klubas / Pamaina / Kontaktai (copied from fkbanga.lt 2026-11-18); edit here when staff or numbers change |
| `CLUB_DOCUMENT_GROUPS` | `lib/club-documents.ts` | typed constant | 33 public PDFs grouped for the Klubas page; files stay hosted on fkbanga.lt |
| `getLatestPosts(limit)`, `LandingPost` | `lib/posts.ts` | `async (n) => LandingPost[]` | Server-side newest posts for the landing page (excerpt derived from content when missing) |
| `createPublicClient()` | `lib/supabase-public.ts` | `() => SupabaseClient` | Anon-key client for server reads of public data |
| `getFixtureById`, `getScheduleFixtures`, `getResultFixtures`, `FixtureListItem` | `lib/fixtures.ts` | server only | Match page + schedule/results data (validated id, ticket-event matching by title and date) |
| `getStandings`, `StandingsGroup` | `lib/standings.ts` | server only | League tables |
| `getPlayers` | `lib/players.ts` | cached 60s, server only | Players from `banga_playerss`, duplicates dropped |
| `getPosts`, `NewsPost` | `lib/posts.ts` | server only | News list |
| `formatDayMonthYear`, `formatTime` | `lib/format-date.ts` | client-safe | Lithuanian date/time formatting (UTC-safe calendar days) |
| | | | |

## Related

[[folder-structure]]
