---
id: REG-prose-maxwidth-2026-05-19
title: "Regression — Prose should not constrain width by default"
type: bug
priority: medium
flags: []
created: 2026-05-19
---

## Description

`<Prose>` currently defaults `maxWidth = '72ch'`, which sets an inline
`style="max-width: 72ch"` on the rendered element. This creates a double
constraint when Prose sits inside a Container that's already picking the
page width:

- `Container size="sm"` (640px) → inner 576px ≈ 72ch — the two caps
  coincide, no visible effect, but two-source-of-truth.
- `Container size="md"` (960px) → inner 896px ≈ 112ch — Prose silently
  caps the reading column at 72ch, so the body text appears narrower than
  the PageHero / Signature / Rule above and below it. Visual edges
  mismatch up and down the page.

The current workaround in the website is to pass `<Prose maxWidth="none">`
on every slug page, which is noise.

Reference:
- Library: `node_modules/@dxlbnl/ui/dist/components/layout/Prose.svelte`
- Consumers (current workaround):
  - `src/routes/(console)/legal/[slug]/+page.svelte`
  - `src/routes/(console)/notes/[slug]/+page.svelte`

## Proposed fix

Drop the default. Prose becomes a pure typography shell; the parent
(Container, a future Column primitive, or any other ancestor) owns the
width.

```ts
interface ProseProps extends HTMLAttributes<HTMLElement> {
  as?: string;
  /** Max-width constraint applied to the prose container. Omit to inherit from the parent. */
  maxWidth?: string;
  children?: Snippet;
}

let { as = 'article', maxWidth, children, class: klass = '', ...rest }: ProseProps = $props()
```

Render:

```svelte
<svelte:element
  this={as}
  class={['prose', klass]}
  style:max-width={maxWidth}
  {...rest}
>
  {@render children?.()}
</svelte:element>
```

When `maxWidth` is undefined, Svelte's `style:` directive doesn't emit
the property, so the element inherits its width from its container —
which is what we want.

Consumers that DO want a 72ch reading column inside a wide container can
still opt in: `<Prose maxWidth="72ch">`. Or, better long-term: use a
`<Column maxWidth="72ch">` layout primitive (separate ask) that wraps
the Prose plus any non-prose siblings (PageHero, Rule, Signature) so
the whole article block aligns to one column inside a wider page bound.

## Verification

After the fix:

- http://localhost:5174/legal/privacy/ — Container `size="sm"`, Prose
  inherits 576px width. No visible change from today.
- Drop the `maxWidth="none"` overrides from
  `src/routes/(console)/legal/[slug]/+page.svelte` and
  `src/routes/(console)/notes/[slug]/+page.svelte` — pages should still
  render identically.
- A consumer that explicitly wants 72ch inside a wider container can
  pass `maxWidth="72ch"` and get the old behaviour back.
