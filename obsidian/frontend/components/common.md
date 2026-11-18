---
tags: [frontend, catalog, wip]
updated: 2026-11-18
---

# Common Components Catalog

Shared composed components in `components/common/` — built from [[components/ui]]
primitives, reused across features.

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| [[public-navigation|PublicNavigation]] | `components/public-navigation.tsx` | Sticky public header with match bar, nav, cart | #wip |
| PartnersSection | `components/partners-section.tsx` | Grid of sponsor logos from `public/partners/` (static list) | #wip |
| TicketsApparelSection | `components/tickets-apparel-section.tsx` | Landing "Įsigykite" heading + Atributika/Bilietai promo tiles (local `PromoTile`); Figma 1100:81335; assets in `public/landing/` (player cut-outs are 2x WebP, rest at 78% and grow on tile hover/focus (transform, 300ms); `images.unoptimized` is on, so pre-size assets); tiles clip fully when stacked, players may rise into the heading band from `md` | #wip |
| PageHeading | `components/common/page-heading.tsx` | Title bar with the page's single `<h1>` | #wip |
| ContentSection | `components/common/content-section.tsx` | Titled block (heading left, content right from `lg`); `id` + `aria-labelledby` | #wip |
| ClubDocuments | `components/club/club-documents.tsx` | Accordion of PDF groups (links open fkbanga.lt files in a new tab) | #wip |
| ContactCard | `components/club/contact-card.tsx` | Icon + heading + details card | #wip |
| AcademyGroupCard | `components/club/academy-group-card.tsx` | Birth-year group with contact name and phone | #wip |
| RowListSkeleton, CardGridSkeleton, ArticleSkeleton, ProfileSkeleton | `components/common/page-skeletons.tsx` | Placeholders for a page's data area while it loads (no full-screen loaders) | #wip |
| HeroCarousel | `components/landing/hero-carousel.tsx` | Landing hero (client): 500ms crossfade, pauses on hover/focus, stops under reduced motion. Takes `latestPost` from the server | #wip |
| MatchesAndStandings | `components/landing/matches-and-standings.tsx` | Landing match strip + league table with team tabs (client) | #wip |
| LatestPostsSection | `components/latest-posts-section.tsx` | Alternating news rows; props: `posts: LandingPost[]` (server data, no own fetch) | #wip |
| LoadError | `components/common/load-error.tsx` | Inline "could not load X" state; the page frame stays | #wip |
| MatchSkeleton | `components/common/page-skeletons.tsx` | Scoreboard-shaped placeholder for the match page | #wip |
| FixturesBoard | `components/fixtures/fixtures-board.tsx` | Squad tabs + fixture rows for schedule/results (client, data via props); one stretched link per row | #wip |
| MatchScoreboard, MatchTimeline, MatchStats, TeamLogo | `components/fixtures/*` | Match page header (status, teams, score), minute timeline, paired stat bars (SVG, no inline style), crest with initials fallback | #wip |
| StandingsBoard | `components/standings/standings-board.tsx` | League tabs + native `<table>` (client, data via props) | #wip |
| PlayersBoard | `components/players/players-board.tsx` | Squad tabs + players grouped by position (client; `initialTeam` from `?team=`) | #wip |
| NewsCard | `components/news/news-card.tsx` | Article card for the news list (server) | #wip |
| | | | #wip |

## Related

[[component-conventions]] · [[components/ui]]
