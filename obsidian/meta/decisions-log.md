---
tags: [meta, decision]
updated: 2026-11-18
---

# Decisions Log (ADRs)

Architecture Decision Records. Each entry captures a choice, its context, and its
consequences. Use [[templates/adr-note]] for new entries. Newest first.

---

## ADR-0003 — Role hardening: first signup is admin, everyone else is staff

- **Status:** Accepted — migration `20261118000016_harden_roles_and_policies.sql` applied to the remote DB.
- **Date:** 2026-11-18

**Context.** Automated security review flagged: the signup trigger made every new user
`admin`, and most tables/storage buckets allowed any authenticated user to write.
Database currently has zero users, so tightening breaks nobody.

**Decision.** `handle_new_user` makes the first user admin (bootstrap) and later users
`staff`. Writes on events, tiers, players, standings, posts, subscription types and the
public storage buckets become admin-only; staff can read tickets/subscriptions and update
tickets (scanner validation). Open signup should also be disabled in Supabase Auth.

**Amendment (migration `…17`, applied).** Later signups are now `pending` (no privileges at all), not `staff`; staff must be promoted explicitly. A trigger limits staff updates on `tickets` to `is_validated`/`validated_at`/`status`/`updated_at` (the scanner uses the user session, so UPDATE can't be dropped). Known residual risk: while signup is open, whoever registers first becomes admin — register first, then disable signup (or switch to seeding the admin by SQL).

**Consequences.** New teammates must be promoted with
`update public.users set role='staff' where email=...` (or `'admin'`). Dashboard writes done with a staff
session will be rejected by RLS.

---

## ADR-0002 — Replace the legacy migration chain with a rebuilt baseline

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** The new Supabase project was empty and the old project is inaccessible.
The ~40 legacy migrations had out-of-order timestamps, drop/recreate churn, and
omitted tables created by hand (coupon_codes, subscription_types, user_subscriptions,
banga_playerss, standings_al, posts, subscribers, profiles) and the
`create_event_with_tiers` RPC.

**Decision.** Archive them in `supabase/legacy-migrations/` and write a new ordered
set from the current code's needs; reuse the self-contained legacy files (shop,
standings, drafts, templates, fixtures) with fixes. Add RLS to the shop tables.

**Consequences.** Columns of hand-made tables are inferred, so mismatches may surface
at runtime and need follow-up migrations. History no longer matches the old project's
`schema_migrations`; never run these against the old database.

---

## ADR-0001 — Documentation lives in an in-repo Obsidian vault

- **Status:** Accepted
- **Date:** 2026-11-18

**Context.** Project knowledge (why a pattern exists, what not to touch, how to add
a feature) was scattered across chat history, READMEs, and people's heads. AI agents
re-derived it every session and got it wrong.

**Decision.** All project documentation lives in `obsidian/`, a linked Obsidian vault
committed to the repo. Root `AGENTS.md` / `CLAUDE.md` / `.cursorrules` are thin shims
pointing into it. Claude Code hooks inject the pointer at session start, remind on
every prompt, and block once at Stop when code changed without a doc update.

**Consequences.** Documentation is versioned with the code and reviewed in the same
PR. Every code change carries a doc obligation. Agents get consistent context without
re-reading the whole codebase.

---
