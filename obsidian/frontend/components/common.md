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
| PageHeading | `components/common/page-heading.tsx` | Title bar with the page's single `<h1>` | #wip |
| ContentSection | `components/common/content-section.tsx` | Titled block (heading left, content right from `lg`); `id` + `aria-labelledby` | #wip |
| ClubDocuments | `components/club/club-documents.tsx` | Accordion of PDF groups (links open fkbanga.lt files in a new tab) | #wip |
| ContactCard | `components/club/contact-card.tsx` | Icon + heading + details card | #wip |
| AcademyGroupCard | `components/club/academy-group-card.tsx` | Birth-year group with contact name and phone | #wip |
| | | | #wip |

## Related

[[component-conventions]] · [[components/ui]]
