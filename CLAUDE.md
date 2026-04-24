# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Optimize images then build (runs pnpm optimize first)
pnpm preview      # Preview production build
pnpm check        # TypeScript type checking via svelte-check
pnpm lint         # Prettier check + ESLint
pnpm format       # Format all files with Prettier
pnpm test         # Run unit tests once (CI mode)
pnpm test:unit    # Run unit tests in watch mode
pnpm optimize     # Convert /content/repository/*/media images to WebP in /static
```

## Stack

- **SvelteKit 2 + Svelte 5** (uses runes: `$props()`, `{@render}`)
- **mdsvex** — Markdown files are processed as Svelte components; `.md` and `.svx` extensions are both valid
- **Adapter**: `adapter-vercel` with prerender/static output
- **TypeScript** strict mode, `bundler` module resolution

## Architecture

### Content System

All dynamic content lives in `/content/` as Markdown files with YAML frontmatter. TypeScript interfaces for all frontmatter types are in [src/lib/types.ts](src/lib/types.ts): `ConsoleFrontmatter`, `ProductFrontmatter`, `RepositoryFrontmatter`, `InvoiceFrontmatter`.

Content is loaded at build time via `import.meta.glob(..., { eager: true })` — this is how SvelteKit generates static pages from markdown.

### Routing

File-based routes under `src/routes/`:

- `/(console)/` — main public section (catalogue, repository)
- `/(console)/catalogue/[id]` — individual product pages, data from `/content/products/`
- `/(console)/repository/[slug]` — project showcase pages, data from `/content/repository/*/index.md`
- `/(private)/invoices/[invoicenr]` — invoice view/export, data from `/content/invoices/`

Each dynamic route has a `+page.ts` loader that reads the matching markdown file and returns typed frontmatter.

### Image Pipeline

Repository project images originate in `/content/repository/*/media/`. The `pnpm optimize` script (run automatically as part of `pnpm build`) converts them to WebP and outputs to `/static/images/repository/`. The `src/lib/utils/` helpers resolve the correct static path at runtime.

### Invoice System

Multi-page PDF generation lives in `src/lib/invoice/`. Key detail: pagination uses binary search to fit content per page. Supports Dutch VAT (BTW) formatting and QR code payment links.

## Code Style

Prettier config (enforced by lint): **tabs**, **single quotes**, print width 100, no trailing commas. ESLint uses flat config (`eslint.config.js`) with svelte + typescript-eslint plugins.
