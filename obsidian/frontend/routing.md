---
tags: [frontend, wip]
updated: 2026-11-18
---

# Routing

App Router conventions and the route → view delegation rule.

## The rule

`app/**/page.tsx` is **thin**: metadata + a single import from `views/`. All
composition lives in the view. This keeps routes swappable and views testable.

```tsx
// app/about/page.tsx
import { AboutView } from "@/views/about";
export const metadata = { title: "About" };
export default function Page() { return <AboutView />; }
```

## Route map

| Route | View | Status |
|-------|------|--------|
| `/klubas` | `views/club-view.tsx` | #wip |
| `/pamaina` | `views/academy-view.tsx` | #wip |
| `/kontaktai` | `views/contacts-view.tsx` | #wip |
| `/` | | #wip |

## Conventions

- Route groups `(name)/` for layout grouping without a URL segment.
- `loading.tsx` / `error.tsx` / `not-found.tsx` at every meaningful boundary.
- Navigation via `next/link` and `next/navigation` `useRouter`.

## Related

[[folder-structure]] · [[component-conventions]] · [[seo-metadata]]
