---
id: REG-notecard-2026-05-19
title: "Regression — NoteCard needs an image prop with side / top placement"
type: bug
priority: medium
flags: []
created: 2026-05-19
---

## Description

`<NoteCard>` exposes `idx`, `kind`, `title`, `lede`, `date`, and renders
the card as an anchor — but no way to surface a thumbnail image. The
website's `/notes/` index renders each row with a 240px thumbnail to the
**side** (right column of a horizontal row layout). Other contexts (a 3-col
card grid for, say, `/projects/`) might want the image **on top** instead.

Reference:
- Production: https://www.dexterlabs.nl/notes/
- Library: `node_modules/@dxlbnl/ui/dist/components/cards/NoteCard.svelte`
- First consumer: `src/routes/(console)/notes/+page.svelte`

The image source comes from the website's image pipeline
(`resolveLogImage(entry.images[0], entry.slug)` + `vercelSrcset(...)`),
so the route owns the URL resolution. NoteCard just needs to accept a
URL and render it in the right position.

## Proposed fix

Add two props:

```ts
interface Props {
  idx: number;
  kind?: string;
  title: string;
  lede?: string;
  date?: string;
  image?: string;                       // src URL (already-resolved)
  imageSrcset?: string;                 // optional responsive srcset
  imagePlacement?: 'side' | 'top';      // default 'side'
  // existing rest props
}
```

- `imagePlacement="side"` (default): horizontal row layout with the image
  on the right at ~240px. Matches the `/notes/` index style.
- `imagePlacement="top"`: image stacked above the text content, image
  takes the card's full width. Fits 3-col card grids and other tile
  layouts.

### Side layout (default)

Card body uses an asymmetric grid:

```css
.note-card[data-image-placement="side"] {
  display: grid;
  grid-template-columns: 60px 1fr 240px;
  gap: 32px;
  align-items: end;
}

/* Mobile: drop the image, collapse to idx + text */
@container (max-width: 720px) {
  .note-card[data-image-placement="side"] {
    grid-template-columns: 40px 1fr;
  }
  .note-card[data-image-placement="side"] .note-card-image {
    display: none;
  }
}
```

Note the 60px idx column matches the indexed-list mono-hex treatment
NoteCard already uses; mobile drops to 40px to give the title more room.

### Top layout

Card body uses vertical stacking with the image on top:

```css
.note-card[data-image-placement="top"] {
  display: flex;
  flex-direction: column;
}

.note-card[data-image-placement="top"] .note-card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 16px;
}
```

### Image element styling (shared)

```css
.note-card-image {
  overflow: hidden;
  border: 1px solid var(--rule);
}

.note-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
```

For `imagePlacement="side"` the wrapper sets its own aspect ratio via the
grid column width + `align-items: end`. For `imagePlacement="top"` the
`16/9` aspect-ratio rule keeps the image proportional regardless of card
width.

### When no image

When `image` is unset (or empty), the slot collapses cleanly:
- `side`: grid template falls back to `60px 1fr` (no third column).
- `top`: no image element renders; card becomes text-only.

A `Placeholder` library primitive (mono "IMG" label) is a separate ask if
empty-state visual treatment is desired.

## Verification

- http://localhost:5174/notes/ at desktop width shows 240px thumbnails on
  the right of each row; mobile (≤720px) drops the images and keeps the
  rows. Compare against https://www.dexterlabs.nl/notes/.
- A 3-col grid of NoteCards with `imagePlacement="top"` (e.g. a future
  `/projects/` or homepage card grid) should show full-width images
  above the title + lede block.
