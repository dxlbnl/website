# Codebase Reference

> Lightweight agent reference. Goal: orient yourself without running grep. Read this
> before touching source files. Updated: 2026-05-18.

---

## Routes

All routes live under `src/routes/`. SvelteKit layout groups:
- `(console)/` — public site, wrapped in `Nav` + `Footer`
- `(private)/` — admin and invoices, password-protected via `src/lib/utils/auth.ts`
- No group — API endpoints, CV, sitemap, error page

### Public routes (`/(console)/`)

| Route | File(s) | What it does | Prerendered? |
|-------|---------|--------------|-------------|
| `/` | `+page.svelte`, `+page.server.ts` | Homepage: hero + product grid + project grid + notes grid (6 each) | No (server load) |
| `/notes/` | `+page.svelte`, `+page.ts` | All notes sorted newest-first, with tag filtering | Yes |
| `/notes/[slug]/` | `+page.svelte`, `+page.ts` | Individual note rendered from mdsvex | Yes |
| `/notes/rss.xml` | `+server.ts` | RSS feed for notes | Yes |
| `/catalogue/` | `+page.svelte`, `+page.ts` | Product grid (available first, then coming-soon, then sold-out) | Yes |
| `/catalogue/[id]/` | `+page.svelte`, `+page.ts`, `Pricebox.svelte` | Product detail + Stripe Checkout button | Yes |
| `/projects/` | `+page.svelte`, `+page.ts` | Project showcase list | Yes |
| `/projects/[slug]/` | `+page.svelte`, `+page.ts` | Individual project | Yes |
| `/mailings/` | `+page.svelte`, `+page.server.ts` | Mailing archive — filter by `mailingBroadcasts` (DB, not frontmatter); `prerender = true` | Yes (DB read at build) |
| `/mailings/[slug]/` | `+page.svelte`, `+page.server.ts` | Server load: DB check + `entries()` + renders the email via `MailingTemplate.svelte` and returns the HTML string; page renders an iframe srcdoc with that HTML so the archive matches the email exactly. 404 unless slug has a `mailingBroadcasts` row; `prerender = true` | Yes (DB read + email render at build) |
| `/share/` | `+page.svelte`, `+page.ts` + many `.svelte` | WebRTC P2P transfer tool | Yes |
| `/about/` | `+page.svelte` | About page | Yes |
| `/contact/` | `+page.svelte` | Contact page | Yes |
| `/legal/` | `+page.svelte` | Legal index | Yes |
| `/legal/[slug]/` | `+page.svelte`, `+page.ts` | Individual legal document | Yes |
| `/order/success/` | `+page.svelte`, `+page.server.ts` | Post-checkout success page | No |
| `/order/cancel/` | `+page.svelte` | Post-checkout cancel page | Yes |

### Private routes (`/(private)/`)

| Route | File(s) | What it does |
|-------|---------|--------------|
| `/admin/` | `+page.svelte`, `+page.server.ts` | Admin dashboard | 
| `/admin/orders/` | `+page.svelte`, `+page.server.ts` | Order list with fulfillment status |
| `/admin/mailings/` | `+page.svelte`, `+page.server.ts` | Mailing list; shows broadcast + open counts |
| `/admin/mailings/[slug]/` | `+page.svelte`, `+page.server.ts` | Mailing detail + Send button |
| `/invoices/` | `+page.svelte`, `+page.ts` | Invoice list |
| `/invoices/[invoicenr]/` | `+page.svelte`, `+page.ts` | Invoice PDF renderer (dev-only; redirects 404 in prod) |

### CV

| Route | File(s) | What it does |
|-------|---------|--------------|
| `/cv/` | `+page.svelte`, `+page.ts` | CV page with print/export; data from `src/lib/ui/CV.svelte` |

### API routes (`/api/`)

