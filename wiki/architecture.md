# Architecture

## Tech stack

- **Language**: TypeScript 6.x (strict mode, `bundler` module resolution)
- **Runtime / platform**: Node 20 LTS; deployed to Vercel Edge / Serverless
- **Framework**: SvelteKit 2 + Svelte 5 (runes API)
- **Templating**: mdsvex — Markdown files processed as Svelte components (`.md` and `.svx`)
- **Database**: Neon PostgreSQL (serverless), accessed via Drizzle ORM
- **Payments**: Stripe (Checkout Sessions, Webhooks)
- **Email**: Resend (transactional + broadcasts)
- **Hosting**: Vercel (`adapter-vercel`)

## Package manager (binding)

> Agents must use **only** this package manager. Do not substitute another even if
> tutorials, generated configs, or model priors suggest one.

- **Package manager**: pnpm (use only this — not npm, not yarn)

## Test setup

- **Test runner**: Vitest
- **Test command**: `pnpm test` (runs once, CI mode)
- **Watch mode**: `pnpm test:unit`
- **Test file location**: co-located `*.test.ts` next to source (e.g. `src/lib/content/tags.test.ts`, `src/routes/(console)/share/share.test.ts`)
- **Integration tests**: `*.integration.test.ts` (e.g. `share.integration.test.ts`)

## Project structure

```
content/              # All site content as Markdown (never put content in src/)
  notes/*/index.md    # Long-form notes (one dir per note, holds media too)
  products/*.md       # Product listings
  projects/*.md       # Project showcase
  mailings/*.md       # Newsletter archive
  invoices/*.md       # Private invoice files
  legal/*.md          # Legal pages

src/
  app.css             # Global CSS variables, typography, design tokens
  app.html            # HTML shell
  hooks.server.ts     # SvelteKit server hooks (CSP, etc.)
  lib/
    types.ts          # All frontmatter TypeScript types
    content/
      tags.ts         # Controlled tag vocabulary + NOTE_KINDS
      tags.test.ts    # Enforces tags are from vocabulary
    server/
      db/
        index.ts      # Drizzle client (Neon)
        schema.ts     # All DB tables
    email/            # Svelte email components + render helper
    invoice/          # PDF generation (calculations, binary-search pagination)
    ui/               # Shared UI components
    utils/            # image.ts, location.ts, fmt.ts, auth.ts, product.svelte.ts
  routes/
    (console)/        # Public section — Nav + Footer layout
      +page.svelte    # Homepage (products + projects + notes preview)
      notes/          # Notes list + individual note
      catalogue/      # Product list + product detail + checkout
      projects/       # Projects list + individual project
      mailings/       # Mailing archive + individual issue
      share/          # WebRTC P2P share tool
      about/          # About page
      contact/        # Contact page
      legal/[slug]/   # Legal pages
      order/          # Order success / cancel pages
    (private)/        # Admin + invoices — password-protected
      admin/          # Orders, mailings admin
      invoices/       # Invoice list + PDF renderer
    api/              # Server-only API routes
      checkout/       # POST: create Stripe Checkout session
      stripe-webhook/ # POST: handle Stripe events (write order, send email)
      resend-webhook/ # POST: handle Resend open events
      subscribe/      # POST: add email to Resend contact/segment
      og/             # GET: generate OG image (satori)
      share/          # GET/POST: WebRTC signaling (create/poll/answer session)
    cv/               # CV page
    sitemap.xml/      # Sitemap generator
    +error.svelte     # Error page

static/               # Served as-is; images go here via pnpm optimize
  images/             # WebP images (generated — do not edit manually)
scripts/              # Build-time scripts (optimize-notes-images.js)
wiki/                 # Project spec (see wiki/INDEX.md)
```

## Key technical decisions

Full rationale in `wiki/decisions.md`. Summary:

- **SvelteKit + Svelte 5**: runes API throughout; no legacy reactivity.
- **Static prerender**: all public content routes prerender at build time. Server code only in API routes and `/(private)/`.
- **adapter-vercel** (not adapter-static): handles prerender correctly for Vercel and enables serverless API routes.
- **No Tailwind**: semantic CSS with CSS variables — design language is Lab Bench / phosphor display aesthetic.
- **Drizzle + Neon**: lightweight ORM; schema-as-code. `drizzle-kit push` syncs schema.
- **Binary-search pagination** in invoice PDF: measures DOM height to fit content per page — necessary because invoice line items vary wildly in height.
- **Feed dropped**: the feed feature (short statusupdates) was removed. The DB table was never created; no feed routes exist.
