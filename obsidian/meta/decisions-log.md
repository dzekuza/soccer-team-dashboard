---
tags: [meta, decision]
updated: 2026-11-18
---

# Decisions Log (ADRs)

Architecture Decision Records. Each entry captures a choice, its context, and its
consequences. Use [[templates/adr-note]] for new entries. Newest first.

---

## ADR-0011 — Public list pages fetch on the server; match page shows only real data

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** News, results, schedule, standings and players still fetched after hydration
(extra round trip, skeletons first). The match page was worse: none of the 34 fixtures has events
or statistics, yet it rendered 11 starters + 5 substitutes per team with positions assigned by row
number, labelled the competition "Lygos raundas", and built its query from the raw URL
(`.or("id.eq.${id},fingerprint.eq.${id}")`).

**Decision.** Server `views/*` call typed helpers in `lib/` (anon key, public-read RLS) and render a
thin client "board" for tab state; routes use `revalidate = 60` (players: `unstable_cache`, because
`?team=` makes the route dynamic). `/fixtures/[id]` is cached per match (`generateStaticParams` returns
`[]`), validates the id (uuid or 40-hex fingerprint) before querying, and shows events/statistics only when
they exist (timeline, paired stat bars), otherwise an honest empty state. The fake lineups were removed.
Card colours became tokens (`booking-yellow`, `booking-red`). Position grouping now treats "saugas/saugė"
as midfielders.

**Consequences.** HTML arrives with data; data is at most ~60s old. Client components may import types only
from `lib/fixtures`/`lib/players` (the modules use server-only APIs). Lineups can return when the data model
has real lineup data. Still client-fetched: events list, shop, subscriptions, `naujienos/[id]`,
`players/[id]`, `zaidejai/[id]`, and the landing match strip + standings widget.

---

## ADR-0010 — Shared public layout, no full-screen loaders, server-fetched landing

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** Pages felt slow. Measured: each API call 120-270ms, but every page shipped an empty
HTML shell and fetched after hydration (6 client fetches on the landing page, the first one
blocking the whole page behind "Kraunama..."). 24 pages each mounted their own
`PublicNavigation`, so the match-strip request re-ran on every navigation, and pages nested
`min-h-screen` wrappers plus five pass-through `layout.tsx` files.

**Decision.** Move public pages into `app/(public)/` with one layout (nav, `<main>`, footer); the nav
derives the active item from the pathname. Delete full-screen loading gates: render the page frame
and show skeletons in the data area. Landing page: fetch posts on the server (`lib/posts.ts`), render via
`views/landing-view.tsx`, `revalidate = 60`. Hero news slide is dropped if there is no post; slides 2-3
reuse the `public/landing` images (the old ones 404ed); slide titles are `<h2>`, one sr-only `<h1>`.

**Consequences.** News arrives in the HTML and is at most 60s old; nav and footer stay mounted; every
public page has one `<main>`, a footer, and consistent spacing. Still client-fetched after hydration:
news list, players, fixtures, results, standings, shop, events, subscriptions (they now show skeletons
instantly): move them to server components with `revalidate` next. `PublicNavigation` no longer takes
`currentPage`.

---

## ADR-0009 — Club info pages are static app content, not links to the old site

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** The header's Klubas / Akademija / Kontaktai pointed at a dead staging host, and
the real pages live on the club's WordPress site (fkbanga.lt), outside this app.

**Decision.** Build `/klubas`, `/pamaina` and `/kontaktai` as own pages in the app, with the
copy in typed constants (`lib/club-content.ts`, `lib/club-documents.ts`) and thin routes that
delegate to `views/`. PDFs keep being served from fkbanga.lt. The academy page re-expresses
the old poster (a single image) as text: birth-year groups, contact person, phone.

**Consequences.** No dependency on the WordPress site for these pages, no redirects. Content
is a copy: staff, phones and documents must be edited in `lib/` (or moved to the database later).
PDF links still depend on fkbanga.lt staying online.

---

## ADR-0008 — Motion conventions: restraint, shared curves, no page-load stagger

- **Status:** Accepted (landing, players pages done; other pages pending)
- **Date:** 2026-11-18

**Context.** Pages faded and slid every section in with `translate-y-8 duration-1000`
and 200-1000ms delays (`usePageAnimation`), hiding the hero for the first second on a
page people navigate to constantly. The hero crossfade took 1s of a 5s cycle with no
pause, hover states used `transition-all` and an un-animatable gradient swap, hover stuck
on touch devices, and loading replaced the whole page with "Kraunama...".

