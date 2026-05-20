---
id: REG-productcard-2026-05-19
title: "Regression — ProductCard needs image, sans description, aligned price, smaller CTA arrow"
type: bug
priority: high
flags: []
created: 2026-05-19
---

## Description

ProductCard is the busiest card in the system — it ships in 3-col grids,
needs an image, a description that reads as body text, a clearly aligned
price/status row, and a CTA whose styling sits well next to the other CTA
buttons on the page.

Reference:
- Production: https://www.dexterlabs.nl/catalogue/
- Library: `node_modules/@dxlbnl/ui/dist/components/cards/ProductCard.svelte`
- Canonical local source: `src/lib/ui/ProductCard.svelte` (website repo)
- First consumer: `src/routes/(console)/catalogue/+page.svelte`

## Findings

### 1. No image prop — same gap as NoteCard/ProjectCard

ProductCard exposes `sku`, `name`, `description`, `price`, `status`,
`ctaLabel` but no way to surface the product image. Production cards
showed a 4/3 (or similar) aspect-ratio image at the top of each card.

**Fix:**

```ts
interface Props {
  sku: string;
  name: string;
  description: string;
  price?: string;
  status?: StockStatus;
  ctaLabel?: string;
  image?: string;          // resolved URL
  imageSrcset?: string;    // responsive srcset for the image
  // existing rest props
}
```

Render the image at the top with `aspect-ratio: 4 / 3` (or whatever ratio
fits the product photography style), `width: 100%`, `object-fit: cover`,
border-bottom: 1px solid var(--rule).

When `image` is unset, render a striped-placeholder empty state similar
to the canonical ProductCard (`bg-sunken` and `bg-elev` diagonal stripes
with `{sku.toUpperCase()} · MODULE` centered in mono micro).

### 2. Description renders in mono — should be sans body

Currently ProductCard renders the `description` prop in mono. Production
used sans body text for the description (16px ish), because the description
is prose, not metadata.

**Fix:** description in `var(--sans)` at `var(--t-body)` (or `var(--t-mono)`
on the smaller side — depends on the card's overall scale, but font-family
must be sans).

The mono treatment is appropriate for the SKU header and the price chip,
not for the prose description.

### 3. Price / status / SKU not aligned

Inside the card body the SKU header, price, and status text don't line up
on a consistent baseline / row. Mixing left-aligned + right-aligned + LED
makes the row read as cluttered.

**Fix:** target the existing `.product-card-header` and `.product-card-meta`
wrappers (or whatever they're called) so the SKU sits left, the price + LED
sit right, and both use the same baseline. Suggest `<Spread align="center">`
or an explicit flex row with `align-items: center` + `justify-content:
space-between`.

### 4. CTA arrow size inconsistent with other Button variants

ProductCard's CTA arrow (e.g. "PREORDER →") renders the arrow larger than
`<Button variant="cta">` does on the same page (e.g. the "GET IN TOUCH →"
button in the catalogue's engineering panel). Two different arrow sizes
in the same viewport reads as inconsistent.

**Fix:** ProductCard's internal CTA element should use the same font-size
+ letter-spacing rules as `Button variant="cta"`. Either render the CTA
text via the Button component internally, or copy the variant="cta" type
treatment exactly.

## Verification

http://localhost:5174/catalogue/ at desktop width should show:
- Product images at the top of each card.
- Description in sans, comfortable to read.
- Header row (SKU left, price + LED right) cleanly aligned to the same
  baseline.
- "PREORDER →" / "BUY →" CTA arrows the same size as the "GET IN TOUCH →"
  arrow in the engineering panel below the grids.

Compare against https://www.dexterlabs.nl/catalogue/.
