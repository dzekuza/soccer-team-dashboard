---
tags: [meta, changelog]
updated: 2026-11-18
---

# Changelog

Chronological log of notable changes to the project. Newest first.
This is a human-curated log — not a mirror of `git log`. Record *why*, not just
*what*; the diff already covers *what*.

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
