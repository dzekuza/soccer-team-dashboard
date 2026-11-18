---
tags: [frontend, wip]
updated: 2026-11-18
---

# HTML Semantics & Accessibility

Semantic, accessible, SEO-correct markup is a hard rule, not a polish pass.

## Rules

- Native elements over `div`s: `button`, `a`, `nav`, `main`, `section`, `article`,
  `header`, `footer`, `dl`, `table`.
- Exactly one `<h1>` per page; a clean heading outline with no skipped levels.
- Named landmarks (`aria-label` on repeated `nav`/`section`).
- Real `<button>` for actions, real `<a href>` for navigation — never a clickable `div`.
- `alt` on every meaningful image; `alt=""` on decorative ones.
- Visible focus states; keyboard reachable in DOM order.
- Structured data as JSON-LD, not microdata.
- Respect `prefers-reduced-motion`.

## Checklist before shipping a page

- [ ] One `<h1>`, ordered headings
- [ ] Landmarks present and labelled
- [ ] All interactive elements keyboard-operable with visible focus
- [ ] Images have `alt`
- [ ] Colour contrast ≥ 4.5:1 for body text
- [ ] Form inputs have associated `<label>`s

## Related

[[component-conventions]] · [[seo-metadata]]
