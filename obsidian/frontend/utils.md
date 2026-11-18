---
tags: [frontend, catalog, wip]
updated: 2026-11-18
---

# Utils Catalog

Pure helpers in `src/utils/`. A util is pure, typed, and unit-testable; anything
with I/O or client state belongs in `lib/` or a hook instead.

| Util | File | Signature | Purpose |
|------|------|-----------|---------|
| `CLUB_SITE_URL`, `CLUB_SITE_LINKS` | `lib/site-links.ts` | constants | Links to pages on the club's WordPress site (fkbanga.lt: klubas, pamaina/academy, kontaktai). One place to change the domain |
| | | | |

## Related

[[folder-structure]]
