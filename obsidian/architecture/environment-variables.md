---
tags: [architecture, wip]
updated: 2026-11-18
---

# Environment Variables

## Rules

- Secrets are **server-only** — never `NEXT_PUBLIC_`.
- Never hardcode URLs or keys in source.
- `.env.example` must exist and stay in sync with the table below.
- Never log or print an env var value.
- The `.env*` files are edited by the project owner, not by agents — an agent
  states what to add; the owner adds it.

## Variables

| Name | Scope | Required | Purpose |
|------|-------|----------|---------|
| | client / server | | |

## Access

<!-- Document the typed accessor (e.g. src/env.ts) and how to add a new var to it. -->

## Related

[[api-architecture]] · [[tech-stack]]
