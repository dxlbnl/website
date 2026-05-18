# Decision Log

> Append-only, ADR-style. Any agent that makes a notable design or technical choice adds
> an entry here. Newest at the bottom. Never edit past entries — supersede them with a
> new one.

## Format

```
## D<n>: <title>
- **Date**: <YYYY-MM-DD>
- **By**: <agent or user>
- **Context**: <what prompted the decision>
- **Decision**: <what was decided>
- **Consequences**: <trade-offs, follow-ups>
- **Supersedes**: <D<n> or "none">
```

---

## D1: Stack — SvelteKit 2 + Svelte 5 + TypeScript + mdsvex
- **Date**: 2026-04-01 (pre-Vibin; recorded retroactively 2026-05-18)
- **By**: Dexter
- **Context**: Needed a personal site that could serve static content, a product storefront, and a private invoice renderer without the overhead of a full-stack framework.
- **Decision**: SvelteKit 2 with Svelte 5 (runes API) and TypeScript strict mode. mdsvex for Markdown-as-components. All content loaded at build time via `import.meta.glob`.
- **Consequences**: Full runes API only — no legacy `$:` reactivity or `on:event` handlers. mdsvex handles `.md` and `.svx` extensions. Static prerender for all content routes.
- **Supersedes**: none

## D2: Package manager — pnpm
- **Date**: 2026-04-01 (pre-Vibin; recorded retroactively 2026-05-18)
- **By**: Dexter
- **Context**: Deterministic installs and workspace ergonomics needed for a reproducible build.
- **Decision**: pnpm only. Never npm or yarn, even if a generated config or tutorial suggests it.
- **Consequences**: `pnpm-lock.yaml` is the lock file. Agents are permissions-locked to `pnpm:*` in `.claude/settings.json`.
- **Supersedes**: none

## D3: Rendering — adapter-vercel with full prerender; no SSR for content
- **Date**: 2026-04-01 (pre-Vibin; recorded retroactively 2026-05-18)
- **By**: Dexter
- **Context**: Content is static (Markdown files); no need for per-request rendering. Vercel deployment requires `adapter-vercel` (not `adapter-static`) to correctly handle prerender + serverless API routes.
- **Decision**: `adapter-vercel` with prerender enabled for all public content routes. Content loaders use `+page.ts` (not `+page.server.ts`). Server code only in API routes and `/(private)/`.
- **Consequences**: Build produces static HTML for all content pages. API routes run as Vercel Serverless Functions. `+page.server.ts` exists only where server-side data is genuinely needed (admin, order success/cancel).
- **Supersedes**: none

## D4: No utility class framework — semantic CSS with CSS variables
- **Date**: 2026-04-01 (pre-Vibin; recorded retroactively 2026-05-18)
- **By**: Dexter
- **Context**: The visual language is Lab Bench / phosphor display — every element must earn its place. Utility class frameworks add noise and fight the aesthetic.
- **Decision**: Semantic CSS with CSS variables (defined in `src/app.css`). Two palette modes: `phosphor` (dark, green-tinted) and `paper` (light, warm beige). No Tailwind, no UnoCSS, no similar.
- **Consequences**: CSS lives in `<style>` blocks in each `.svelte` file. Global tokens in `app.css`. New UI work must use the existing token set before introducing new variables.
- **Supersedes**: none

## D5: Feed feature dropped
- **Date**: 2026-05-18
- **By**: Dexter
- **Context**: Feed was planned as a DB-backed micro-post system (short, titleless status updates). The `feedPosts` table was never created and the route was never shipped.
- **Decision**: Feature abandoned. No feed routes, no `feedPosts` table, no admin feed UI.
- **Consequences**: `wiki/features/feed.md` retained for historical reference only, marked DROPPED. The homepage does not have a feed/status indicator. Do not reintroduce.
- **Supersedes**: none
