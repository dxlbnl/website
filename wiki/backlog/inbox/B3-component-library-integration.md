---
id: B3
title: Component library integration
type: feature
priority: high
flags: [review]
created: 2026-05-18
---

## Description

Dexter has designed a new component library. The goal is to integrate it into the site — replacing or wrapping the current ad-hoc `src/lib/ui/` components. This is a large change that touches the visual layer across every route. Needs a scoping session before implementation: what the component library looks like, how it's distributed (npm package? monorepo?), and what the migration strategy is (big-bang vs. incremental per-component).

## Notes

- Flagged `review` — manager will pause for approval before dispatching any work on this.
- Current UI components live in `src/lib/ui/`. See `wiki/codebase.md` for the full inventory.
- The design language (phosphor/paper palette, CSS variables) must be preserved or the component library must carry it.
- Migration approach TBD: could be a new package added to `pnpm-workspace.yaml`, or an external npm install.
