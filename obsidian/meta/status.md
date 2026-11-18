---
tags: [meta, status]
updated: 2026-11-18
---

# Current status — soccer-team-dashboard

**Last updated:** 2026-11-18

## Current focus

Polishing the public site (header, footer, hero carousel, partners, news) on the new Supabase project "Banga" (`bjrddghusbkpxjgwbwlm`).

## Done recently

- Role hardening applied (migration `…16`, ADR-0003): first signup admin, then staff; admin-only writes.
- Toplyga 2026 league table imported (`standings` a_lyga + `standings_al`).
- Landing match strip falls back to recent results off-season (`components/upcoming-matches.tsx`).
- Banga A 2026 fixtures (34) + team logos imported; public read policy on `fixtures_all_new` (migration `…15`).
- Partners section: 27 logos in `public/partners/`, component rewritten.
- Imported 20 latest news articles (posts + banga_posts, images in `covers/post-images/`).
- Home hero carousel: added two fan photo slides; slide count no longer hardcoded.
- Public header: new SVG logo, sticky on scroll (`components/public-navigation.tsx`).
- Replaced 26 player photos with the supplied cut-outs (24 images; unmatched files listed in session log).
- Imported 51 players + 12 staff from fkbanga.lt (migration `…14`, photos in `covers` bucket).
- Rebuilt schema as migrations `20261118000001`–`13` and applied them remotely (29 tables, RLS on all).
- Rewrote `supabase/seed.sql` (32 teams) and applied it.
- Archived old migrations to `supabase/legacy-migrations/`.

## In progress

- Nothing half-done. `master` = `e9797f1` (feature branch merged by fast-forward and pushed).

## Next up

- Set the Supabase env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_*`) in Vercel; deployment from `master` may already be building.
- Banga B / Banga M: import schedules and league tables (landing tabs empty).
- Import Banga B / M schedules; point `teams.logo` at the new `team-logo` bucket files.
- Verify partner logo names/order and optionally add partner links (`components/partners-section.tsx`).
- Unify `posts` / `banga_posts`: news list reads `posts`, detail reads `banga_posts`.
- Hero slides 2–3 point at missing `/ticketsbg.png` / `/shopbg.png`; add the images or switch to `public/ticketbg.jpg`.
- Replace remaining `/Banga-1.png` references (dashboard sidebars, subscriptions, event page; header and footer done) with `/banga-logo.svg`.
- Fix position grouping on `app/players/page.tsx` (saugas/saugė are midfielders, currently under Gynėjai).
- Verify `.env.local` has the new URL, anon key and service-role key; smoke-test the app.
- Fix column mismatches for inferred tables with new migrations.
- Decide `subscriptions` vs `user_subscriptions`, and the "every signup becomes admin" trigger.
- Re-upload team logos (seed URLs still point at the old project's bucket).

## Blockers & open questions

- Open signup is still enabled in Supabase Auth: register your own account first (becomes admin), then disable signup. Later signups are `pending`.
- `.env.local` lacks `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`); `/api/players` 500s until added.
- Old project inaccessible, so hand-made table schemas are guesses.
- `supabase-soccer` MCP needs a session restart to load.

## Environment

- **Run:** `npm run dev`
- **Deploy:** Vercel
- **Known issues:** see above.
