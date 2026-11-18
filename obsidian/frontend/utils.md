---
tags: [frontend, catalog, wip]
updated: 2026-11-18
---

# Utils Catalog

Pure helpers in `src/utils/`. A util is pure, typed, and unit-testable; anything
with I/O or client state belongs in `lib/` or a hook instead.

| Util | File | Signature | Purpose |
|------|------|-----------|---------|
| `CLUB_*`, `ACADEMY_*` | `lib/club-content.ts` | typed constants | Static copy and contacts for Klubas / Pamaina / Kontaktai (copied from fkbanga.lt 2026-11-18); edit here when staff or numbers change |
| `CLUB_DOCUMENT_GROUPS` | `lib/club-documents.ts` | typed constant | 33 public PDFs grouped for the Klubas page; files stay hosted on fkbanga.lt |
| `getLatestPosts(limit)`, `LandingPost` | `lib/posts.ts` | `async (n) => LandingPost[]` | Server-side newest posts for the landing page (excerpt derived from content when missing) |
| | | | |

## Related

[[folder-structure]]
