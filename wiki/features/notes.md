# Notes

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

Longer-form posts for things worth writing up properly — build logs, experiments, project documentation. Think blog post, not tweet. Each note lives in its own directory alongside any media it references.

Route: `/notes/` (list), `/notes/[slug]/` (individual post).

## Core user stories

**Write up a project**
I finished wiring a Eurorack module. I want a record of the build with photos, wiring notes, and links to the relevant product. I create a directory under `/content/notes/`, write the `index.md`, add photos alongside it, and it appears on the site sorted by date.

**Link a note to a product**
I wrote about the Distrans AR-1 during development. I set `productId: distrans-ar-1` in the frontmatter and the note links to the product page automatically.

**Browse notes**
A visitor wants to read what I've been building. `/notes/` lists all notes sorted by date (newest first), with the lede as the teaser.

## Structure

Each note is a directory under `/content/notes/`:

```
/content/notes/
  006-syncing-shopping-lists/
    index.md
    screenshot.webp
```

The directory name becomes the slug. The sort index is parsed from the numeric prefix (`006-` → idx 6).

## Frontmatter fields

| Field | Required | Notes |
|-------|----------|-------|
| `pageType` | yes | Always `note` |
| `title` | yes | Displayed as the post heading |
| `date` | yes | ISO date, controls sort order |
| `tags` | yes | Array of strings |
| `lede` | no | Short intro, shown in list view |
| `kind` | no | Optional classifier (e.g. `build-log`, `writeup`) |
| `images` | no | Array of image paths |
| `productId` | no | Links to a product in the catalogue |

## See Also

- [Content Architecture](../concepts/content-architecture.md)
