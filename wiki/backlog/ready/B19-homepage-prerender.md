---
id: B19
title: Enable prerender on homepage
type: chore
priority: medium
created: 2026-05-21
---

## Description

`src/routes/(console)/+page.server.ts:14` has `export const prerender = false`, which was intentional when the homepage needed to be dynamic. The homepage is now ready to be statically generated — it loads notes, products, and projects from `import.meta.glob` which is entirely build-time data.

Change `prerender = false` → `prerender = true` (or remove the declaration entirely to inherit from the layout). Verify the build produces a static `index.html` and that no request-time data is used.

## Notes

- `src/routes/(console)/+page.server.ts:14`
- Parent layout `src/routes/(console)/+layout.ts:1` already declares `prerender = true`
- After change, `pnpm build` should produce a static homepage in `build/index.html`
