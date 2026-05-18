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
- **mdsvex** - Markdown files are processed as Svelte components; `.md` and `.svx` extensions are both valid
- **Adapter**: `adapter-vercel` with prerender/static output
- **TypeScript** strict mode, `bundler` module resolution

## Architecture

### Content System

All dynamic content lives in `/content/` as Markdown files with YAML frontmatter. TypeScript interfaces for all frontmatter types are in [src/lib/types.ts](src/lib/types.ts): `ProductFrontmatter`, `NoteFrontmatter`, `ProjectFrontmatter`, `MailingFrontmatter`, `LegalFrontmatter`, `InvoiceFrontmatter`.

Content is loaded at build time via `import.meta.glob(..., { eager: true })` - this is how SvelteKit generates static pages from markdown.

### Routing

File-based routes under `src/routes/`:

- `/(console)/` - main public section (catalogue, repository)
- `/(console)/catalogue/[id]` - individual product pages, data from `/content/products/`
- `/(console)/repository/[slug]` - project showcase pages, data from `/content/repository/*/index.md`
- `/(private)/invoices/[invoicenr]` - invoice view/export, data from `/content/invoices/`

Each dynamic route has a `+page.ts` loader that reads the matching markdown file and returns typed frontmatter.

### Image Pipeline

Repository project images originate in `/content/repository/*/media/`. The `pnpm optimize` script (run automatically as part of `pnpm build`) converts them to WebP and outputs to `/static/images/repository/`. The `src/lib/utils/` helpers resolve the correct static path at runtime.

### Invoice System

Multi-page PDF generation lives in `src/lib/invoice/`. Key detail: pagination uses binary search to fit content per page. Supports Dutch VAT (BTW) formatting and QR code payment links.

## Code Style

Prettier config (enforced by lint): **tabs**, **single quotes**, print width 100, no trailing commas. ESLint uses flat config (`eslint.config.js`) with svelte + typescript-eslint plugins.

## Content types, voice, and cross-posting

The site is a personal logbook first — content is for documenting the work, not for selling. Four content types, each with a defined role:

| Type                                | Role                                                                                                                                       | Length                    | Cross-post?             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ----------------------- |
| **Notes** (`/content/notes/`)       | Long-form logbook: build logs, schematics, post-mortems, deep-dives. The meat.                                                             | 600–2500 words            | Yes — see playbook      |
| **Projects** (`/content/projects/`) | Evergreen showcase for shipped software/hardware experiments.                                                                              | Tight description + links | One-off launch post     |
| **Products** (`/content/products/`) | Storefront. Feature/benefit, but in voice.                                                                                                 | Long technical            | Launch post per SKU     |
| **Mailings** (`/content/mailings/`) | Warm recap for opted-in subscribers. The page is just the email's "view in browser" archive — it is `noindex` and kept out of the sitemap. | 300–600 words             | Never (private channel) |

### Voice

Audience is generalist makers **and** Eurorack folk — a synth builder and a homelab/3D-print reader should both feel addressed.

- **First person, plain language.** "I built…", not "Dexterlabs presents…".
- **Technical specificity is a feature** — name parts, currents, libraries, branch names. The reader is also a maker.
- **Bridge freely** — a Eurorack post can mention 3D-printed brackets; a code post can mention the bench it runs on.
- **No corporate-speak.** "Coming soon" is fine; "excited to announce" is not.
- **Avoid AI tells** — inflated symbolism, "transforms your X", em-dash overuse, rule-of-three filler, "it's not just X, it's Y" parallelisms, vague attributions. Use the `humanizer` skill when drafting.
- Reference tone: `content/notes/003-conduit-pdx1/index.md` and `content/mailings/001-the-lab-is-open.md`.

### Tags and note `kind`

Tags must come from the controlled vocabulary in [src/lib/content/tags.ts](src/lib/content/tags.ts) — exact casing, no ad-hoc additions without adding them there first. `tags.test.ts` enforces this. Note `kind` is one of: `BUILD`, `HARDWARE`, `TALK`, `PROJECT-LOG`, `OPEN-SOURCE`. When these conventions change, update `tags.ts`, this file, **and** `content/templates/Note.md` together — the Obsidian template is the source of truth for hand-authored notes.

### Cross-post playbook

Site is canonical; every platform gets a tailored teaser linking back. No X/Mastodon/Bluesky.

- **Reddit** — primary off-site channel. Self-posts with the build story in-thread, link at the bottom; never bare link-posts. One subreddit at a time, rotate. Targets: hardware/modular → r/synthdiy, r/modular, r/synthesizers, r/diyelectronics, r/electronics, r/PrintedCircuitBoard; maker → r/3Dprinting, r/homeassistant; software → r/webdev, r/typescript, r/javascript.
- **Instagram** — visual-first carousels (PCB shots, scope traces, finished module). Caption = lede + 2-3 sentences, link in bio.
- **Facebook groups** — synth-DIY groups only, not personal feed. Photo + 1-2 paragraphs + link.
- **LinkedIn** — only software/engineering Notes. Frame as "what I learned building X".
- **HN** — rare, only substantial software-leaning Notes. Bare title, no marketing.

---

## Vibin Workflow

This repo uses the **Vibin** wiki-driven, spec-first, test-first agent pipeline.

### The wiki is the single source of truth

- `wiki/` is the spec. Every agent reads `wiki/INDEX.md` first — a `PreToolUse` hook enforces this.
- When code and wiki disagree, **update the wiki** (or run `/wiki-sync`). The wiki wins.
- The wiki is open-ended. Only `INDEX.md` is structurally required; add pages freely and link them there.

### Pipeline

```
feature/bug  →  spec-writer → test-writer → implementer → reviewer
research     →  researcher specialist → reviewer confirms findings
chore        →  implementer → reviewer (no spec, no tests-first)
```

- `/bootstrap` — sets up the wiki and scaffolding for a new project.
- `/manager` — orchestrates the build: reads backlog, dispatches tracks, commits completed items.
- `/intake "<title>"` — files a new backlog item into `wiki/backlog/inbox/` mid-run.
- `/status` — shows current lane counts and the active item.

### Operational rules

- **Top-level only** — the top-level session answers questions and runs `/manager`. It never writes product code, specs, or tests directly — those go through delegated subagents.
- **Artifact handoff** — subagents communicate only through repo + wiki files. Delegation prompts must name the exact files to read and write.
- **Triage new work** — any bug/feature/change surfaced mid-run goes to `/intake`, not inline-patched.
- **No ad-hoc interpreters** — never run `node -e …`, `python -c …`, or throwaway scripts. Use `Read`/`Grep`/`Glob` for code inspection; write a real test for behaviour verification; describe config changes and ask the user to apply them.
- **Package manager** — always `pnpm`. Never substitute npm or yarn even if a config or README suggests it.
- **Commits** — one commit per completed backlog item, message references the item id (e.g. `B3: add user login`). Never push unless the user asks.
- **Run until blocked** — the manager works through the backlog without per-item check-ins, pausing only for: (1) the initial work-plan approval, (2) items flagged `review`, (3) unresolved failures after 4 attempts, (4) a second reviewer rejection.
- **Decision log** — any notable design/tech choice is appended to `wiki/decisions.md` (ADR-style).
