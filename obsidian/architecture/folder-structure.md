---
tags: [architecture, wip]
updated: 2026-11-18
---

# Folder Structure

Where everything lives and what belongs where. If a file has no obvious home, the
answer belongs in this note before the file is written.

```
src/
├── app/            ← routes only; thin, delegate to views
├── views/          ← page-level composition
├── components/
│   ├── ui/         ← design-system primitives (shadcn/ui etc.)
│   └── common/     ← shared composed components
├── hooks/          ← custom hooks — catalog: [[hooks]]
├── lib/            ← clients, config, integrations
├── utils/          ← pure helpers — catalog: [[utils]]
├── data/           ← static data & mocks
└── types/          ← shared types
```

## Rules

- **kebab-case** file names: `event-card.tsx`, `use-auth.ts`.
- Route groups in parentheses: `(auth)/`, `(dashboard)/`.
- Feature-specific components live next to the feature, not in `components/ui/`.
- Co-locate types with the code that uses them; shared types go in `types/`.
- Assets per section under `public/assets/<section>/`.

## Related

[[routing]] · [[component-conventions]]
