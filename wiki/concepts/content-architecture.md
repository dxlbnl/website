# Content Architecture

> Sources: Internal, 2026-04-26
> Updated: 2026-04-26

## Overview

Four public sections. Each has a distinct editorial purpose — the routing is obvious from the filesystem, but what belongs where is not.

## Feed (`/feed`, `/content/feed/*.md`)

Short, datestamped micro-posts. No title. `body` is in frontmatter, not the markdown body. Think: a thought, a status update, a one-liner about something that happened. Low friction to publish.

Use for: quick observations, progress notes, things that don't warrant a full writeup.

## Notes (`/notes`, `/content/notes/*/index.md`)

Longer-form entries with a title, optional `lede`, optional `kind`, optional images. One subdirectory per note — the subdirectory holds the `index.md` and any associated media. Closer to a blog post or project writeup.

Use for: project documentation, experiments worth explaining, build logs, anything with a narrative arc.

`kind` is an optional classifier (not yet enforced by types) — can distinguish e.g. `build-log` from `writeup` if the distinction becomes useful.

## Catalogue (`/catalogue`, `/content/products/*.md`)

Product listings. Has a defined schema: name, status, category, tags, price, specs, Tindie URL. Status is `available | sold-out | coming-soon`.

Use for: things you're actually selling. Eurorack modules, cables, etc. Hardware lives in `distrans` but products surface here.

## Console (`/`, index page)

The landing page. Not a content section — it's the entry point. Tagline and SEO description live there.

## What doesn't have a section yet

- Generative art / P5.js work — currently goes into Notes
- 3D print models / designs — currently goes into Notes
- HomeAssistant / maker projects — currently goes into Notes

If any of these grow enough volume, a dedicated section would make sense.