**Decision.** Remove staggered reveals; fade loaded content in 200ms. Shared curves
`ease-out-strong` / `ease-in-out-strong` in the Tailwind theme. `hoverOnlyWhenSupported`.
Hero: 500ms crossfade, pause on hover/focus, stop under reduced motion, `inert` inactive
slides. Player card hover: colour/opacity only, 200ms. Skeleton grid inside the page frame.

**Consequences.** Pages feel faster (nothing waits on an animation). Four other pages still
use `usePageAnimation`; migrate them when touched. Touch devices no longer show sticky
hover on any page.

---

## ADR-0007 — Upgrade to Next.js 15.5 and React 19

- **Status:** Accepted (branch `chore/upgrade-next-15`)
- **Date:** 2026-11-18

**Context.** The app ran Next 14.2.4 / React 18 (30+ patch releases behind, with
published security fixes), against the project standard of Next 15. Next 14 also cached
supabase-js responses by default, which caused stale empty news (ADR-0006).

**Decision.** Move to `next@15.5.29`, `react@19`, matching `@types` and
`eslint-config-next`. Applied the official `next-async-request-api` codemod (21 files),
fixed three handlers that awaited `context` instead of `context.params`, replaced
`unstable_noStore` with `connection()` (10 pages), removed the `fetchCache` workaround,
regenerated `pnpm-lock.yaml` (Vercel installs with pnpm), dropped
`typescript.ignoreBuildErrors` (types are clean and now enforced), and set
`outputFileTracingRoot` (a stray `package-lock.json` sits in the parent folder). Stayed on 15 (not 16) per the project standard.

**Consequences.** Fetch results are no longer cached implicitly: add `revalidate`/`cache`
where caching is wanted. The type check caught a real bug: `PUT/DELETE /api/templates/[name]`
read `params.id`, so saving an email template never matched a row; it now matches by `name`.
`react-day-picker@8` is unsupported on React 19 (works; migrate to v9 later). `images.unoptimized`
stays `true` until an `images.remotePatterns` allow-list exists, so large assets must be
pre-sized (the Įsigykite player images went 6.5 MB -> 0.2 MB as WebP).
`next build` needs real server env vars (Stripe, Resend, QR secret) at build time because several
routes construct SDK clients at module scope.

---

## ADR-0006 — API routes opt out of Next's fetch cache

- **Status:** Superseded by ADR-0007 (Next 15 does not cache fetches by default; the `fetchCache` exports were removed).
- **Date:** 2026-11-18

**Context.** The hero's news slide was empty. `/api/posts?limit=1` returned `[]` even
though the table had 20 public rows: Next 14 (`next@14.2.4`) had cached the supabase-js
HTTP response from before the news import, and `export const dynamic = "force-dynamic"`
did not prevent it. A different query string (`?limit=5`) bypassed the stale entry,
which made it look intermittent.

**Decision.** Routes that read live Supabase data export
`fetchCache = "force-no-store"` next to `dynamic = "force-dynamic"`.

**Consequences.** News is always fresh (no data-cache benefit, fine at this traffic).
The same exposure exists in 7 other routes using `createClient` (`grep -L fetchCache`);
add the export when touching them. Clearing `.next/cache/fetch-cache` fixes a stale local dev cache.

---

## ADR-0005 — Fluid type-scale tokens replace arbitrary pixel sizes

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** Sizes were ad hoc: 85 `text-[Npx]` values, paired `md:` overrides, raw-px
helper classes, and page `<h1>`s mixing `text-2xl`/`3xl`/`4xl`.

**Decision.** Add `display`, `headline` and `title` fluid `clamp()` sizes to the
Tailwind `fontSize` theme; map `text-[14/16/12/11px]` to `sm/base/xs/xs`; rebuild the
`*-public` helpers from the tokens; every `<h1>` with a size class uses
`text-title` (or `text-display`). See [[design-system]].

**Consequences.** 11px text is now 12px. Dashboard `<h1>`s that were 24/30px now scale
24-32px. Heading sizes live in one file. `<h2>`/`<h3>` and card titles still use plain
Tailwind sizes and need a pass when components are extracted.

---

