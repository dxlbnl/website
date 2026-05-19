---
id: REG-responsive-mobile-2026-05-19
title: "Regression — PageHero and Container have no mobile-responsive vertical padding"
type: bug
priority: medium
flags: []
created: 2026-05-19
---

## Description

Affects every page that uses `<PageHero>` or `<Container>`. The horizontal
side padding on Container is already responsive (32px → 16px at ≤720px),
but vertical padding on both components is fixed at all viewport sizes.

On a mobile viewport that's tight: 80px of top padding on PageHero plus
80px of bottom padding on `Container size="lg"` eats ~160px of vertical
real estate before any content shows.

Production for the equivalent surfaces uses lighter vertical padding on
mobile (e.g. `/legal/` dropped its bottom wrap padding from 80px to 56px
at ≤720px; the heading had no top padding because the nav abutted it).

## Findings

### `PageHero` — `.page-hero` has fixed vertical padding

`node_modules/@dxlbnl/ui/dist/components/patterns/PageHero.svelte` emits:

```css
.page-hero {
  padding: var(--u10) 0 var(--u5);  /* 80px 0 40px */
}
```

No `@media` block. On mobile the hero loses 80px above and 40px below at
every viewport size.

**Fix:** add a `≤720px` rule that reduces vertical padding by roughly 40%
to mirror the side-padding cut Container makes at the same breakpoint:

```css
.page-hero {
  padding: var(--u10) 0 var(--u5);  /* 80px 0 40px */
}

@media (max-width: 720px) {
  .page-hero {
    padding: var(--u6) 0 var(--u4);  /* 48px 0 32px */
  }
}
```

### `Container` — per-size `padding-bottom` is not responsive

`node_modules/@dxlbnl/ui/dist/components/layout/Container.svelte` emits:

```css
.container-wrap[data-size="lg"] { max-width: 1440px; padding-bottom: 80px; }
.container-wrap[data-size="md"] { max-width: 960px;  padding-bottom: 64px; }
.container-wrap[data-size="sm"] { max-width: 640px;  padding-bottom: 48px; }

@media (max-width: 720px) {
  .container-wrap { padding-left: 16px; padding-right: 16px; }
  /* no per-size padding-bottom override */
}
```

Production at `/legal/` dropped bottom padding from 80px to 56px on mobile.

**Fix:** scale `padding-bottom` down at the same breakpoint Container
already uses for sides:

```css
@media (max-width: 720px) {
  .container-wrap[data-size="lg"] { padding-bottom: 56px; }
  .container-wrap[data-size="md"] { padding-bottom: 48px; }
  .container-wrap[data-size="sm"] { padding-bottom: 40px; }
}
```

## Verification

Open any page that uses `<Container size="lg"><PageHero>…</PageHero></Container>`
(e.g. http://localhost:5174/legal/, http://localhost:5174/order/cancel/) at a
mobile viewport (DevTools device emulation, 375px or 414px wide). After the
fix, the hero's top padding should feel roughly proportional to the side
padding — the page shouldn't feel "pushed away" from the top of the screen.
