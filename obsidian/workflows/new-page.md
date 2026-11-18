---
tags: [workflow, playbook, stable]
updated: 2026-11-18
---

# Workflow — Implement a New Page / Section

## Steps

1. **Get the design.** Collect the desktop + mobile frames. Use the Figma MCP server
   to read exact measurements, colours, typography, and spacing — don't eyeball them.
2. **Plan the route.** Add `app/<route>/page.tsx` — thin, delegates ([[routing]]).
3. **Build the view.** `src/views/<page-name>.tsx`. The route imports only from `views/`.
4. **Break into components.** Reuse [[components/ui]] and [[components/common]] first.
   New primitives → `components/ui/`; feature pieces → next to the feature. Each gets
   a typed `interface ...Props` ([[component-conventions]]).
5. **Tokens before styles.** Every colour/spacing/type/radius references a token.
   Missing value → add the token first, with a comment on its origin ([[design-system]]).
6. **Content via props/hooks.** No hardcoded content. Placeholders →
   `src/data/mocks/<page-name>.ts`. Async data → hook + loading/error/empty states.
7. **Assets per section.** `public/assets/<section>/`, referenced by absolute path.
8. **Server-first.** Server Components by default; `"use client"` only at leaves.
9. **Semantic & accessible markup.** [[html-semantics]] — one `<h1>`, landmarks,
   native elements, visible focus, `alt` text.
10. **Metadata.** Title, description, OG image ([[seo-metadata]]).
11. **Quality.** Lint, components < ~150 lines, conventional commit.

## Deliverables

- All components in their correct folders
- The view file assembling them
- Any new tokens (commented)
- Mock data file if needed
- Section assets under `public/assets/<section>/`
- Route row added to [[routing]]
- A short summary: assumptions, new tokens & why, any design values that couldn't
  map to existing tokens (flag for design review)

> [!important]
> Updating an existing page? Preserve all existing logic. Keep diffs minimal.
