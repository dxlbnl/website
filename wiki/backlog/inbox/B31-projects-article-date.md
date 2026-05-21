---
id: B31
title: Pass articleDate to SEO component on project pages
type: feature
priority: medium
created: 2026-05-21
---

## Description

`src/routes/(console)/projects/[slug]/+page.svelte` passes `type="article"` to the SEO component but never passes `articleDate`. This means the `<meta property="article:published_time">` tag and the `datePublished` field in the Article JSON-LD are both absent — Google doesn't know when the project was published, which affects freshness signals.

`ProjectFrontmatter` already has an optional `date` field. Pass it as `articleDate` to the SEO component.

## Notes

- `src/routes/(console)/projects/[slug]/+page.svelte` — add `articleDate={metadata.date}` to the SEO component call
- `src/lib/types.ts:55` — `date?: string` exists on `ProjectFrontmatter`
- Spot-check that project content files have `date` populated in frontmatter
