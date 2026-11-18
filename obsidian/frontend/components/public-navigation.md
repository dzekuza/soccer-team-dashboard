---
tags: [frontend, component, wip]
updated: 2026-11-18
---

# Component — PublicNavigation

- **File:** `components/public-navigation.tsx`
- **Type:** Client Component (`"use client"`)
- **Status:** #wip

## Purpose

Header for all public pages: upcoming-match info bar (from `/api/matches/upcoming`),
main nav with dropdowns (Komandos, Bilietai ir abonementai), cart button, and a mobile
menu sheet. The whole header block (info bar + nav) is `sticky top-0 z-50`, so it stays
visible on scroll. Do not put `overflow` on page wrappers above it — that breaks sticky.

## Props

```ts
interface PublicNavigationProps {
  currentPage?: string
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `string` | `"events"` | Highlights the matching nav item |

## Notes

- Logo: `/banga-logo.svg` (`public/banga-logo.svg`). The old `/Banga-1.png` does not exist.
- Known debt: hardcoded hex colours and long class strings (breaks the token rules in [[design-system]]); nav items are hardcoded Lithuanian strings.

## Related

[[common]] · [[component-conventions]]
