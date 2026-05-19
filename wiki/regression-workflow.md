# Regression workflow — per-page styling diff against production

Used during the `@dxlbnl/ui` migration to drive each page from "migrated but
visually different" to "migrated and matches production". Manual review +
library iteration, not a CI gate. The script is the template B8 (full-site
migration) hangs off — every page repeats this loop.

## Where things live

- Script: [`scripts/regression-diff.mjs`](../scripts/regression-diff.mjs).
- Per-page configs: [`scripts/regression-configs/`](../scripts/regression-configs/).
- Staging output (for review): `/tmp/regression-<pageSlug>.md`.
- Pushed output (for dxlb-ui agent): `~/Projects/Web/dxlb-ui/wiki/backlog/inbox/regression-<pageSlug>.md`.
  Rolling file — overwritten on every push.
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

2. Generate findings to staging:
     pnpm regression:diff scripts/regression-configs/<page>.js
   → writes /tmp/regression-<page>.md
   → exits 0 if no findings, 1 if findings remain

3. Read /tmp/regression-<page>.md. Decide: is this an actionable list?
   - Suppress noise via `ignore: [...]` per component in the config
   - Split or fix selectors via `propertyGroups: [...]`
   - Re-run step 2 until the staging file is sharp

4. Push to dxlb-ui's inbox:
     pnpm regression:diff scripts/regression-configs/<page>.js --push

5. dxlb-ui's manager picks up the inbox item, fixes the library,
   rebuilds dist/ (build:watch handles this automatically).

6. Re-run step 2 to verify. Loop steps 2–5 until exit code 0.

7. Commit the page migration in this repo:
     git commit -m "B8: /<page>/ — match production"

8. Next page (new config file, repeat from step 2).
```

## Per-page config shape

```js
// scripts/regression-configs/<page>.js
export default {
  pageSlug: '<page>',
  liveUrl:  'https://www.dexterlabs.nl/<page>/',
  localUrl: 'http://localhost:5174/<page>/',
  description: '<context appended to report — keep it tight>',
  components: [
    {
      name:            '<surface name>',          // human-readable
      live:            '<selector on prod>',
      local:           '<selector on dev>',
      component:       'Text',                    // library component (annotation)
      props:           'variant="eyebrow"',       // instance props (annotation, free-form)
      propertyGroups:  ['text'],                  // restrict diff to these groups
      ignore:          ['margin-bottom'],         // skip these props (library-canon decisions)
      notes:           '<optional one-liner>'
    },
    // …
  ]
};
```

### Property groups

The script captures computed styles bucketed into groups so a config can ask
for just the relevant subset per component:

- **text** — `font-family, font-size, font-weight, line-height, letter-spacing, text-transform, color`
- **layout** — `display, padding-*, margin-*, max-width, width, gap, grid-template-columns`
- **border** — `border-top-*, border-radius`
- **background** — `background-color`

Default (when `propertyGroups` is omitted): all groups. Use this for surfaces
where you want everything; restrict for surfaces where text and container are
different DOM nodes (e.g. eyebrow text in production is inherited from the
`.label` wrapper, but on the migrated page the text is its own `<span>` inside
an `<Inline>`).

### Ignore

Per-component property names to drop from the diff even when they differ.
Use for **library-canon** decisions where production was wrong and the library
is right (e.g. `margin-bottom` on eyebrow text — library says parent Stack
owns spacing; production hand-rolled a margin).

Document the reason in a comment next to the `ignore` list so future-you (or
the dxlb-ui agent) knows why a property is excluded.

## Report format

One section per component with at least one diff. Section header:

```
### <surface name> — `<LibraryComponent props>` (`<local selector>`)
```

Each diff line:

```
- `<property>`: `<value on local (new)>` → should be `<value on live (old)>`
```

The dxlb-ui agent treats the right-hand value as the target. If production is
itself wrong, that's a separate design decision — flag it in the config's
description.

## Caveats

- Both pages render in the default palette. Add init script via Playwright's
  `addInitScript` to test the non-default palette when needed.
- Width/spacing diffs are often downstream effects of layout-container choices.
  Add to `ignore` per component when the diff isn't actionable at the library
  level.
- Selector mismatches (one side doesn't match) show up in the report's
  "Selector errors" section. Fix the config or note that the surface doesn't
  exist post-migration.