## ADR-0004 — Palette and font tokenised; DM Sans via next/font

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** A typography/layout audit found ~665 arbitrary hex classes
(`bg-[#0A165B]`, `text-[#F15601]`, nine near-identical navies, four oranges)
bypassing the tokens, utilities in `globals.css` (`.text-muted`, `.bg-accent`)
shadowing token names, Inter loaded but unused, and DM Sans served from ~80
unoptimised TTFs with Medium/SemiBold undeclared.

**Decision.** Brand colours become semantic tokens (`background`, `card`/`surface`,
`surface-raised`, `surface-deep`, `primary`, `primary-strong`, `muted-foreground`)
and all arbitrary hex classes were codemodded onto them. Near-duplicates were merged
(e.g. `#070F40`/`#1A1F4A`/`#10194A` -> `surface-deep`, `#B6C1E2` -> `muted-foreground`).
`--primary`/`--accent`/`--ring` now equal the dominant brand orange `#F15601`
(was `#FF6E00`), `--card` is `#232C62`. DM Sans comes from `next/font/google`
(variable, latin + latin-ext); Inter, the `@font-face` rules and `public/fonts/` are gone.

**Consequences.** Palette changes happen in one place. Merged shades shift by a few
percent in lightness. shadcn components using `bg-primary` / `bg-card` render in the
brand orange / surface colour. Build needs network access for Google Fonts (as Inter did).
Remaining work: type scale, shared public layout, duplicate EN/LT routes.

---

## ADR-0003 — Role hardening: first signup is admin, everyone else is staff

- **Status:** Accepted — migration `20261118000016_harden_roles_and_policies.sql` applied to the remote DB.
- **Date:** 2026-11-18

**Context.** Automated security review flagged: the signup trigger made every new user
`admin`, and most tables/storage buckets allowed any authenticated user to write.
Database currently has zero users, so tightening breaks nobody.

**Decision.** `handle_new_user` makes the first user admin (bootstrap) and later users
`staff`. Writes on events, tiers, players, standings, posts, subscription types and the
public storage buckets become admin-only; staff can read tickets/subscriptions and update
tickets (scanner validation). Open signup should also be disabled in Supabase Auth.

**Amendment (migration `…17`, applied).** Later signups are now `pending` (no privileges at all), not `staff`; staff must be promoted explicitly. A trigger limits staff updates on `tickets` to `is_validated`/`validated_at`/`status`/`updated_at` (the scanner uses the user session, so UPDATE can't be dropped). Verified 2026-11-18: 0 users exist, so no legacy accounts need demoting. Known residual risk: while signup is open, whoever registers first becomes admin — register first, then disable signup (or switch to seeding the admin by SQL).

**Consequences.** New teammates must be promoted with
`update public.users set role='staff' where email=...` (or `'admin'`). Dashboard writes done with a staff
session will be rejected by RLS.

---

## ADR-0002 — Replace the legacy migration chain with a rebuilt baseline

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** The new Supabase project was empty and the old project is inaccessible.
The ~40 legacy migrations had out-of-order timestamps, drop/recreate churn, and
omitted tables created by hand (coupon_codes, subscription_types, user_subscriptions,
banga_playerss, standings_al, posts, subscribers, profiles) and the
`create_event_with_tiers` RPC.

**Decision.** Archive them in `supabase/legacy-migrations/` and write a new ordered
set from the current code's needs; reuse the self-contained legacy files (shop,
standings, drafts, templates, fixtures) with fixes. Add RLS to the shop tables.

**Consequences.** Columns of hand-made tables are inferred, so mismatches may surface
at runtime and need follow-up migrations. History no longer matches the old project's
`schema_migrations`; never run these against the old database.

---

## ADR-0001 — Documentation lives in an in-repo Obsidian vault

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** Project knowledge (why a pattern exists, what not to touch, how to add
a feature) was scattered across chat history, READMEs, and people's heads. AI agents
re-derived it every session and got it wrong.

**Decision.** All project documentation lives in `obsidian/`, a linked Obsidian vault
committed to the repo. Root `AGENTS.md` / `CLAUDE.md` / `.cursorrules` are thin shims
pointing into it. Claude Code hooks inject the pointer at session start, remind on
every prompt, and block once at Stop when code changed without a doc update.

**Consequences.** Documentation is versioned with the code and reviewed in the same
PR. Every code change carries a doc obligation. Agents get consistent context without
re-reading the whole codebase.

---
