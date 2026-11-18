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
| `font-sans` | `--font-sans` | DM Sans (variable) | All text; loaded by `next/font/google` (latin + latin-ext) |

Not yet tokenised (still arbitrary values): `#FFCC00`, `#FF3B30`, `#111111`,
`#222222`, `#5F5F71`, hero gradients (`#1a2b6b`, `#1a237e`, `#0f1f6b`), and the
type scale (`text-[14px]` etc.). `app/naujienos/test/page.tsx` is a Figma export
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
