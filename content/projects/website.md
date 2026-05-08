---
pageType: project
slug: website
title: dexterlabs.nl
description: This site. A SvelteKit static site with mdsvex content, Vercel image optimization, and a custom invoice PDF generator.
tags: [SvelteKit, TypeScript, mdsvex]
image: media/website-dark.png
imageLight: media/website-light.png
url: https://dexterlabs.nl
date: 2024-01-01
archived: true
stack:
  Framework: SvelteKit + mdsvex
  Database: Neon (Postgres)
  ORM: Drizzle
  Images: Sharp + Vercel CDN
  Deployment: Vercel
  Language: TypeScript
---

**SvelteKit** with **adapter-vercel** for static output and edge functions where needed. Content is Markdown processed by **mdsvex** — pages are Svelte components, frontmatter drives typed data. Images run through a **Sharp** optimization pipeline at build time and served via Vercel's image CDN. **Drizzle ORM** over a **Neon** Postgres database handles feed posts and page analytics. The invoice system generates multi-page PDFs in the browser using binary search for pagination.
