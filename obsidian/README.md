---
tags: [moc, home]
updated: 2026-11-18
---

# 🧠 soccer-team-dashboard — Project Brain

This vault is the **single source of truth** for `soccer-team-dashboard`. It documents how the
project is built, why decisions were made, and how to extend it — for both humans
and AI agents (Claude Code, Cursor).

> [!info] What is this project?
> <!-- One paragraph: what soccer-team-dashboard is, who it is for, what stage it is at. -->

## 🗺️ Map of Content

### 00 — Meta
- [[meta/README|Meta overview]] — how to use and maintain this vault
- [[changelog]] — chronological log of notable project changes
- [[decisions-log]] — Architecture Decision Records (ADRs)
- [[status]] — live snapshot: current focus, in progress, next, blockers
- [[session-log]] — what each session changed and where it left the project

### 01 — Architecture
- [[system-overview]] — the big picture, request lifecycle, mental model
- [[tech-stack]] — every dependency and why it is here
- [[folder-structure]] — where everything lives and what belongs where
- [[data-flow]] — how state and data move through the app
- [[environment-variables]] — config & secrets handling

### 02 — Frontend
- [[routing]] — App Router conventions, route → view delegation
- [[design-system]] — tokens, CSS layers, styling rules
- [[component-conventions]] — how to write & place components
- [[html-semantics]] — semantic, accessible, SEO-correct markup rules
- [[components/ui|UI primitives catalog]]
- [[components/common|Common components catalog]]
- [[hooks]] — custom hooks catalog
- [[utils]] — utility functions catalog

### 03 — Backend
- [[backend/README|Backend overview]]
- [[api-architecture]] — route-handler / server-action convention & secret handling
- [[database]] — schema, RLS, migrations

### 04 — Workflows
- [[new-feature]] — playbook for implementing a feature
- [[new-page]] — playbook for implementing a page/section
- [[ai-agent-guide]] — rules of engagement for AI agents working in this repo

### Templates
- [[templates/component-note|Component note template]]
- [[templates/hook-note|Hook note template]]
- [[templates/adr-note|ADR template]]

## 🏷️ Tag legend

| Tag | Meaning |
|-----|---------|
| `#stable` | Documented and reliable — safe to depend on |
| `#wip` | Work in progress / partially documented |
| `#todo` | Needs attention or is unfinished |
| `#decision` | Records or relates to an architectural decision |
| `#do-not-modify` | Code that must not be edited without sign-off |

## 🔌 Obsidian setup

Open this folder (`obsidian/`) as an Obsidian vault. Recommended:
- **Graph view** — see how specs, components, and hooks connect
- **Dataview plugin** — query notes (e.g. list all `#wip` pages)
- **Templates core plugin** — point it at the `templates/` folder
