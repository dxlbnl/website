# Project Conventions

> Sources: Internal, 2026-04-26
> Updated: 2026-04-26

## Overview

Decisions that aren't enforced by any linter but are non-negotiable. Read this before writing new code.

## Always

- **Svelte 5 runes only** — `$state`, `$derived`, `$props()`, `$effect`, `{@render}`. No legacy `$:`, `on:event`, or `<slot>`.
- **`type` over `interface`** in TypeScript
- **`pnpm`** for all package management — no npm or yarn
- **Tabs** for indentation, **single quotes**, print width 100, no trailing commas (Prettier enforces this)
- **`+page.ts`** for loaders (not `+page.server.ts`) — all content is static, prerendered at build time via `import.meta.glob`

## Never

- SSR — no server-side rendering, no server routes, no `+page.server.ts`
- Utility class frameworks (Tailwind etc.) — semantic CSS with CSS variables
- `adapter-static` in `svelte.config.js` — the adapter is `adapter-vercel` (which handles prerender correctly for Vercel deployment)

## Content types

All frontmatter types are defined in `src/lib/types.ts`. Extend there first before touching markdown files.

## Image pipeline

New images for notes: put originals in `/content/notes/<slug>/media/`, run `pnpm optimize` to get WebP output in `/static/images/`. Don't put images directly in `/static/`.
