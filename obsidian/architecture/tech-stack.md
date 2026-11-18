---
tags: [architecture, wip]
updated: 2026-11-18
---

# Tech Stack

Every dependency and **why it is here**. Update this note whenever a dependency is
added, removed, or majorly upgraded — and add a [[changelog]] entry.

## Core

| Package | Version | Why |
|---------|---------|-----|
| `next` | ^15.5.29 | App Router framework (upgraded from 14.2.4, ADR-0007). Fetches are uncached by default; `params`/`cookies()`/`headers()` are async |
| `react`, `react-dom` | ^19.3.1 | Required by Next 15 App Router. `@types/react(-dom)` ^19 |
| `eslint-config-next` | ^15.5.29 | Matches Next |
| `@supabase/supabase-js`, `@supabase/ssr` | ^2 / ^0.4 | Data + auth |

**Install tooling.** Vercel runs `pnpm install` (`vercel.json`) so `pnpm-lock.yaml` is the lockfile that matters; `package-lock.json` is kept in sync for local npm. Regenerate both after dependency changes (`pnpm install --lockfile-only`). `react-day-picker@8` predates React 19: `overrides` in `package.json` silences npm's peer check (pnpm only warns).

## UI

| Package | Version | Why |
|---------|---------|-----|
| | | |

## Data & backend

| Package | Version | Why |
|---------|---------|-----|
| | | |

## Tooling

| Package | Version | Why |
|---------|---------|-----|
| | | |

## Deliberately NOT used

| Package | Why not | Use instead |
|---------|---------|-------------|
| | | |

## Related

[[system-overview]] · [[changelog]]

## Typography

- DM Sans (variable) via `next/font/google`, exposed as `--font-sans` and Tailwind `font-sans`. Subsets: latin, latin-ext. No self-hosted font files.
