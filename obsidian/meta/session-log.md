---
tags: [meta, session-log]
updated: 2026-11-18
---

# Session log

Append-only record of **what each working session changed and where it left the
project**. Newest first. Keep entries short (3–6 lines). Notable user-facing or
architectural changes also go in [[changelog]] / [[decisions-log]]; the live
snapshot lives in [[status]].

Entry format:

```
## YYYY-MM-DD HH:MM — one-line summary
- **Changed:** files / areas touched and why
- **Status:** what works now, what is half-done
- **Next:** the first thing to do next session
```

## 2026-11-18 — Animation audit and fixes (landing, fixtures, players)

- **Changed:** `app/page.tsx` (no reveals; hero pause/reduced-motion/inert), `components/player-card.tsx` (hover layers, `PlayerGridSkeleton`), `app/zaidejai/page.tsx`, `app/players/page.tsx`, `app/zaidejai/[id]/page.tsx`, `hooks/use-page-animation.ts` (`unknown[]`), `tailwind.config.ts` (easing tokens, `hoverOnlyWhenSupported`); design-system Motion section, ADR-0008, changelog.
- **Status:** `tsc` clean; verified on the Next 15 dev server: 500ms crossfade, hover pause/resume, reduced-motion stops autoplay, skeleton in SSR HTML, card hover 200ms with no dark band. Committed, not pushed.
- **Next:** migrate `naujienos`, `renginiai`, `parduotuve`, `lentele` off `usePageAnimation`; fixtures detail still shows a full-screen "Kraunama..."; `/players/[id]` has no entrance (and 10 inline styles).

## 2026-11-18 — Įsigykite tiles full width

- **Changed:** removed `mx-auto max-w-page` from the tiles wrapper in `components/tickets-apparel-section.tsx`; removed the unused `max-w-page` token; vault design-system + changelog.
- **Status:** `tsc` clean; merged to `master` and pushed.
- **Next:** see the entry below.

## 2026-11-18 — Next 15 / React 19 upgrade and caching review

- **Changed:** deps + both lockfiles; 21 files by async-request codemod, 3 handlers fixed by hand, `noStore` -> `connection()` (10 pages); `next.config.mjs` (tracing root, types enforced); `/api/templates/[name]` bug; player images -> WebP; ADR-0007, tech-stack, changelog. Merged to `master` and pushed (`95a05bb`).
- **Status:** `tsc` clean; full `next build` passes with dummy server env vars; isolated dev smoke test OK (11 pages, 4 APIs, no console errors). Not merged/pushed. A user `next dev` shares `.next` with builds: my `rm -rf .next` interrupted it earlier.
- **Next:** merge branch after a real-env Vercel preview; add `loading.tsx`/`error.tsx`/`not-found.tsx`; server-side auth for `/dashboard` (no middleware, `AuthGuard` unused); convert client-fetch pages to server components; pin `latest` deps.

## 2026-11-18 — Hero news fix, Įsigykite section from Figma

- **Changed:** `app/api/posts/route.ts` + `[id]/route.ts` (`fetchCache`); `components/tickets-apparel-section.tsx` rewritten from Figma 1100:81335; `public/landing/*` (4 assets, ~6.6 MB of PNG cut-outs, served via next/image); tailwind tokens `max-w-page`, `min-h-promo`, `h-promo-player`, tracking on headline/title.
- **Status:** hero slide 1 shows the latest post with its cover; section matches the design at 1440px (heading 48/60, -0.96px tracking) and stacks cleanly at 390px, no overflow. Committed.
- **Next:** hero slides 2-3 still point at missing `/ticketsbg.png` / `/shopbg.png`; each hero slide renders an `<h1>` (5 per page); add `fetchCache` to the other 7 `createClient` API routes; shared `(public)` layout.

## 2026-11-18 — Type scale

