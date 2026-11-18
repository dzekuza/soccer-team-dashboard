---
tags: [frontend, wip]
updated: 2026-11-18
---

# SEO & Metadata

## Conventions

- Metadata via the App Router `metadata` export / `generateMetadata`.
- Every route sets `title` and `description`; templates live in the root layout.
- Open Graph + Twitter card images per route where it matters.
- `sitemap.ts` and `robots.ts` in `app/`.
- Canonical URLs from a single `siteUrl` config value, never hardcoded.
- JSON-LD via a shared component — see [[html-semantics]].

## Per-route metadata

| Route | Title | Description | OG image |
|-------|-------|-------------|----------|
| | | | |

## Related

[[routing]] · [[html-semantics]]
