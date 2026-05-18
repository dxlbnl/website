---
id: B3
title: Component library integration
type: feature
priority: high
flags: []
created: 2026-05-18
spec: wiki/specs/B3-component-library-integration.md
---

## Description

Dexter has designed a new component library. The goal is to integrate it into the site — replacing or wrapping the current ad-hoc `src/lib/ui/` components. This is a large change that touches the visual layer across every route. Needs a scoping session before implementation: what the component library looks like, how it's distributed (npm package? monorepo?), and what the migration strategy is (big-bang vs. incremental per-component).

## Notes

- Flagged `review` — manager will pause for approval before dispatching any work on this.
- Current UI components live in `src/lib/ui/`. See `wiki/codebase.md` for the full inventory.
- The design language (phosphor/paper palette, CSS variables) must be preserved or the component library must carry it.

### Constraints (Dexter, 2026-05-18)

- **Distribution**: `@dxlbnl/ui` on npm — https://www.npmjs.com/package/@dxlbnl/ui. Install via pnpm.
- **Incremental = page by page**: migrate one route at a time. A page is "done" only when it renders **entirely through `@dxlbnl/ui`** — no raw HTML elements, no inline CSS, no `<style>` blocks, no imports from `src/lib/ui/`. Once every page that imported a given `src/lib/ui/` component has been migrated, that component gets deleted.
- **Don't stop on gaps**: if a needed component is missing from `@dxlbnl/ui`, log it to `wiki/missing-components.md` (with the page that needs it and what's missing) and keep migrating what's possible. Do **not** add a placeholder HTML/CSS fallback in the app — leave that page incomplete and move on. Filling gaps in `@dxlbnl/ui` is a separate stream of work.
- **First page**: pick the smallest, lowest-risk route as a proving ground. The spec-writer recommends which.
- **Review flag dropped (2026-05-18, overnight run)**: Dexter authorized running the full pipeline without manager pauses. Escalations still stop per normal rules.