- **Changed:** `fontSize` tokens in `tailwind.config.ts`; `*-public` helpers rebuilt on them; arbitrary px sizes and `<h1>` sizes mapped (48 files); design-system note, ADR-0005, changelog.
- **Status:** `tsc` clean; `/naujienos` h1 is 40/48px at 390px and 64/77px at 1200px, no overflow. Committed.
- **Next:** shared `(public)` layout, remove duplicate EN/LT routes, `<h1>`/`<main>` on pages missing them, reduced-motion.

## 2026-11-18 — Typography/layout audit, tokens and fonts

- **Changed:** colour tokens in `globals.css` + `tailwind.config.ts`; 664 arbitrary hex classes codemodded across 74 files; DM Sans via `next/font/google`; deleted `public/fonts/`; vault design-system table, ADR-0004, changelog.
- **Status:** `tsc` clean, dev server renders with correct fonts/colours. `npm run build` compiles but fails collecting `/api/checkout/shop` (no Stripe key in env, unrelated). Not committed.
- **Next:** type scale (replace `text-[14px]`, `.h1-public`), shared `(public)` layout, remove duplicate EN/LT routes, add `<h1>`/`<main>`, reduced-motion.


## 2026-11-18 — Toplyga 2026 league table imported
- **Changed:** scraped `table/lentele-toplyga-2026` (columns V R P L Pr Į+ Į- Sk Tšk = pos, played, won, drawn, lost, GF, GA, GD, pts). Inserted 10 teams into `standings` (`league_key='a_lyga'`, JSON rows with bucket logos — read by the landing `StandingsTable` via `/api/standings/scrape`) and into `standings_al` (`team_key='a_lyga'`, read by the dashboard Lentelė page / `/api/standings`). Upserts, so re-runnable.
- **Status:** anon read verified. Riteriai is listed with all zeros, as on the club site. B / M tabs on the landing page still have no table.
- **Next:** `ii_lyga_a` (Banga B) and `moteru_a_lyga` (Banga M) tables + fixtures; refresh the tables after matches (no scheduled scrape yet).

## 2026-11-18 — pushed and merged to master
- **Changed:** pushed `e9797f1` and fast-forwarded `master` from `feat/supabase-rebuild-and-site-content`; pushed `master` (54d3f30 → e9797f1).
- **Status:** repo, remote DB migrations `…01`–`…17` and vault are in sync. Feature branch still exists on GitHub.
- **Next:** Vercel env vars; register own account first, then disable open signup in Supabase Auth; rotate the access token pasted in chat; delete the merged feature branch if unwanted.

## 2026-11-18 — pending role + ticket update guard (migration …17)
- **Changed:** `20261118000017_pending_role_and_ticket_update_guard.sql` applied remotely: role CHECK now allows `pending` (default), later signups are `pending`, trigger `restrict_staff_ticket_updates` blocks staff from editing anything but validation fields. Committed locally, not pushed.
- **Status:** 0 users in DB. First registrant still becomes admin while signup is open.
- **Next:** user registers first, then disables signup in Supabase Auth; push the commit when ready.

## 2026-11-18 — security hardening migration applied
- **Changed:** wrote `supabase/migrations/20261118000016_harden_roles_and_policies.sql` (first signup admin / later staff, admin-only writes, staff read tickets+subscriptions, admin-only storage writes). Applied to the remote DB after user approval; committed (`9116a45`) and pushed to `feat/supabase-rebuild-and-site-content`.
- **Status:** remote DB has 0 users; no open write policies remain; anon reads still work.
- **Next:** user disables open signup in Supabase Auth; the first account to register becomes admin, promote others with SQL.

## 2026-11-18 — landing matches strip shows results off-season
- **Changed:** `components/upcoming-matches.tsx` — if a team has no upcoming fixtures it now shows its 10 latest completed results (newest first); score built from `team1_score`/`team2_score` (it read a non-existent `score` field); filter simplified, debug `console.log`s removed.
- **Status:** type-checks; not viewed in a browser. Banga B / Banga M tabs are still empty (no fixtures imported for them).
- **Next:** import B / M schedules; landing "Turnyrinė lentelė" reads `standings_al`, which is empty.

