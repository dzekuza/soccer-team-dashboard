---
tags: [workflow, playbook, stable]
updated: 2026-11-18
---

# Workflow — Implement a Feature

## Steps

1. **Read first.** [[system-overview]] for the mental model, then the topic note
   the feature touches ([[design-system]], [[api-architecture]], [[database]]).
2. **Check what exists.** [[components/ui]], [[components/common]], [[hooks]],
   [[utils]] — reuse before building.
3. **Model the data.** Schema change → new migration + RLS + regenerated types
   ([[database]]). Never edit an applied migration.
4. **Server boundary.** External calls and secrets stay server-side; validate input
   with `zod`; return the `{ data } | { error }` envelope ([[api-architecture]]).
5. **Build the UI.** Primitives from `components/ui/`; tokens for every visual
   value ([[design-system]]); typed props; Server Components by default.
6. **States.** Handle loading, error, and empty on every async surface.
7. **Semantics.** Follow [[html-semantics]].
8. **Quality.** Lint and typecheck. Components under ~150 lines. Conventional commit.
9. **Document.** New component/hook/util → catalog note. Dependency → [[tech-stack]]
   + [[changelog]]. Architectural choice → ADR in [[decisions-log]].

## Deliverables

- Code in the correct folders per [[folder-structure]]
- Migration + RLS policy if the schema changed
- New tokens (commented with their origin) if any
- Vault updates from step 9
- A short summary: assumptions made, anything flagged for review

> [!important]
> Extending existing code? Preserve existing behaviour. Keep the diff minimal and
> focused on the required change.
