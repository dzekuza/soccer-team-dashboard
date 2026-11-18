---
tags: [workflow, ai, stable]
updated: 2026-11-18
---

# AI Agent Guide

Rules of engagement for AI agents (Claude Code, Cursor) working in this repo.

## Source-of-truth hierarchy

| Layer | Files | Purpose |
|-------|-------|---------|
| **This vault** (`obsidian/`) | all of `obsidian/**` | **The single source of truth** — all project documentation, navigable & linked. |
| **AI entry points** (repo root) | `AGENTS.md`, `CLAUDE.md`, `.cursorrules` | Thin shims — they carry the hard rules and point into the vault. |
| **Global rules** | `~/Desktop/projects/CLAUDE.md` | Cross-project stack & style defaults. The vault overrides them where it disagrees. |

Keep the root shims consistent with the vault; the vault is canonical.

## Hard rules

The authoritative list is in `AGENTS.md`. In short: no hardcoded design values,
existing components first, no `any`, thin routes, Server Components by default,
server-only secrets, semantic HTML, never edit applied migrations.

## Where to look

| Question | Note |
|----------|------|
| How is the project structured? | [[system-overview]], [[folder-structure]] |
| What's in the stack? | [[tech-stack]] |
| How do I add a feature? | [[new-feature]] |
| How do I add a page? | [[new-page]] |
| How do I style something? | [[design-system]] |
| What components/hooks/utils exist? | [[components/ui]], [[components/common]], [[hooks]], [[utils]] |
| How does the API work? | [[api-architecture]] |
| Why was X decided? | [[decisions-log]] |

## Memory — two layers

- **Project memory** = this vault. Versioned with the code, reviewed in the same PR.
- **Cross-project memory** = `~/.claude/projects/-Users-rysardgvozdovic-Desktop-projects/memory/`,
  indexed by its `MEMORY.md`. For user preferences, corrections, and reusable
  references that apply to *every* project.

If a lesson is about this codebase, it goes in the vault. If it is about how the
user wants to work, it goes in cross-project memory. Never swap the two.

## After making changes

- New dependency → update [[tech-stack]] + [[changelog]].
- Architectural choice → add an ADR to [[decisions-log]].
- New component/hook/util → document it in the relevant catalog note.
- A correction you had to be told twice → promote it to a hard rule in `AGENTS.md`.

## Skills (`.claude/skills/`)

Skills are packaged playbooks Claude Code loads on demand. Every skill is
**registered here** so the routing rule is discoverable to any agent or human.

| Skill | Invoke when | Vault note |
|-------|-------------|------------|
| | | |

Registering a new skill: drop it in `.claude/skills/<name>/`, add a vault note under
`workflows/`, link it from [[README]] and the table above, and log it in [[changelog]].

## Automated enforcement (hooks)

This workflow is enforced by Claude Code hooks in `.claude/settings.json`:

| Hook | Fires | Effect |
|------|-------|--------|
| `SessionStart` | new chat / resume | Injects a pointer to read this vault first |
| `UserPromptSubmit` | every request | Reminds the agent to consult the relevant guide and update docs |
| `Stop` | end of every turn | Blocks **once** to confirm the vault matches the turn's changes |

The `Stop` hook blocks at most once per batch of edits — a `${TMPDIR}` marker keyed
by session id guarantees termination, and turns that only touched `obsidian/` never
block. Run `/hooks` to review or disable. See [[decisions-log]] ADR-0001.
