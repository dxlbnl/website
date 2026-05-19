---
id: B6
title: Fix a11y warnings in 007-zod4-mock note
type: chore
priority: low
flags: []
created: 2026-05-18
---

## Description

`pnpm test` emits Svelte a11y warnings during `content/notes/007-zod4-mock/index.md`
rendering — `tabindex` on non-interactive elements (and likely related
keyboard-handler warnings). These are pre-existing and unrelated to B3; the
reviewer flagged them while running the full suite. Audit the note's markdown,
remove the offending attributes or add the missing event handlers, and confirm
the suite emits zero a11y warnings.

## Notes

- Reviewer reference: B3 review report bonus finding #5.
- Probably comes from raw HTML embedded in the mdsvex source. Look for
  `tabindex=` on `<div>`, `<span>`, `<figure>`, etc. and either remove or pair
  with keyboard handlers.
