---
id: REG-order-cancel-2026-05-19
title: "Regression — /order/cancel/ on dexterlabs.nl"
type: bug
priority: high
flags: []
created: 2026-05-19
---

## Description

The website's `/order/cancel/` page is now built on `<PageHero>`,
`<Container size="lg">`, `<Button variant="back">`, and a local
`Signature` that composes `<Rule />` + `<Grid cols={2}>` + `<Stack>` + `<Text>`.

Side-by-side with the live production page, several library defaults need
adjusting and one capability is missing. Findings below are grouped by the
library component each one diagnoses, so every section maps to a single
library file (or a tightly-related set).

Reference:
- Production: https://www.dexterlabs.nl/order/cancel/
- Local (linked `@dxlbnl/ui`): http://localhost:5174/order/cancel/
- Route source: `src/routes/(console)/order/cancel/+page.svelte` (in the website repo)
- Local Signature wrapper: `src/lib/Signature.svelte` (in the website repo)

## Findings

### `PageHero` — eyebrow needs to accept a snippet

Production renders the eyebrow as a flex row: amber `<Led />` dot + the
mono-uppercase "ORDER CANCELLED" label, both inside a single flex container.

`PageHero` today only exposes `eyebrow?: string`, so on the migrated page the
LED was dropped entirely.

**Fix:** add `eyebrowContent?: Snippet`, mirroring the existing
`headingContent` / `heading` pair. When provided, it takes precedence over
the `eyebrow` string and renders inside the same `.page-hero-eyebrow`
wrapper. The route should be able to write:

```svelte
<PageHero heading="No charge made." lede={body}>
  {#snippet eyebrowContent()}
    <Inline gap="xs">
      <Led color="amber" />
      <Text variant="eyebrow" color="amber">ORDER CANCELLED</Text>
    </Inline>
  {/snippet}
  <Button as="a" href="…" variant="back">RETURN TO CATALOGUE</Button>
</PageHero>
```

### `PageHero` — heading scale is too large by default

`PageHero` hard-codes `<Heading level={1} variant="hero">`. The `hero`
variant is `clamp(48px, 8vw, 112px)` — at 1280px viewport that's ~102px.

Production's hand-rolled heading at the same surface uses `--t-title`
(`clamp(36px, 5vw, 56px)`, capping at 56px). The `hero` scale is fine for
the marketing-style homepage; for content/status pages (`/order/cancel/`,
`/about/`, `/contact/`, `/legal/`, every product detail page) it is
overwhelming.

**Fix:**

1. Add a `title` variant to `Heading` that maps to `--t-title`
   (`clamp(36px, 5vw, 56px)`, font-weight 500, letter-spacing -0.02em,
   line-height 1).
2. Change `PageHero`'s internal Heading from `variant="hero"` to
   `variant="title"`. The homepage (or any marketing surface that wants the
   bigger scale) can use `headingContent` to render its own
   `<Heading variant="hero">`.

### `PageHero` — vertical rhythm

The component currently emits:

```css
.page-hero            { padding: 48px 0 40px; }
.page-hero-eyebrow    { margin-bottom: 12px; }
.page-hero-lede       { margin-top: 20px; max-width: 62ch; }
.page-hero-actions    { margin-top: 24px; }
```

Production rhythm (post-nav → heading 80px, heading → lede 16px,
lede → action 32px). Adjustments:

- **Top padding 48px → 80px.** Production gives the hero a clear breath
  from the nav.
- **Heading → lede 20px → 16px.** Production has the lede sitting closer
  to the heading than the library currently does.
- **Lede → actions 24px → 32px.** Push the back-link further down so it
  reads as a deliberate next step.

`max-width: 62ch` on the lede stays as library canon (production was 48ch
on the whole content box, which was hand-rolled).

### `Heading` — `hero` letter-spacing too tight

`Heading variant="hero"` currently emits `letter-spacing: -0.03em`. At
72–112px that's noticeably tighter than production's headlines (which use
-0.02em at the same scales).

**Fix:** `hero` and the new `title` variant both use `letter-spacing: -0.02em`.
`display` (140px) can keep -0.03em — at that size, the tighter tracking is
correct.

### `Text` variant="eyebrow" — font-size

Library eyebrow is `--t-micro` (12px). Production's analogous label is
`--t-mono` (14px). Letter-spacing on both is 0.12em.

At 12px the eyebrow reads as fine print above a 56px heading; it stops
functioning as a section/page label.

**Fix:** bump `Text variant="eyebrow"` to `--t-mono` (14px). Keep
letter-spacing at 0.12em — the absolute pixel value moves from 1.44 to 1.68
which matches production exactly.

### `Text` variant="lede" — letter-spacing and line-height

Production's "hand" text on the signature block:

- `line-height: 1.5` (28.5px at 19px font-size)
- `letter-spacing: -0.01em` (-0.19px)