| Endpoint | Method | What it does |
|----------|--------|--------------|
| `/api/checkout` | POST | Creates Stripe Checkout session; detects country from Vercel header; applies shipping zone |
| `/api/stripe-webhook` | POST | Handles `checkout.session.completed`; writes `orders` row; sends confirmation email via Resend |
| `/api/resend-webhook` | POST | Handles Resend email open events; writes `emailOpens` row |
| `/api/subscribe` | POST | Adds email to Resend contacts (+ segment if `RESEND_SEGMENT_ID` set) |
| `/api/og` | GET | Generates OG image via satori + resvg |
| `/api/share` | POST | Creates a WebRTC signaling session in `shareSessions` |
| `/api/share/[id]` | GET | Polls a signaling session for answer/approval |
| `/api/share/pending` | GET | Lists pending connection requests for a device |

### Other

| Route | Purpose |
|-------|---------|
| `/sitemap.xml` | Sitemap generator (excludes mailings, invoices, admin) |
| `+error.svelte` | Global error page |
| `+layout.svelte` | Root layout (theme provider, analytics) |
| `+layout.ts` | Root loader (nothing currently) |

---

## Content system

All content is Markdown with YAML frontmatter. Loaded at build time via `import.meta.glob(..., { eager: true })`. **Never use `import.meta.glob` in server-only files** — use it in `+page.ts` loaders (not `+page.server.ts`).

| Content dir | Type | TS interface | Route |
|-------------|------|-------------|-------|
| `/content/notes/*/index.md` | Notes (one dir per note, holds media) | `NoteFrontmatter` | `/notes/[slug]/` |
| `/content/products/*.md` | Products | `ProductFrontmatter` | `/catalogue/[id]/` |
| `/content/projects/*.md` | Projects | `ProjectFrontmatter` | `/projects/[slug]/` |
| `/content/mailings/*.md` | Mailings | `MailingFrontmatter` | `/mailings/[slug]/` |
| `/content/invoices/*.md` | Invoices | `InvoiceFrontmatter` | `/invoices/[invoicenr]/` |
| `/content/legal/*.md` | Legal docs | `LegalFrontmatter` | `/legal/[slug]/` |

All interfaces defined in **[src/lib/types.ts](../src/lib/types.ts)**. Extend there first.

Note slug comes from the directory name (`/content/notes/006-syncing.../` → slug `006-syncing...`). Numeric prefix parsed as `idx` for sorting.

---

## Database

**Drizzle ORM + Neon PostgreSQL.** Schema: `src/lib/server/db/schema.ts`. Client: `src/lib/server/db/index.ts`.

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `orders` | Stripe orders | `stripeSessionId`, `productId`, `status` (pending/paid/failed), `fulfillmentStatus`, `shippingAddress` (JSON), `isPreorder` |
| `mailingBroadcasts` | Resend broadcast records | `slug`, `broadcastId`, `recipientCount`, `sentAt` |
| `emailOpens` | Email open events (Resend webhook) | `resendEmailId`, `broadcastId`, `recipientEmail`, `openedAt` |
| `pageviews` | Raw page view log | `path`, `referrer`, `visitedAt` |
| `shareSessions` | WebRTC signaling blobs | `id` (8-char), `offer`, `answer`, `approved`, `createdAt` (TTL ~10 min enforced in code) |

Drizzle commands: `pnpm db:push` (sync schema), `pnpm db:studio` (GUI), `pnpm db:generate` (migrations).

---

## UI components (`src/lib/ui/`)

| Component | Purpose |
|-----------|---------|
| `Nav.svelte` | Top navigation bar; theme toggle; active route highlighting |
| `Footer.svelte` | Site footer |
| `PageHero.svelte` | Section hero with eyebrow, heading snippet, sub-text |
| `SectionH.svelte` | Section header with monospace index number and subtitle |
| `NoteCard.svelte` | Note list card (title, date, kind badge, lede) |
| `ProductCard.svelte` | Product list card (image, name, status, price) |
| `ProductCta.svelte` | Buy / pre-order button with checkout state |
| `ProjectCard.svelte` | Project list card |
| `Cta.svelte` | Generic call-to-action button |
| `ImageCarousel.svelte` | Touch-swipeable image carousel |
| `MarkdownBody.svelte` | Renders mdsvex HTML output with prose styles |
| `Led.svelte` | Amber/green/red LED dot indicator with glow |
| `SEO.svelte` | `<head>` meta tags, OG image, canonical URL |
| `Signature.svelte` | Dexterlabs sign-off block |
| `StatusBar.svelte` | Bottom status bar with oscilloscope waveform animation |
| `SubscribeForm.svelte` | Email subscribe form (POSTs to `/api/subscribe`) |
| `TagPill.svelte` | Pill badge for a single tag |
| `Placeholder.svelte` | Loading / empty state placeholder |
| `CV.svelte` | CV layout with skills sections |

