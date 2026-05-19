---
id: REG-projectcard-2026-05-19
title: "Regression — ProjectCard needs image props + empty-state placeholder"
type: bug
priority: medium
flags: []
created: 2026-05-19
---

## Description

`<ProjectCard>` exposes `slug`, `title`, `description`, `tags`, `ctaLabel`
— but no way to surface the project image. Production card had a 14/9
aspect-ratio image at the top of the card, with a dual-image palette swap
(separate `imageDark`/`imageLight` so the dark and paper palettes render
appropriate art) and a striped empty-state when no image is set.

Without these, the migrated `/projects/` grid is text-only cards. The
visual signature of the projects index is the image-led cards.

Reference:
- Production: https://www.dexterlabs.nl/projects/
- Library: `node_modules/@dxlbnl/ui/dist/components/cards/ProjectCard.svelte`
- Canonical local source: `src/lib/ui/ProjectCard.svelte` (website repo)
- First consumer: `src/routes/(console)/projects/+page.svelte`

The website's image pipeline resolves URLs via
`resolveProjectImage(image)` + `vercelSrcset(url, [256, 384, 512, 768, 960])`
so the route owns URL resolution. ProjectCard just needs to accept the
strings and render with consistent styling.

## Proposed fix

Add four props:

```ts
interface Props {
  as?: string;
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  ctaLabel?: string;
  image?: string;          // dark-palette src URL
  imageLight?: string;     // paper-palette src URL (optional)
  imageSrcset?: string;    // responsive srcset for `image`
  imageLightSrcset?: string;
  // existing rest props
}
```

Behaviour:

- When `image` is set, render an `<img>` at the top of the card with
  `aspect-ratio: 14/9`, `object-fit: cover`, `width: 100%`.
- When `imageLight` is also set, paint two `<img>` elements (dark and
  light) and toggle via `:global([data-palette='paper'])` rules — only
  the matching one is visible.
- When neither is set, render the existing empty-state placeholder: a
  diagonal-stripe background (`bg-sunken` and `bg-elev`) with the slug
  centered in mono micro uppercase ("SLUG · PROJECT").

CSS (modelled on the canonical local component):

```css
.project-card-image {
  aspect-ratio: 14 / 9;
  background: repeating-linear-gradient(
    135deg,
    var(--bg-sunken) 0 10px,
    var(--bg-elev) 10px 20px
  );
  border-bottom: 1px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: var(--t-micro);
  color: var(--ink-faint);
  letter-spacing: 0.12em;
  overflow: hidden;
}

.project-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card-image .light-img { display: none; }
:global([data-palette='paper']) .project-card-image .light-img { display: block; }
:global([data-palette='paper']) .project-card-image .dark-img { display: none; }
```

The empty-state text content can come from the `slug` prop:
`{slug.toUpperCase()} · PROJECT`. The route doesn't need to compute it.

## Out of scope

- Sizing hints (`sizes` attribute). The canonical local component
  passed responsive `sizes` per breakpoint. For a first pass, leave that
  to the consumer if needed (rest props go through).

## Verification

http://localhost:5174/projects/ should show 14/9 images on each project
card at desktop width. Palette toggle should swap between `image` and
`imageLight` correctly. Projects without an image should render the
diagonal-striped placeholder. Compare against
https://www.dexterlabs.nl/projects/.