Library `Text variant="lede"`:

- `line-height: 1.55` (29.45px)
- `letter-spacing: normal`

**Fix:** `Text variant="lede"` → `line-height: 1.5`, `letter-spacing: -0.01em`.
The negative tracking follows the same -0.01em..-0.02em rule used on the
heading variants: larger type → slightly tighter.

### `Button` variant="back" — should be `display: inline-block`

Production back link is an `<a>` element rendering at `display: inline`, so
it hugs its content ("RETURN TO CATALOGUE") and sits naturally below the
lede.

Library `Button variant="back"` currently renders at `display: block`,
which stretches the link to the full container width and makes it read as
a bar/button rather than a discreet text link.

**Fix:** `Button variant="back"` should render at `display: inline-block`
(or `inline-flex` if the variant needs to align an icon). Forward / primary
/ cta variants can stay block-level if that's their intent — only `back`
(and arguably `ghost`) should hug their content.

### `Rule` — border colour reads as text colour, not `--rule`

On the migrated page the `<Rule />` between the page content and the
signoff renders with `border-top-color: rgb(20, 17, 11)` in paper palette
(== `--ink`), while production uses `rgb(207, 202, 188)` (== `--rule`).

`Rule` is inheriting text colour from its container instead of using the
rule token.

**Fix:** in `Rule.svelte`, set `border-top-color: var(--rule)` explicitly
(and `var(--rule-strong)` for `variant="strong"`).

### Library gap — add a `Signoff` (or `Signature`) pattern

The website currently keeps a local `src/lib/Signature.svelte` that composes
the sign-off block by hand:

```svelte
<Rule />
<Grid cols={2} gap="md">
  <Stack gap="xs">
    <Text variant="eyebrow">// SIGNED</Text>
    <Text variant="lede" color="ink">— Dexter, in the lab</Text>
  </Stack>
  <Stack gap="xs">
    <Text variant="eyebrow">// SHIPPED BY</Text>
    <Text variant="lede" color="ink">
      DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
    </Text>
  </Stack>
</Grid>
```

The same shape (top rule, 2-equal-column grid that collapses to 1 column on
mobile, mono-uppercase labels above sans-strong body lines) repeats on
~10 pages of the website. The brand strings rightly stay in the website,
but the **shape** is a visual pattern that belongs in the library.

Production also adds spacing the local wrapper doesn't:

- `padding: 24px 0` on the grid container
- `margin-top: 56px` separating the signoff from the page body
- `gap: 32px` between columns (Grid default `gap="md"` resolves to 16px)

**Fix:** add `Signoff` (or `Signature`) to the patterns barrel. Suggested
API — snippet-based so brand strings stay in the consuming app:

```svelte
<Signoff>
  {#snippet left()}
    <Text variant="eyebrow">// SIGNED</Text>
    <Text variant="lede" color="ink">— Dexter, in the lab</Text>
  {/snippet}
  {#snippet right()}
    <Text variant="eyebrow">// SHIPPED BY</Text>
    <Text variant="lede" color="ink">
      DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
    </Text>
  {/snippet}
</Signoff>
```

Internally renders the top rule + 2-col grid (gap 32px, collapses to 1 col
≤720px) + `padding: 24px 0` + `margin-top: 56px`.

## Suggested order of fixes

1. **`PageHero.eyebrowContent` snippet prop** — unblocks restoring the LED.
2. **`Heading` adds `title` variant; `PageHero` default switches to it** —
   fixes the dominant visual scale problem across all content pages.
3. **`Rule` border-color = `--rule`** — small bug, big visual win (lots of
   surfaces use Rule).
4. **`Button` `back` variant `display: inline-block`** — fixes back links
   everywhere.
5. **Add `Signoff` pattern** — collapses ~10 pages' worth of hand-rolled
   composition and gets spacing right by default.
6. **`Text` `eyebrow` 12px → 14px** — secondary, easy.
7. **`Text` `lede` letter-spacing -0.01em + line-height 1.5** — secondary,
   tuning.
8. **`PageHero` vertical rhythm tweaks** (top padding, heading→lede gap,
   lede→actions gap) — secondary, comfort.

## Verification

After each fix in dxlb-ui, the local `dist/` rebuild flows through to the
website's `node_modules/@dxlbnl/ui` symlink. Reload
http://localhost:5174/order/cancel/ and compare to
https://www.dexterlabs.nl/order/cancel/ side-by-side.

Once 1–5 are in, the website route file should switch to using
`eyebrowContent` (LED returns), and `src/lib/Signature.svelte` should be
replaced by `<Signoff>{...}</Signoff>` — the website keeps the brand-string
composition; only the wrapper changes.

After 6–8, the smaller-scale text properties (eyebrow size, lede tracking,
hero padding) match production.