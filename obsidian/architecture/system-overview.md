---
tags: [architecture, wip]
updated: 2026-11-18
---

# System Overview

The big picture of `soccer-team-dashboard` — what it is, how a request flows, and the mental
model to hold while working on it.

## What it is

<!-- 2–3 sentences: product, users, deployment target. -->

## Mental model

<!-- The one paragraph you would tell a new contributor before they open any file. -->

## Request lifecycle

<!-- Browser → route → view → data source → back. Note where the boundary between
     Server and Client Components sits. -->

## Boundaries

| Concern | Owned by | Notes |
|---------|----------|-------|
| Routing | `app/` | thin, delegates — see [[routing]] |
| UI | `components/`, `views/` | see [[component-conventions]] |
| Data | | see [[data-flow]] |
| Secrets | server only | see [[environment-variables]] |

## Related

[[tech-stack]] · [[folder-structure]] · [[data-flow]]
