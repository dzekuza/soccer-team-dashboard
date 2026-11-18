---
tags: [backend, wip]
updated: 2026-11-18
---

# Database

## Rules

- **RLS on every table** — no exceptions, including join and lookup tables.
- **Never modify an applied migration.** A schema change is always a new migration.
- Server-side auth uses `@supabase/ssr`; never the browser client on the server.
- The service-role key is server-only and never reaches the client bundle.
- Regenerate types after a schema change and commit them.

## Schema

| Table | Purpose | RLS policy summary |
|-------|---------|--------------------|
| | | |

## Migrations

| File | Date | What it does |
|------|------|--------------|
| | | |

## Related

[[api-architecture]] · [[environment-variables]] · [[decisions-log]]
