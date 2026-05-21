# Wiki Index

**This wiki is the single source of truth for the project. It is the spec.**
Every agent reads this page first, before doing anything else.

## How the workflow uses this wiki

- The `manager` reads `backlog/` to decide what to build next, dispatching on each
  item's `type:` (feature / bug / research / chore).
- `spec-writer` turns a feature/bug backlog item into a testable spec page under
  `specs/`.
- `test-writer` writes failing tests from that spec page; `implementer` makes them
  pass; `reviewer` verifies the result against this wiki.
- When code and wiki disagree, the **wiki wins** — update the wiki (or run `/wiki-sync`).

## Pages

### Vibin pipeline

| Page | Purpose |
|------|---------|
| [vision.md](vision.md) | What the project is and why it exists. |
| [requirements.md](requirements.md) | Functional requirements and constraints. |
| [architecture.md](architecture.md) | Tech stack, package manager, test setup, structure. |
| [backlog/](backlog/) | Work items, arranged in four lanes (inbox → ready → doing → done). See `backlog/README.md`. |
| [decisions.md](decisions.md) | Append-only decision log (ADR-style). |
| [progress.md](progress.md) | Append-only run journal — what the agents have done. |
| [specs/](specs/) | One detailed spec page per feature/bug. See `specs/README.md`. |
| [specs/B3-component-library-integration.md](specs/B3-component-library-integration.md) | B3 — Integrate `@dxlbnl/ui` from npm; first-page proving ground on `/order/cancel/`, plus the page-by-page migration plan. |
| [specs/B1-email-pageview-tracking.md](specs/B1-email-pageview-tracking.md) | B1 — Admin analytics view at `/admin/analytics/`: opens-per-broadcast table + recent pageview log (cap 100). |
| [specs/B12-analytics-schema-sessions-visitor-geoip-device.md](specs/B12-analytics-schema-sessions-visitor-geoip-device.md) | B12 — Extend `pageviews` table with sessionId, visitorHash, country, city, deviceType, os, browser; populate in hooks.server.ts. |
| [specs/B13-analytics-dashboard-redesign.md](specs/B13-analytics-dashboard-redesign.md) | B13 — Replace flat path table with five-section analytics dashboard: 30-day bar chart, grouped paths, referrers, email opens, probe traffic. |
| [specs/B14-ssrf-og-image-param.md](specs/B14-ssrf-og-image-param.md) | B14 — Reject external URLs in /api/og `image` param (SSRF fix), truncate title/subtitle/cta at 200 chars, add 5 s fetch timeout. |
| [specs/B15-admin-cookie-secure-flag.md](specs/B15-admin-cookie-secure-flag.md) | B15 — Add `Secure` flag (and tighten `path` to `/admin`) on the admin session cookie set by the login action. |

### Research

| Page | Purpose |
|------|---------|
| [research/analytics-dashboard-best-practices.md](research/analytics-dashboard-best-practices.md) | B11 — Analytics dashboard design: charting approach, URL grouping, bot filtering, what to drop. |

### Codebase reference

| Page | Purpose |
|------|---------|
| [codebase.md](codebase.md) | Lightweight agent reference: routes, components, content types, DB schema, utilities, env vars. |
| [missing-components.md](missing-components.md) | Tracker for components needed during the `@dxlbnl/ui` migration but not yet shipped. Populated page-by-page. |
| [regression-workflow.md](regression-workflow.md) | Per-page styling regression workflow: link the local `@dxlbnl/ui` repo, run the diff script, hand findings to the dxlb-ui agent, verify green, commit. |
| [regressions/](regressions/) | Staging reports — one rolling file per page; pushed to dxlb-ui's inbox on `--push`. |

### Features

