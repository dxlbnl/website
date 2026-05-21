---
id: B29
title: Add SEO component to /cv/ and include it in sitemap
type: feature
priority: high
created: 2026-05-21
---

## Description

`src/routes/cv/+page.svelte` has no SEO component — no title tag, no meta description, no OG tags, no structured data, no canonical link. It's the only public route completely missing SEO metadata.

Add the SEO component with appropriate title, description, and `type="website"`. Also add `/cv/` to the static pages array in `src/routes/sitemap.xml/+server.ts` so it gets indexed.

## Notes

- SEO component: `src/lib/ui/SEO.svelte`
- Sitemap static pages array: `src/routes/sitemap.xml/+server.ts:41`
- Suggested: `<SEO title="CV" description="Engineering background and work history — Dexter, Dexterlabs." />`
