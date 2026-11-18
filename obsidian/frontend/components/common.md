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
| TicketsApparelSection | `components/tickets-apparel-section.tsx` | Landing "Įsigykite" heading + Atributika/Bilietai promo tiles (local `PromoTile`); Figma 1100:81335; assets in `public/landing/` (player cut-outs are 2x WebP; `images.unoptimized` is on, so pre-size assets); tiles clip fully when stacked, players may rise into the heading band from `md` | #wip |
| | | | #wip |

## Related

[[component-conventions]] · [[components/ui]]
