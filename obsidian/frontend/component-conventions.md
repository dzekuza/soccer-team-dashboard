---
tags: [frontend, wip]
updated: 2026-11-18
---

# Component Conventions

## Placement

| Kind | Location |
|------|----------|
| Design-system primitive | `components/ui/` |
| Shared composed component | `components/common/` |
| Feature-specific | `components/<feature>/` |
| Page composition | `views/` |

**Check `components/ui/` before writing anything from scratch.** Prefer the
existing shadcn/ui primitive (`Button`, `Card`, `Badge`, `Dialog`, `Sheet`,
`Input`) over a hand-rolled equivalent.

## Rules

- Functional components and hooks only. Named exports (except Next.js pages/layouts).
- A typed `interface <Name>Props` for every component. No `any`.
- Server Component by default; `"use client"` only at the leaf that needs it.
- Extract past ~150 lines, or when a JSX block repeats, or when it represents a
  distinct UI concept (card, badge, section header, empty state).
- No hardcoded user-visible strings when the project uses i18n — use translation
  keys. Without i18n, hoist repeated strings into a constant.
- Content via props/hooks, never hardcoded in the component.

## Documenting a new component

Duplicate [[templates/component-note]], fill it in, and link it from
[[components/ui]] or [[components/common]].

## Related

[[design-system]] · [[html-semantics]] · [[folder-structure]]
