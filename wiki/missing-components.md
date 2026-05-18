# Missing components in `@dxlbnl/ui`

Tracker for components, props, or variants the site needs but `@dxlbnl/ui` does not (yet)
provide. Populated during the page-by-page migration (B3 and follow-ups). Filling these
gaps is **separate work on the component library itself** — not in this repo.

When a migration encounters a gap:
1. Add a row below with the page being migrated, what was needed, and what fallback
   was used (almost always: "page left unmigrated for this surface").
2. **Do not** patch the gap with raw HTML / inline CSS in this repo. Per B3 constraints,
   the only acceptable rendering path is `@dxlbnl/ui`.
3. Move on to the next page or surface.

When a gap is resolved (component shipped in a new `@dxlbnl/ui` version), strike the row
through and add a note with the version that fixed it, then re-attempt the migration.

## Open gaps

| Page / surface | Needed component or capability | First noticed | Fallback while missing |
|---|---|---|---|
| _(none yet — populated during migration)_ | | | |

## Resolved

| Page / surface | Component | Resolved in | Notes |
|---|---|---|---|
| _(none yet)_ | | | |
