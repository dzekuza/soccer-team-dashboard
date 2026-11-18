---
tags: [meta, status]
updated: 2026-11-18
---

# Current status — soccer-team-dashboard

**Last updated:** 2026-11-18

## Current focus

Public landing page polish on the Supabase project "Banga" (`bjrddghusbkpxjgwbwlm`): design-system cleanup from the typography/layout audit (palette, fonts, type scale done), then hero and section fidelity against Figma.

## Done recently

- Shared `(public)` layout, full-screen loaders removed (skeletons instead), landing news server-fetched with ISR (ADR-0010).
- Own pages `/klubas`, `/pamaina`, `/kontaktai` built and linked from the header (ADR-0009); the dead Hostinger links are gone.
- Motion cleanup on landing + players pages (ADR-0008): no page-load stagger, calmer hero carousel, skeleton loading, hover only on hover-capable devices.
- Next 15.5 / React 19 upgrade (ADR-0007) merged to `master` and pushed (`95a05bb`); builds and smoke-tests clean locally. Verify the Vercel deployment (needs real Stripe/Resend/QR env vars at build time).
- Landing "Įsigykite" section rebuilt from Figma node 1100:81335 (`components/tickets-apparel-section.tsx`, assets in `public/landing/`).
- Hero news slide fixed: Next 14 cached an empty supabase-js response for `/api/posts?limit=1`; routes now use `fetchCache = "force-no-store"` (ADR-0006).
- Fluid type-scale tokens `text-display` / `text-headline` / `text-title` replace arbitrary px sizes (ADR-0005).
- Brand palette tokenised (664 arbitrary hex classes replaced) and DM Sans loaded via `next/font/google` (ADR-0004).
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

- Nothing half-done. `master` = `origin/master`; the Vercel deployment of the Next 15 upgrade is unverified.

## Next up

- Speed: move the remaining client-fetched public pages (news list, players, fixtures, results, standings, shop, events, subscriptions) to server components with `revalidate`, like the landing page (ADR-0010). Hero slides 2-3 broken-image item is fixed.
- **Push the image fix**: `origin/master` lacks `public/landing/*` (Įsigykite images 404 in production) until the commit that adds them is pushed. `.gitignore` now un-ignores `public/`.
- Footer links `/privacy` and `/cookies` 404 (pages missing). `/contact` duplicates `/kontaktai` with a non-working form and a different address; decide whether to redirect it. Review the copied club content (phones, staff) with the club.
- Finish ADR-0008 on the remaining pages: `naujienos`, `renginiai`, `parduotuve`, `lentele` still use `usePageAnimation`; fixtures detail and `/players/[id]` loading states.
- After the upgrade: add `revalidate`/`cache` only where caching is wanted (fetches are uncached by default now). Add `loading.tsx` / `error.tsx` / `not-found.tsx` (1 exists), server-side auth for `/dashboard` (no `middleware.ts`; `AuthGuard` is not mounted), move the 24 client pages that fetch in `useEffect` to server components, pin the 4 `latest` deps, add `favicon.ico`.
- Audit follow-ups: shared `(public)` layout (24 pages import nav/footer by hand), remove duplicate EN/LT routes, `<h1>`/`<main>` on pages missing them, reduced-motion + hero pause control, remaining non-token colours (`#FFCC00`, `#FF3B30`, `#111111`, `#222222`, `#5F5F71`, hero gradients).
- Set the Supabase env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_*`) in Vercel; deployment from `master` may already be building. `npm run build` locally also needs a Stripe key (fails at `/api/checkout/shop` without it).
- Banga B / Banga M: import schedules and league tables (landing tabs empty); point `teams.logo` at the new `team-logo` bucket files.
- Verify partner logo names/order and optionally add partner links (`components/partners-section.tsx`).
- Unify `posts` / `banga_posts`: news list reads `posts`, detail reads `banga_posts`.
- Replace remaining `/Banga-1.png` references (dashboard sidebars, subscriptions, event page) with `/banga-logo.svg`.
- Fix position grouping on `app/players/page.tsx` (saugas/saugė are midfielders, currently under Gynėjai).
- Fix column mismatches for inferred tables with new migrations.
- Decide `subscriptions` vs `user_subscriptions`, and the "every signup becomes admin" trigger.
- Re-upload team logos (seed URLs still point at the old project's bucket).

## Blockers & open questions

- Open signup is still enabled in Supabase Auth: register your own account first (becomes admin), then disable signup. Later signups are `pending`.
- `.env.local` has the Banga URL/anon key and now also `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (presence checked, not values). Missing locally: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `QR_CODE_SECRET`, `ADMIN_EMAIL`; `next build` fails without them (SDKs built at module scope).
- Old project inaccessible, so hand-made table schemas are guesses.
- Two `next dev` servers in this folder share `.next` and break each other's chunks; run one.

## Environment

- **Run:** `npm run dev`
- **Deploy:** Vercel
- **Known issues:** see above.