| Page | Purpose |
|------|---------|
| [features/notes.md](features/notes.md) | Long-form notes: structure, frontmatter, image pipeline. |
| [features/catalogue.md](features/catalogue.md) | Product storefront: Stripe Checkout, VAT, shipping zones. |
| [features/mailings.md](features/mailings.md) | Newsletter: Resend broadcasts, subscriber API, open tracking. |
| [features/invoicing.md](features/invoicing.md) | Client-side PDF invoices, Dutch BTW, SEPA QR codes. |
| [features/share.md](features/share.md) | WebRTC P2P file and text transfer. |
| [features/feed.md](features/feed.md) | ~~Feed~~ — **DROPPED**. Kept for historical reference only. |

### Entities

| Page | Purpose |
|------|---------|
| [entities/dexterlabs.md](entities/dexterlabs.md) | What Dexterlabs is, who Dexter is, what the site does. |
| [entities/invoices.md](entities/invoices.md) | Private client-side PDF invoicing, Dutch BTW, SEPA QR codes. |
| [entities/external sites.md](entities/external%20sites.md) | Directory of external platforms, hosting, and diagnostic tools. |

### Concepts

| Page | Purpose |
|------|---------|
| [concepts/brand-voice.md](concepts/brand-voice.md) | Phosphor display aesthetic, Lab Bench tone, visual language. |
| [concepts/content-architecture.md](concepts/content-architecture.md) | Editorial intent for each content type; what belongs where. |
| [concepts/copy-guidelines.md](concepts/copy-guidelines.md) | Section-by-section copy tone and direction. |

### Expertise

| Page | Purpose |
|------|---------|
| [expertise/project-conventions.md](expertise/project-conventions.md) | Always/never rules: runes, pnpm, static-only, CSS conventions. |
| [expertise/svelte.md](expertise/svelte.md) | Svelte 5 component authoring: runes, snippets, events, bindings, lifecycle, scoped CSS, TypeScript. Read this instead of node_modules. |
| [expertise/sveltekit.md](expertise/sveltekit.md) | SvelteKit patterns: route files, load functions, auth guards, hooks, env vars, runes, path aliases. Read this instead of node_modules. |
| [expertise/dxlbnl-ui.md](expertise/dxlbnl-ui.md) | `@dxlbnl/ui` component library reference: all components, props, tokens. Read this instead of node_modules. Full docs at `../dxlb-ui/docs/`. |
| [expertise/stripe.md](expertise/stripe.md) | Stripe configuration for Dutch ZZP pre-orders. |
| [expertise/image-workflow.md](expertise/image-workflow.md) | Image generation procedure: content/ → pnpm optimize → static/. Read this before generating any image. |
| [expertise/image-prompts.md](expertise/image-prompts.md) | AI prompt templates for hardware product photography. |
| [expertise/artwork-prompts.md](expertise/artwork-prompts.md) | Dexter's Laboratory character illustration prompts, character sheet library, environment plates. |
| [expertise/website-audit.md](expertise/website-audit.md) | E-commerce compliance, UX, and technical SEO checklist. |

> The wiki is **open-ended**. Only this `INDEX.md` is structurally required. Add, split,
> and restructure pages as the project grows — just link new pages in the table above.

## Conventions

- **Adding a page**: create `wiki/<name>.md` (or `wiki/specs/<feature>.md`) and add a row
  to the Pages table above so it is discoverable. Unlinked pages are invisible.
- **Backlog items**: live as per-item files under `wiki/backlog/<lane>/B<n>-<slug>.md`.
  Lane = directory (no `status:` field). Each item has a `type:` (feature / bug /
  research / chore) and an optional `flags:` list (`review` to pause for approval,
  `blocked` if stuck). File new work with `/intake`; see `backlog/README.md`.
- **Spec pages**: live in `specs/`, one per feature/bug, named after the backlog item
  (e.g. `B3-user-login.md`). They must contain testable acceptance criteria — see
  `specs/README.md`.
- **Decisions**: when an agent makes a notable design/tech choice, it appends an entry to
  `decisions.md`.
- **Progress**: the `manager` appends to `progress.md` as items move through the
  pipeline, so the run is auditable.
- **Feed is dropped**: the feed feature (short status updates) has been removed from the
  codebase. Do not reintroduce feed routes or DB tables.
