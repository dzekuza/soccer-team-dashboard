# Agent Guide — soccer-team-dashboard

## Documentation lives in the vault

All project documentation is the **`obsidian/`** Obsidian vault — it is the
single source of truth for how this project is built. This file is a thin shim:
it carries the hard rules and points into the vault.

**Before working, read:**
- `obsidian/README.md` — Map of Content (index of every doc)
- `obsidian/workflows/ai-agent-guide.md` — full rules of engagement
- The topic note relevant to the task (e.g. `frontend/design-system.md` before
  styling work, `workflows/new-feature.md` before building a feature)

Notes link each other with `[[wikilinks]]` — follow them to navigate.

## Hard rules (never violate)

1. **No hardcoded design values** — design tokens for colour/spacing/type/radius;
   props/hooks for content. No raw hex or px in class names, no `style={{...}}`.
   See `obsidian/frontend/design-system.md`.
2. **Use existing components first** — check `components/ui/` before writing any
   element from scratch. See `obsidian/frontend/component-conventions.md`.
3. **No `any`.** Type everything; `unknown` for genuinely dynamic values. Run the
   project's lint before finishing.
4. **Routes stay thin** — `app/**/page.tsx` delegates to a view/feature module.
5. **Server Components by default**; `"use client"` only at the leaves.
6. **Secrets are server-only** — never `NEXT_PUBLIC_` for a secret; external API
   calls run server-side. Validate input with `zod`. See
   `obsidian/backend/api-architecture.md`.
7. **Semantic, accessible, SEO-correct HTML** — native elements over `div`s, one
   `<h1>`, named landmarks, `alt` text. See `obsidian/frontend/html-semantics.md`.
8. **Never edit applied migrations** — new schema change → new migration. RLS on
   every table. See `obsidian/backend/database.md`.

<!-- PROJECT-SPECIFIC RULES: add rules unique to this project below. -->

## Memory — two layers

| Layer | Where | What goes there |
|-------|-------|-----------------|
| **Project memory** | `obsidian/` vault (in-repo, versioned) | Anything true about *this* project: architecture, decisions, catalogs, changelog. |
| **Cross-project memory** | `~/.claude/projects/-Users-rysardgvozdovic-Desktop-projects/memory/` | Lessons that apply to *every* project: user preferences, corrections, reusable references. Index each in `MEMORY.md`. |

Never put project facts in cross-project memory, and never put personal
preferences in the vault.

## After making changes

Update the vault in the **same turn**: dependency change → `architecture/tech-stack.md`
+ `meta/changelog.md`; architectural choice → an ADR in `meta/decisions-log.md`;
new component/hook/util → the relevant catalog note under `frontend/`.