## 2026-11-18 — Banga A 2026 fixtures + team logos
- **Changed:** scraped fkbanga.lt `tvarkarastis-2026-banga` (DataTable → all 35 rows; one is an empty 2027-02-01 "BANGA" placeholder, skipped) and inserted 34 matches into `fixtures_all_new` (`league_key='Banga A'`, `is_draft=false`, status completed, competition TOPLYGA/LFF Taurė in `round`, `match_group='past'` as the app does). 24 team logos from ~/Downloads/lkomandulogo uploaded to the `team-logo` bucket (`<kebab>.svg`) and linked via `team1_logo`/`team2_logo`. Migration `20261118000015` adds a public SELECT policy for non-draft fixtures (public routes use the anon key; before, only the row owner could read).
- **Status:** anon read verified (34 rows). All matches are in the past, so "upcoming" widgets show nothing until next season. No logo for "FM Vytis" (LFF Cup opponent) — not in the logo folder. Team names as on the club site ("K. Žalgiris" = Kaunas → `zalgiris.svg`, "Žalgiris" = Vilnius).
- **Next:** schedules for Banga B / M (`tvarkarastis-2026-banga-b`, `-banga-m`) if wanted; 2027 fixtures when published; update `teams.logo` to the new bucket URLs.

## 2026-11-18 — partner logos
- **Changed:** 27 white SVG logos from ~/Downloads/partners → `public/partners/<kebab>.svg`; `components/partners-section.tsx` rewritten (static list, `next/image fill`, no client state/console logs). The old component pointed at `/bangapartneriailogo/…`, a folder that never existed.
- **Status:** type-checks; not viewed in a browser. Alt text derived from filenames (e.g. "Grikšto klinika", "Gargždai mano"; Weber alt is just "Weber") — verify spelling.
- **Next:** link each logo to the partner's site if wanted; decide display order.

## 2026-11-18 — imported 20 latest news from fkbanga.lt
- **Changed:** scraped via the site's WordPress REST API (`/wp-json/wp/v2/posts?categories=1`; the `<time>` element on article pages is wrong — same timestamp everywhere). Inserted 20 articles (ids 10434–10264, 2026-09-08 → 2026-11-09) into BOTH `posts` (list: `/api/posts`) and `banga_posts` (detail: `/api/posts/[id]`) with the same uuid5-from-URL id; featured images re-hosted as JPEG in `covers/post-images/`.
- **Status:** live in remote DB; anon read works. Article HTML (scripts/on* stripped) is rendered with `dangerouslySetInnerHTML`; in-content images (1 article) still hotlink fkbanga.lt.
- **Next:** unify `posts` vs `banga_posts` (list and detail read different tables); `scripts/` upload scripts still target `banga_posts` only.

## 2026-11-18 — two fan photos added to the home hero carousel
- **Changed:** `public/hero/banga-20260830.png`, `public/hero/fanai-2026.png`; `app/page.tsx` — new `Slide` type, two image-only `photo` slides (full opacity + bottom gradient, no text/CTA), slide count now `slides.length` instead of hardcoded 3 (autoplay, arrows), autoplay effect moved below `slides`.
- **Status:** type-checks; not viewed in a browser. Source images are 1100×550, so they upscale on wide screens (soft); 600px hero height crops them.
- **Next:** higher-res originals if the hero looks soft; existing slides 2–3 reference `/ticketsbg.png` and `/shopbg.png`, which are not in `public/` (404).

## 2026-11-18 — new header logo + sticky public header
- **Changed:** `public/banga-logo.svg` (from ~/Downloads); `components/public-navigation.tsx` now uses it (the old `/Banga-1.png` never existed, causing 404s) and the match-info bar + nav wrapper is `sticky top-0 z-50`.
- **Status:** header sticks on scroll on all pages using `PublicNavigation`. Not visually checked in a browser yet.
- **Footer:** `components/public-footer.tsx` (both logo spots) also switched to `/banga-logo.svg`.
- **Next:** `/Banga-1.png` is still referenced in `dashboard-sidebar*.tsx`, `app/prenumeratos`, `app/subscriptions`, `app/event/[id]` — swap to `/banga-logo.svg` if wanted.