---

## Key utilities (`src/lib/utils/`)

| File | Exports | Purpose |
|------|---------|---------|
| `image.ts` | `resolveLogImage`, `resolveProductImage`, `resolveProjectImage`, `vercelImg`, `vercelSrcset` | Maps relative `media/` paths to `/static/images/` WebP paths; wraps Vercel image optimization |
| `location.ts` | `getRegion`, `isEU`, `ALL_COUNTRIES` | Maps Vercel `x-vercel-ip-country` header to `NL \| EU \| World` shipping region |
| `fmt.ts` | `fmtDate`, `fmtPrice` | Date and EUR currency formatters |
| `auth.ts` | `requireAdmin` | Checks `ADMIN_TOKEN` cookie; redirects to login if missing |
| `product.svelte.ts` | `createCheckoutState` | Svelte 5 rune-based checkout state machine (idle → loading → redirecting → error) |
| `clipboard.ts` | `copyToClipboard` | Async clipboard write helper |

---

## Email (`src/lib/email/`)

| File | Purpose |
|------|---------|
| `MailingTemplate.svelte` | Full mailing layout — used for both Resend sends and the `/mailings/[slug]/` archive view |
| `OrderConfirm.svelte` | Order confirmation email (sent after Stripe webhook) |
| `EmailCta.svelte` | CTA button component for use inside email templates |
| `render.ts` | Server-side Svelte SSR → HTML string; rewrites image paths to absolute URLs; replaces unsubscribe placeholder |
| `image.ts` | Email-specific image URL resolution (absolute Vercel-optimised URLs) |

---

## Invoice system (`src/lib/invoice/`)

| File | Purpose |
|------|---------|
| `calculations.ts` | VAT and totals math (BTW, btw_verlegd, line item sums) |
| `pdf-generator.ts` | DOM-measurement binary search to split invoice content across pages |
| `index.ts` | Entry point; orchestrates render + pagination + QR code generation |

---

## Image pipeline

1. Place originals in `/content/<type>/<slug>/media/` (any format).
2. Run `pnpm optimize` (also runs automatically as part of `pnpm build`).
3. WebP output lands in `/static/images/<type>/<slug>/`.
4. Reference via `resolveLogImage` / `resolveProductImage` / `resolveProjectImage` from `src/lib/utils/image.ts`.

Do **not** put images directly in `/static/` — they won't be processed.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Yes | Stripe API key (server-only) |
| `SHIPPING_PRICE_NL` | Yes | NL shipping rate in EUR cents |
| `SHIPPING_PRICE_EU` | Yes | EU shipping rate in EUR cents |
| `SHIPPING_PRICE_WORLD` | Yes | World shipping rate in EUR cents |
| `RESEND_API_KEY` | Yes | Resend API key |
| `RESEND_SEGMENT_ID` | No | Resend audience segment ID for subscribers |
| `RESEND_FROM` | Yes | Sender address for transactional emails |
| `ADMIN_TOKEN` | Yes | Cookie value for admin route access |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |

All accessed via `$env/static/private` (build-time) or `$env/dynamic/private` (runtime). Never import env in `+page.ts` client-side loaders.

---

## Controlled vocabularies

**Tags** (`src/lib/content/tags.ts`): three groups — `stack`, `domain`, `hardware`. All tags must exist here with exact casing before use in frontmatter. `tags.test.ts` enforces this.

**Note kinds**: `BUILD`, `HARDWARE`, `TALK`, `PROJECT-LOG`, `OPEN-SOURCE` — uppercase, used as badge labels.

When adding tags or kinds: update `tags.ts` **and** `CLAUDE.md` **and** `content/templates/Note.md` together.
