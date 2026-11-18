---
tags: [meta, changelog]
updated: 2026-11-18
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`. Record *why*, not just
*what*; the diff already covers *what*.

## 2026-11-18 — Console clean-up

- Stripe.js no longer loads on every page: `Providers` now only wraps `AuthProvider` (ADR-0012). Removed 139 `console.log` debug calls and the empty `else` blocks they left.
- Added `public/placeholder-logo.svg`, repointed `/Banga-1.png` to `/banga-logo.svg`, set the favicon via `metadata.icons`, fixed the SVG logo size warning in `upcoming-matches`, deleted the Figma scratch page `/naujienos/test`.

## 2026-11-18 — Server-rendered public pages and a redesigned match page

- News, results, schedule, standings and players now render on the server (`views/*`, `lib/*`, `revalidate = 60`), with small client boards for tabs. Added route-level `loading.tsx`. See ADR-0011.
- `/fixtures/[id]` redesigned: scoreboard (winner emphasis, status chip), info list, timeline and stat bars only when data exists, honest empty state, not-found page, `<h1>`, cached per match. Removed the invented 11+5 placeholder lineups; validated the id before querying.
- Fixed: schedule rows nested a ticket link inside a row link; "Nežinomas stadionas" invented text removed; "saugas/saugė" now grouped as midfielders. New tokens `booking-yellow` / `booking-red`.

## 2026-11-18 — Įsigykite players smaller, grow on hover

- Player cut-outs rest at 78% of the old size (about 450px instead of 720px), bottom-anchored, and scale up on tile hover/focus (`md`+, transform 300ms, anchored to the outer bottom corner). `h-promo-player` is now 36rem; new `scale-promo-rest`.

## 2026-11-18 — Public layout, no loading screens, server-fetched landing

- New `app/(public)/layout.tsx` (nav + main + footer once); 21 routes moved into the group; five wrapper-only `layout.tsx` files and every per-page nav/footer/`min-h-screen` removed. `PublicNavigation` is prop-less and highlights from the URL (dropdown parents now highlight too). See ADR-0010.
- Removed all full-screen "Kraunama..." / "Loading..." gates; pages show skeletons (`components/common/page-skeletons.tsx`). Dropped the last `usePageAnimation` uses and a stray "Debug: Loaded N posts" line on /naujienos.
- Landing: news fetched on the server (`lib/posts.ts`, `revalidate = 60`); split into `HeroCarousel`, `MatchesAndStandings`, `LatestPostsSection` (props); slides 2-3 use `public/landing` images; one `<h1>`.

## 2026-11-18 — Fix: public images were never committed

- `.gitignore` ignored every `png/jpg/jpeg/gif/svg/ico/webp`, so `public/landing/*` (Įsigykite section) and `public/club/*` were not in git and would 404 in production. Added `!public/**` and committed them. Earlier assets were only tracked because they were force-added.

## 2026-11-18 — Klubas, Pamaina, Kontaktai pages

- New own pages `/klubas`, `/pamaina`, `/kontaktai` (replacing the links to fkbanga.lt); header and footer "Kontaktai" now point at them. See ADR-0009. New shared `PageHeading` / `ContentSection`, club components, `views/`, `lib/club-content.ts`, `lib/club-documents.ts`; removed `lib/site-links.ts`.
- Copied from the old site: club text, leadership, shareholders, 33 documents (PDFs still hosted there), academy groups and coach phones (from the poster), contacts, BANGA CAMP booking.

## 2026-11-18 — Dead header links

- Header links for Klubas, Akademija and Kontaktai pointed at a dead Hostinger staging host; they now use `CLUB_SITE_LINKS` (`lib/site-links.ts`, https://www.fkbanga.lt). The unused `components/event-header.tsx` had the same host on 7 links; fixed (own routes where the app has the page).

## 2026-11-18 — Motion cleanup (landing, players)

- Removed staggered 1s page-load reveals on the landing and players pages; loaded content fades in 200ms. Added `ease-out-strong` / `ease-in-out-strong` and `hoverOnlyWhenSupported`. See ADR-0008.
- Hero carousel: 500ms crossfade, pauses on hover/focus, stops under reduced motion, inactive slides `inert`; removed debug `console.log`s.
- Player cards: colour/opacity-only hover with tokens (no raw `orange-*`); players pages show a skeleton grid instead of a full-screen loader; player detail uses one fade instead of six directional reveals.

## 2026-11-18 — Įsigykite tiles full width

- Removed the `max-w-page` / `mx-auto` wrapper from `TicketsApparelSection` (tiles span the full width) and dropped the unused `max-w-page` token.

## 2026-11-18 — Next.js 15 / React 19 upgrade

- `next` 14.2.4 -> 15.5.29, `react`/`react-dom` 18 -> 19, types and `eslint-config-next` to match; both lockfiles regenerated. See ADR-0007.
- Async request APIs codemod (21 files); `unstable_noStore` -> `connection()`; removed `fetchCache` workaround and `generator: 'v0.dev'`; type errors now fail the build.
- Fixed `PUT/DELETE /api/templates/[name]` (matched on a non-existent `id` param; now `name`).
- Įsigykite player images converted to 2x WebP (6.5 MB -> 0.2 MB).

## 2026-11-18 — Landing Įsigykite section and hero news fix

- Hero news slide was empty: Next 14 cached the supabase-js response for `/api/posts?limit=1` from before the news import. Added `fetchCache = "force-no-store"` to `/api/posts` and `/api/posts/[id]`. The other 7 API routes using `createClient` have the same exposure.
- `TicketsApparelSection` rebuilt from Figma node 1100:81335 (`Įsigykite` heading, Atributika + Bilietai tiles with player cut-outs). Assets in `public/landing/`; old `/ticketsbg.png` / `/shopbg.png` backgrounds are no longer used by it.

## 2026-11-18 — Type scale

- Added fluid `text-display` / `text-headline` / `text-title` tokens; removed all `text-[Npx]`/`leading-[Npx]` values; `<h1>`s and `.h1-public`/`.h2-public` use the tokens. See ADR-0005.

## 2026-11-18 — Design tokens and fonts

- Replaced ~665 arbitrary hex classes with semantic tokens; removed colliding `.text-muted`/`.text-accent`/`.bg-accent`/`.bg-brand` utilities and `main-orange`. See ADR-0004.
- DM Sans now loads via `next/font/google` (latin-ext for Lithuanian); removed Inter, `@font-face` and `public/fonts/`.

## 2026-11-18 — Pending role

- New signups default to `pending`; staff ticket updates limited to validation fields (migration `…17`).

## 2026-11-18 — Security hardening

- Signup trigger: first user admin, later users staff; admin-only writes on content tables and storage; staff read tickets/subscriptions (migration `…16`).

## 2026-11-18 — League table

- Toplyga 2026 table imported into `standings` and `standings_al` (landing + dashboard).

## 2026-11-18 — Landing results fallback

- Landing match strip shows latest results when no fixtures are upcoming.

## 2026-11-18 — Fixtures

- 34 Banga A matches (2026 season) and 24 team logos imported; fixtures are publicly readable
  when `is_draft = false` (migration `…15`).

## 2026-11-18 — Partner logos

- Partners section now shows 27 logos from `public/partners/`.

## 2026-11-18 — News imported

- 20 latest fkbanga.lt articles imported into `posts` and `banga_posts` with images in `covers/post-images/`.

## 2026-11-18 — Hero carousel photos

- Home hero now has 5 slides: news, tickets, shop, plus two image-only fan photos.

## 2026-11-18 — Header logo and sticky header

- Public header and footer use `public/banga-logo.svg`; the header stays fixed at the top on scroll.

## 2026-11-18 — Player photos replaced

- 26 player rows now use the club's own cut-out photos (resized) from `covers/player-images/*-v2.png`.

## 2026-11-18 — `.env.example` added

- Lists every env var the code reads (Supabase incl. server-only `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`, Stripe, Resend, app URLs, `QR_CODE_SECRET`).

## 2026-11-18 — Squad data imported

- Players (3 squads) and staff imported from fkbanga.lt; new `team_staff` table and
  `birth_date`/`profile_url` player columns (migration `20261118000014`).

## 2026-11-18 — Supabase schema rebuilt for the new "Banga" project

- Legacy migrations could not be replayed on an empty database, so they were archived
  in `supabase/legacy-migrations/` and replaced by a clean baseline set
  (`20261118000001`–`13`). Shop tables now have RLS (previously none).
- `create_event_with_tiers` RPC, `is_admin()`, signup trigger and storage buckets
  (`covers`, `team-logo`) are now defined in migrations; before they existed only
  in the old database.
- `seed.sql` now seeds 32 deduplicated teams.

## 2026-11-18 — vault initialised

- Project brain scaffolded from the shared `.project-brain` template: vault,
  root shims (`AGENTS.md` / `CLAUDE.md` / `.cursorrules`), and the three Claude
  Code hooks that keep this vault in sync.
