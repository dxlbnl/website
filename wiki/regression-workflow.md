# Regression workflow — per-page styling diff against production

Used during the `@dxlbnl/ui` migration to drive each page from "migrated but
visually different" to "migrated and matches production". The script is the
template B8 (full-site migration) hangs off — every page repeats this loop.

## Where things live

- Script: [`scripts/regression-diff.mjs`](../scripts/regression-diff.mjs).
- Per-page configs: [`scripts/regression-configs/`](../scripts/regression-configs/).
- Output (cross-repo handoff): the dxlb-ui repo's backlog inbox, at
  `~/Projects/Web/dxlb-ui/wiki/backlog/inbox/regression-<pageSlug>.md`.
  Rolling file — overwritten on every run so the dxlb-ui manager always
  works the current list.
- Pinned dependency: `@dxlbnl/ui` is overridden to `link:../dxlb-ui` in
  `package.json` → `pnpm.overrides`. `node_modules/@dxlbnl/ui` is a symlink.
- Library build path: the linked package reads from
  `~/Projects/Web/dxlb-ui/dist/`, populated by `pnpm build` (one-shot) or
  `pnpm build:watch` (rebuilds `dist/` on every src change) inside the
  dxlb-ui repo.

## The loop

```
1. Keep dxlb-ui's dist/ warm:
     cd ~/Projects/Web/dxlb-ui && pnpm build:watch

2. Generate findings:
     pnpm regression:diff scripts/regression-configs/<page>.js
   → writes ~/Projects/Web/dxlb-ui/wiki/backlog/inbox/regression-<page>.md
   → exits 0 if green, non-zero if findings remain

3. dxlb-ui manager picks up the file, fixes the library, rebuilds dist/
   (build:watch handles this automatically).

4. Re-run step 2. Loop until exit code 0.

5. Commit the page migration in this repo:
     git add … && git commit -m "B8: /<page>/ — match production against @dxlbnl/ui <version>"

6. Move on to the next page (new config, repeat from step 2).
```

## Per-page config shape

```js
// scripts/regression-configs/<page>.js
export default {
  pageSlug: '<page>',
  liveUrl:  'https://www.dexterlabs.nl/<page>/',
  localUrl: 'http://localhost:5174/<page>/',
  // optional: extra notes appended to the report's Description section
  description: '<context for the dxlb-ui agent>',
  components: [
    { name: '<semantic name>', live: '<selector on prod>', local: '<selector on dev>', notes: '<optional>' },
    // ...
  ]
};
```

The script captures a curated set of computed-style properties (font, spacing,
colour, layout) and diffs them per component. Extend the property list in the
script (`STYLE_PROPS` at the top of `regression-diff.mjs`) when a fix turns out
to depend on something not captured.

## Report format

One section per component with at least one diff. Each diff is:

```markdown
- `property`: `<value on local (new)>` → should be `<value on live (old)>`
```

The dxlb-ui agent treats the right-hand value as the target. If production is
itself wrong, that's a separate design decision and is handled by editing the
report's `description` (or filing a separate item in dxlb-ui's backlog).

## Caveats

- Both pages render in the default palette. If you need to diff a non-default
  palette, set `data-palette="paper"` on the document via Playwright's
  `addInitScript` — feature to add to the script when first needed.
- Width diffs are noisy: many are downstream effects of layout-container
  choices, not library bugs. The dxlb-ui agent triages.
- Selector mismatches (one side doesn't match) show up in the report's
  "Selector errors" section. Either fix the config or note that the surface
  doesn't exist post-migration.
