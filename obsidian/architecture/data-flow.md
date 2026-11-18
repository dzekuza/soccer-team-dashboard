---
tags: [architecture, wip]
updated: 2026-11-18
---

# Data Flow

How state and data move through the app.

## Server data

<!-- Server Components + async/await; where fetching happens; caching/revalidation. -->

## Client data

<!-- TanStack Query: query keys, staleness, invalidation rules. -->

## Client state

<!-- Local state vs context vs store. When each is appropriate. -->

## Forms

<!-- React Hook Form + Zod; where schemas live; server-action validation. -->

## Loading / error / empty

Every async surface must handle all three states. Document the shared skeleton and
error components here once they exist.

## Related

[[system-overview]] · [[api-architecture]]