## 2026-11-18 — replaced player photos from ~/Downloads/bangaplayers
- **Changed:** matched 82 files (51 unique after hashing) to `banga_playerss` by fuzzy name; 24 confident images (≥0.94) resized to 900px height and uploaded to `covers/player-images/*-v2.png`; 26 rows' `image_url` updated (Grinkevičius, Ambrazaitis are in both A and B). Old uploads left in the bucket.
- **Status:** 25 players still have the site-scraped photo. Unmatched files: players not in the DB (Emsis, Akpe, Figueredo, Toleikis, Bertašius, Ramanauskas, Srėbalius, Nouri el Hermazi, several women, "Elo") plus 4 unnamed "foto Elvis Žaldaris…" images; bare `Armantas.png` (0.78) not applied; David Afonso / Vaidas Žutautas are staff.
- **Next:** decide whether to add the missing players (needs team/number/position) and map the unnamed images; optionally update staff photos.

## 2026-11-18 — diagnosed dev-server crash, added .env.example
- **Changed:** `/api/players` 500 `supabaseUrl is required` traced to `.env.local` missing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (`lib/supabase-service.ts` reads them). Created `.env.example` (names only) per project rules.
- **Status:** code unchanged; waiting on the user to add the two vars to `.env.local` and restart `npm run dev`.
- **Next:** confirm `/api/players` returns the 51 imported players; add Stripe/Resend/QR vars when those flows are tested.

## 2026-11-18 — imported FK Banga squads from fkbanga.lt
- **Changed:** scraped fkbanga.lt (Aside browser) into `supabase/fkbanga-squads.json`; migration `20261118000014` adds `banga_playerss.birth_date`/`profile_url` (unique per team_key+profile_url) and a `team_staff` table (RLS: public read, admin write). Imported 51 players (A 24, M 16, B 11) and 12 staff; 58 photos copied to the `covers` bucket (`player-images/`, `staff-images/`).
- **Status:** data live in remote DB. Positions kept as Lithuanian site text; 7 players have no position on the site. Pamaina page has no squad.
- **Next:** build staff UI if wanted; fix `app/players/page.tsx` grouping (it files "saugas"/"saugė" = midfielders under Gynėjai); decide whether to commit the JSON (contains birth dates, some minors).

## 2026-11-18 — rebuilt Supabase schema + seed on new project "Banga"
- **Changed:** old `supabase/migrations/` moved to `supabase/legacy-migrations/` (not replayable: ~8 hand-made tables, backdated files depending on later ones). New baseline `20261118000001_core_schema.sql` plus shop, standings, drafts, email templates, posts, fixtures, marketing and `20261118000013_shop_rls.sql`. `seed.sql` rewritten (32 deduped teams). Added local MCP server `supabase-soccer`.
- **Status:** remote DB `bjrddghusbkpxjgwbwlm` has 29 public tables, all with RLS, 5 email templates, 32 teams, buckets `covers`/`team-logo`/`product-images`. Core tables are inferred from code, so columns for coupon_codes, subscription_types, user_subscriptions, subscriptions, banga_playerss, standings_al, posts, subscribers, profiles are guesses.
- **Next:** point `.env.local` keys at the new project, smoke-test the dashboard (events, tickets, checkout, players, standings), then fix any column mismatches with new migrations. Decide on `subscriptions` vs `user_subscriptions` overlap and the "every signup is admin" trigger.

## 2026-11-18 — vault initialised

- **Changed:** project brain scaffolded (vault, shims, hooks).
- **Status:** skeleton only — architecture notes and catalogs still empty.
- **Next:** fill [[status]] and the architecture notes from the real codebase.
