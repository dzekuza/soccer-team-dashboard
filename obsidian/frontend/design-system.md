---
tags: [frontend, wip]
updated: 2026-11-18
---

# Design System

The styling contract. **No hardcoded design values** anywhere in the codebase.

## Token tiers

1. **Primitive** (`--raw-*`) — literal values. Never referenced by components.
2. **Semantic** — role names (`--color-surface`, `--space-section`). What components use.
3. **Binding** — exposed to Tailwind via `@theme` in `globals.css`.

A component references tier 2/3 only. A raw hex or px in a `className` is a bug.

```tsx
// WRONG
<div style={{ padding: 16 }} className="text-[#3e82f1] mt-[20px]">
// RIGHT
<div className="text-primary mt-xl p-4">
```

## Tokens

Dark-only theme: `<body class="dark">` in `app/layout.tsx`, values in the `.dark`
block of `app/globals.css`, bound to Tailwind in `tailwind.config.ts`.

| Tailwind class | CSS var | Value | Use for |
|----------------|---------|-------|---------|
| `bg-background` | `--background` | `#0A165B` | Page background, brand navy |
| `bg-card` / `bg-surface` / `border-surface` | `--card`, `--surface` | `#232C62` | Cards, panels, card borders |
| `bg-surface-raised` | `--surface-raised` | `#0A2065` | Hover and raised panels |
| `bg-surface-deep` | `--surface-deep` | `#10194A` | Recessed areas, overlays |
| `bg-primary` / `text-primary` | `--primary` (= `--accent`, `--ring`) | `#F15601` | Brand orange: CTAs, active states |
| `bg-primary-strong` | `--primary-strong` | `#E04501` | Hover/pressed orange |
| `text-muted-foreground` | `--muted-foreground` | `#B0B8D1` | Secondary text |
| `bg-booking-yellow` / `bg-booking-red` | `--booking-yellow`, `--booking-red` | `#FFCC00` / `#FF3B30` | Yellow and red cards (match timeline) |
| `font-sans` | `--font-sans` | DM Sans (variable) | All text; loaded by `next/font/google` (latin + latin-ext) |

## Motion

Restraint first: animate only to give feedback, show where something came from, or
bridge a change that would otherwise teleport. No decorative entrances.

| Token | Value | Use for |
|-------|-------|---------|
| `ease-out-strong` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, hover/press feedback |
| `ease-in-out-strong` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movement/crossfades that stay on screen |

Budgets: hover/feedback 150-200ms, content fade-in 200ms, hero crossfade 500ms. Animate
`opacity`/`transform` (or colour for hover), never `transition-all`. Gradients cannot
transition: fade an overlay layer instead.

- **No page-load stagger.** Do not wrap sections in `translate-y` + `duration-1000` reveals
  (the old `usePageAnimation` pattern still used by `naujienos`, `renginiai`,
  `parduotuve`, `lentele`). Loaded content fades in with
  `animate-in fade-in duration-200 ease-out-strong motion-reduce:animate-none`.
- **Loading shows the page frame + skeleton** (`PlayerGridSkeleton`), not a full-screen "Kraunama...".
- **Hover is gated** (`future.hoverOnlyWhenSupported`): `hover:` only applies on hover-capable devices.
- **Autoplay** (hero) pauses on pointer/focus and stops under `prefers-reduced-motion`; inactive slides are `inert`.

## Page shell and loading

- **Public pages live in `app/(public)/`.** `layout.tsx` renders the nav, `<main>` and footer once.
  A page renders only its own content: no `PublicNavigation`, `PublicFooter`, `<main>`, or
  `min-h-screen` wrapper (nested viewport heights add a scrollbar). Routes outside the group
  (`checkout`, `event`, `login`, `register`, `dashboard`) own their shell.
- **No full-screen loaders.** Never replace the page with "Kraunama...". Render the frame
  (heading, tabs) at once and put a skeleton where the data goes: `RowListSkeleton`,
  `CardGridSkeleton`, `ArticleSkeleton`, `ProfileSkeleton` (`components/common/page-skeletons.tsx`).
  `Skeleton` defaults to `bg-surface`; do not override it with raw greys.
- **Fetch on the server when the page is public content.** Landing, news, results, schedule,
  standings, players and the match page load data in a server `view` through `lib/*` helpers with
  `revalidate = 60`, so the HTML arrives complete. Only the interactive part (squad tabs) is a
  client "board" component that receives the data as props (`components/fixtures/fixtures-board.tsx`,
  `components/standings/standings-board.tsx`, `components/players/players-board.tsx`).
- **Client components never import server helpers** (`lib/fixtures.ts` uses `react.cache` + Supabase).
  Share only types (`import type`) and client-safe code (`lib/format-date.ts`).
- **Show only real data.** No placeholder rows or invented labels ("Nežinomas stadionas", fake lineups);
  omit what is unknown and give an honest empty state. Route-level `loading.tsx` shows the page frame +
  skeleton while an uncached page renders.

## Type scale

DM Sans throughout. Body/UI use Tailwind's `text-xs` 12 / `sm` 14 / `base` 16 /
`lg` / `xl`. Three fluid tokens (in `tailwind.config.ts` `fontSize`) cover headings,
so no `md:text-*` pairs and no `text-[Npx]`:

| Class | Size (mobile -> desktop) | Line height | Use for |
|-------|--------------------------|-------------|---------|
| `text-display` | 40 -> 64px | 1.2, -0.02em | Hero / `.h1-public` |
| `text-headline` | 32 -> 48px | 1.25 | Section titles / `.h2-public` |
| `text-title` | 24 -> 32px | 1.25 | Page `<h1>` (dashboard and public) |

Layout tokens (in `tailwind.config.ts`): `min-h-promo` 420px promo tiles, `h-promo-player` 576px cut-out player height (its hover size;
it rests at `scale-promo-rest` = 0.78, about 450px, and scales to 1 on tile hover/focus from `md`).
`text-headline` and `text-title` carry -0.02em tracking (matches the Figma specs).

Weights: `font-bold` for headings, `font-semibold` for sub-heads, `font-medium` for UI.
Public helpers (`.h1-public`, `.h2-public`, `.p-public`, `.subheading-public`,
`.link-underline-public`) in `globals.css` are composed from these tokens.

Not yet tokenised (still arbitrary values): `#111111`, `#222222`, `#5F5F71`, hero gradients
(`#1a237e`, `#0f1f6b`). `app/naujienos/test/page.tsx` is a Figma export
scratch page and was left untouched.

## Adding a token

Add the primitive, then the semantic role, then the `@theme` binding — with a
comment recording where the value came from (Figma node, brand guide). Never skip
straight to a semantic token with a literal value.

## Rules

- No `style={{...}}` on JSX. Ever.
- No utility-class dumps on raw `div`s — extract a component past ~5 classes or on
  the second repetition. See [[component-conventions]].
- Mobile (React Native): every colour/spacing/radius comes from `useAppTheme()`;
  no raw hex or numbers in `StyleSheet.create()`.

## Related

[[component-conventions]] · [[components/ui]]
