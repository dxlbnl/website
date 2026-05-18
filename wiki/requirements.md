# Requirements

## Functional requirements

### Content publishing
- R1: Notes (long-form) are written as Markdown in `/content/notes/*/index.md` and appear at `/notes/[slug]/` sorted by date, newest first.
- R2: Projects are written as Markdown in `/content/projects/*.md` and appear at `/projects/[slug]/`. Non-archived projects appear on the homepage.
- R3: Products are written as Markdown in `/content/products/*.md` and appear at `/catalogue/[id]/`. Available products appear on the homepage.
- R4: Mailings are written as Markdown in `/content/mailings/*.md` and are archived at `/mailings/[slug]/` when `published: true`.
- R5: A visitor can subscribe to the mailing list via a form. Subscriptions go to Resend.
- R6: Tags on notes must come from the controlled vocabulary in `src/lib/content/tags.ts`. `tags.test.ts` enforces this at CI time.

### Commerce
- R7: A visitor can buy a product via Stripe Checkout from the product detail page.
- R8: Checkout applies EU VAT correctly: VAT-inclusive price for EU buyers, VAT-exclusive for non-EU. Country is detected from the Vercel `x-vercel-ip-country` header.
- R9: Shipping rates are applied by region (NL / EU / World) from environment variables.
- R10: B2B EU buyers can enter a VAT ID at checkout for reverse charge (btw verlegd).
- R11: A Stripe webhook writes completed orders to the `orders` DB table and sends a confirmation email via Resend.

### Admin
- R12: An admin panel at `/(private)/admin/` (password-protected) shows orders and mailing broadcasts.
- R13: The admin can send a mailing from `/admin/mailings/[slug]/`. Resend broadcasts it; the broadcast ID and recipient count are saved.
- R14: Email open events are tracked via a Resend webhook to `/api/resend-webhook` and stored in `emailOpens`.

### Invoice system
- R15: Invoices are written as Markdown in `/content/invoices/*.md` and rendered as print-ready PDFs at `/(private)/invoices/[invoicenr]/`.
- R16: The invoice renderer handles multi-page layout via binary search on DOM height.
- R17: Each invoice includes a SEPA QR code generated from the IBAN and amount.
- R18: `btw_verlegd: true` in frontmatter omits VAT and adds the statutory reverse-charge notice.

### Share tool
- R19: A visitor can open `/share/` and establish a direct WebRTC P2P connection with another of their own devices to send text, secrets, or files.
- R20: The first connection uses QR-code pairing; subsequent connections between trusted devices are automatic.
- R21: Nothing is stored server-side beyond a short-lived signaling blob (10 min TTL in `shareSessions`).

### SEO & performance
- R22: The site generates a `sitemap.xml` and an RSS feed for notes (`/notes/rss.xml`).
- R23: OG images are generated server-side at `/api/og`.
- R24: Images originating in `/content/*/media/` are pre-converted to WebP by `pnpm optimize` and served from `/static/images/`.

## Constraints

- **Package manager**: `pnpm` only. Never npm or yarn, even if a config or tutorial suggests it.
- **No SSR for content**: all content routes use `+page.ts` (not `+page.server.ts`) and are prerendered at build time via `import.meta.glob`. The only server-side code is in API routes and the admin/private section.
- **No Tailwind**: semantic CSS with CSS variables only. The visual language is Lab Bench / phosphor display — nothing decorative.
- **Svelte 5 runes only**: `$state`, `$derived`, `$props()`, `$effect`, `{@render}`. No legacy `$:`, `on:event`, or `<slot>`.
- **Deployment**: Vercel via `adapter-vercel`. Not `adapter-static`. Prerender is fully enabled for public content.
- **Database**: Neon PostgreSQL via Drizzle ORM. Schema lives in `src/lib/server/db/schema.ts`.

## Assumptions

- Visitors have a stable network connection (no offline support).
- The site is operated by a single person (Dexter); multi-user admin is out of scope.
- Dutch ZZP (sole proprietorship) tax context: 21% BTW, SEPA payment QR, OSS for EU sales.
- Stripe handles all payment compliance; the site does not store card data.

## Open questions

- Component library integration (B3): scope and migration path TBD — flagged `review` in backlog.
- Email/pageview tracking UI (B1): how much analytics to surface in admin vs. keeping raw DB access.
