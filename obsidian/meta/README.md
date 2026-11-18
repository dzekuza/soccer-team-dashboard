---
tags: [meta, stable]
updated: 2026-11-18
---

# Meta — How this vault works

Documentation *about* the documentation.

## Purpose

The vault is the project's **second brain**. Any contributor — human or AI — can
understand how `soccer-team-dashboard` is built without reverse-engineering the codebase.
The code is the *what*; this vault is the *why* and *how*.

## Structure

```
obsidian/
├── README.md       ← vault home / Map of Content
├── meta/           ← docs about the docs, changelog, decisions, status, session log
├── architecture/   ← system-level: stack, structure, data flow
├── frontend/       ← everything UI: routing, styling, components
├── backend/        ← API, database, auth
├── workflows/      ← repeatable playbooks & AI agent rules
└── templates/      ← note templates for new components/hooks/ADRs
```

## Conventions

- **Wikilinks** — link generously with `[[note-name]]`. A link to a not-yet-written
  note is fine; it marks something worth documenting later.
- **Frontmatter** — every note carries `tags` and an `updated` date.
- **Tags** — see the tag legend in the [[README|vault home]].
- **One concept per note** — keep notes focused and linkable.

## Maintenance rules

1. Dependency changes → update [[tech-stack]] and add a [[changelog]] entry.
2. Architectural choice → add an ADR to [[decisions-log]].
3. New component/hook/util → document it and link it from the relevant catalog.
4. A rule you had to state twice → promote it into `AGENTS.md`'s hard rules.
5. End of any session that changed something → rewrite [[status]] (current focus, in progress, next) and add an entry to [[session-log]].

## Source-of-truth note

This vault is the single source of truth. The repo root keeps only thin shims —
`AGENTS.md`, `CLAUDE.md`, `.cursorrules` — which carry the hard rules and point
here. See [[ai-agent-guide]].
