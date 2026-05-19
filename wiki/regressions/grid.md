---
id: REG-grid-2026-05-19
title: "Regression — Grid has no responsive collapse"
type: bug
priority: high
flags: []
created: 2026-05-19
---

## Description

`<Grid cols={2}>` (or 3 / 4) keeps its column count at every viewport size.
On narrow viewports — phones, sidebars, narrow containers — a two-column
layout of body text becomes unreadable: each column ends up ~150–180px wide.

Production for the equivalent surface (`/about/`) used a container query to
collapse the grid:

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  @container (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
```

Container queries work because `<Container>` already sets
`container-type: inline-size` on its wrapper. So an `@container` rule
inside `<Grid>` is the right vehicle for this collapse — it tracks the
parent Container, not the viewport, which is exactly what we want for
nested layouts.

## Scope

A scan of the consuming repo turned up two categories of grid usage:

**Equal-column grids (this fix covers all of them):**
- `src/lib/ui/Signature.svelte` — 1fr 1fr → 1fr at 720px (legacy; superseded by `src/lib/Signature.svelte` which uses `<Grid cols={2}>`)
- `src/lib/ui/Footer.svelte` — repeat(5, 1fr) → repeat(2, 1fr) at 720px (note: this is a 5→2 step; the simple 1fr collapse will skip that intermediate stop — see Edge cases below)
- `/about/` — two `<Grid cols={2}>` blocks (PERSON/LAB, IS/ISN'T)
- Future card grids on `/notes/`, `/projects/`, `/catalogue/`, `/mailings/` once they migrate

**Asymmetric grids (NOT covered by this fix — need separate primitives):**
- `src/routes/(console)/mailings/+page.svelte` — `60px 1fr`
- `src/routes/(console)/notes/+page.svelte` — `60px 1fr 240px`
- `src/routes/(private)/admin/orders/+page.svelte` — `160px 1fr auto auto`
- `src/routes/(private)/admin/mailings/+page.svelte` — `120px 1fr 120px auto`
- `src/routes/(private)/invoices/[invoicenr]/+page.svelte` — `3fr 1fr 1fr 1fr`

These belong in separate primitives (e.g. `Sidebar`, `Toolbar`, `DataRow`,
`LineItems`) and are out of scope for `<Grid>`. They will be filed as
their own library asks when the consuming pages migrate.

## Proposed fix

The current Grid script sets `grid-template-columns` inline via
`style="grid-template-columns: …"`. CSS rules cannot override an inline
style without `!important`. Move the value into a CSS custom property and
expose `cols` as a `data-cols` attribute so per-col responsive rules can
target it.

Default responsive ladder (matches the site's existing breakpoint convention
— 900px = tablet, 720px = mobile — see `tokens.css` comment):

| `cols=` | desktop | ≤ 900px | ≤ 720px |
|---|---|---|---|
| `1` | 1 | 1 | 1 |
| `2` | 2 | 2 | 1 |
| `3` | 3 | 2 | 1 |
| `4` | 4 | 2 | 1 |
| `"auto"` | `auto-fill minmax(minColWidth, 1fr)` | (same — natural reflow) | (same) |

`node_modules/@dxlbnl/ui/dist/components/layout/Grid.svelte` proposed shape:

```svelte
<svelte:element
  this={as}
  class="grid-layout"
  data-cols={cols}
  style="--grid-cols: {colsTemplate}; --grid-gap: {gapMap[gap]};"
  {...rest}
>
  {@render children?.()}
</svelte:element>

<style>
  .grid-layout {
    display: grid;
    grid-template-columns: var(--grid-cols);
    gap: var(--grid-gap);
  }

  /* 3 / 4 cols collapse to 2 at tablet width */
  @container (max-width: 900px) {
    .grid-layout[data-cols="3"],
    .grid-layout[data-cols="4"] {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* 2 / 3 / 4 cols collapse to 1 at mobile width */
  @container (max-width: 720px) {
    .grid-layout[data-cols="2"],
    .grid-layout[data-cols="3"],
    .grid-layout[data-cols="4"] {
      grid-template-columns: 1fr;
    }
  }
</style>
```

The `data-cols` attribute is also a useful hook for app-level overrides
(e.g. a route can target `.grid-layout[data-cols="3"]` with its own
breakpoint rule if it needs different behaviour — though that should be
rare).

### Edge cases

- `cols="auto"` rules don't fire (data-cols is "auto", not "2|3|4"). The
  existing `repeat(auto-fill, minmax(<minColWidth>, 1fr))` handles narrow
  widths naturally.
- `cols={1}` — no rules apply, stays 1fr (already correct).
- **Footer-style 5-col** is out of scope for `<Grid>` today — `GridCols` is
  `1 | 2 | 3 | 4 | 'auto'`. When Footer migrates, either extend `GridCols`
  to include `5` (and add the 5→2 rule to the ladder) or introduce a
  separate primitive. Not part of this fix.
- Routes that need a non-default collapse (e.g. a 3-col that should NOT
  collapse to 2 at 900px) can use `data-cols` as a CSS hook and add their
  own rule. We expect this to be rare.

## Verification

- http://localhost:5174/about/ at desktop width shows the two
  `<Grid cols={2}>` blocks side-by-side. At ≤720px (DevTools mobile
  emulation) both collapse to single column. Confirm against
  https://www.dexterlabs.nl/about/.
- For a 3 / 4 col case (no consumer in the website yet — verify via a
  Storybook story or temporary route): at desktop width the full count
  shows, at ≤900px it should be 2 columns, at ≤720px single column.
