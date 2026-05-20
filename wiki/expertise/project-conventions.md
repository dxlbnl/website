# Project Conventions

> Sources: Internal, 2026-04-26
> Updated: 2026-04-26

## Overview

Decisions that aren't enforced by any linter but are non-negotiable. Read this before writing new code.

## Always

- **Svelte 5 runes only** - `$state`, `$derived`, `$props()`, `$effect`, `{@render}`. No legacy `$:`, `on:event`, or `<slot>`.
- **`type` over `interface`** in TypeScript
- **`pnpm`** for all package management - no npm or yarn
- **Tabs** for indentation, **single quotes**, print width 100, no trailing commas (Prettier enforces this)
- **`+page.ts`** for loaders (not `+page.server.ts`) - all content is static, prerendered at build time via `import.meta.glob`

## Never

- SSR - no server-side rendering, no server routes, no `+page.server.ts`
- Utility class frameworks (Tailwind etc.) - semantic CSS with CSS variables
- `adapter-static` in `svelte.config.js` - the adapter is `adapter-vercel` (which handles prerender correctly for Vercel deployment)

## Content types

All frontmatter types are defined in `src/lib/types.ts`. Extend there first before touching markdown files.

**mdsvex content imports components.** A `.md` note can have a `<script>` block that imports and renders Svelte components (e.g. `content/notes/007-zod4-mock/index.md` renders a CTA). So when checking whether a component is unused before deleting it, grep **`content/` as well as `src/`** — a `src`-only scan will report false "0 importers". `pnpm check` will NOT catch a missing import in content; only `pnpm build` compiles the notes. (Triggered 2026-05-20: deleted `$lib/ui/Cta.svelte` as "unused" while a note still imported it.)

## Image pipeline

New images for notes: put originals in `/content/notes/<slug>/media/`, run `pnpm optimize` to get WebP output in `/static/images/`. Don't put images directly in `/static/`.

## Working style (for agents)

These are how Dexter wants the work done, not how the code is written. They're as binding as the code rules above.

- **No ad-hoc batch scripting.** Don't reach for `sed -i`, `find -exec`, `while IFS= read -r f; do …`, or other shell loops to apply the same change across N files. Use the Edit tool, one file per call, so every diff is reviewable up front. If the change is mechanical across many files, **ask first** — propose the substitution and the file list, and let Dexter decide whether to approve it as one operation. (Triggered 2026-05-19 mid-`@dxlbnl/ui` migration when I batched a rename via `sed -i`.)
- **Stay within the literal scope of the ask.** "Restore X" means restore X. Don't piggyback related refactors (file moves, namespace cleanups, prop renames) just because they're nearby and you think they're improvements. Land the narrow fix first, then propose the follow-up as its own item. Tangential changes balloon the diff, hide the actual fix, and create extra review surface. (Triggered 2026-05-19 when "Just restore the SEO as it was please" turned into me starting to move `SEO.svelte` across namespaces and rewrite 15 importers.)
