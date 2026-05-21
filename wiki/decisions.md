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

## D7: Mailings archive `published` state derived from `mailingBroadcasts`, not frontmatter
- **Date**: 2026-05-19
- **By**: Dexter
- **Context**: Mailings used to gate the public archive on a manual `published: true` frontmatter flag. Setting that flag after broadcasting a mailing via Resend was a manual step easy to forget — leaving sent mailings invisible on `/mailings/`. The `mailingBroadcasts` table already records every broadcast (slug + broadcastId + sentAt), so the broadcast IS the publish event.
- **Decision**: Drop `published` from `MailingFrontmatter`. `/mailings/+page.server.ts` filters the markdown set by slugs present in `mailingBroadcasts`. `/mailings/[slug]/+page.server.ts` does the broadcast check + `entries()` for prerender, then renders the mailing through `MailingTemplate.svelte` (the same template Resend uses) and returns the resulting HTML string. The page renders an iframe with `srcdoc={data.emailHtml}` so the archive view is pixel-identical to the email. No client `+page.ts`, no component serialisation problem. Both routes keep `prerender = true`: the build runs the DB queries and the email render once, bakes static HTML. Production runtime stays static.
- **Consequences**: One narrow exception to [D3](#d3-rendering--adapter-vercel-with-full-prerender-no-ssr-for-content)'s "content loaders use `+page.ts`" rule — these two mailings routes use `+page.server.ts` because they need the DB. Spirit of D3 (no per-request SSR for content) is preserved by `prerender = true`. The build environment must have `DATABASE_URL` set (already required). Re-prerendering after a new broadcast requires a redeploy (or a triggered rebuild from the admin send action — future work).
- **Supersedes**: none (extends D3)

## D8: B12 visitor hash uses `$env/static/private` for salt (build-time)
- **Date**: 2026-05-21
- **By**: spec-writer (B12)
- **Context**: The `visitorHash` computation requires a `VISITOR_HASH_SALT` env var. The project convention (D1/D3) is to use `$env/static/private` for all secrets — values are inlined at build time on Vercel. Using `$env/dynamic/private` would allow salt rotation without a redeploy but deviates from convention.
- **Decision**: Use `$env/static/private`. Salt rotation requires a redeploy; this is acceptable because hash rotation on redeploy is actually desirable for a privacy-preserving unique-visitor count (old hashes become un-linkable). A fallback constant `'dxlb-default-salt'` is used when the env var is absent so local dev works without configuration.
- **Consequences**: The salt is fixed per deploy. Intentional key rotation = deploy a new salt = all visitor hashes change = previously counted unique visitors are uncorrelated with future ones (a privacy feature, not a bug). If runtime rotation is ever needed, supersede this decision and switch to `$env/dynamic/private`.
- **Supersedes**: none

## D9: B12 pure-function extraction for analytics helpers into `$lib/server/analytics`
- **Date**: 2026-05-21
- **By**: test-writer (B12)
- **Context**: `hooks.server.ts` is not directly unit-testable (it calls `event.cookies`, `db.insert`, and `event.getClientAddress()`). The UA parsing functions and the SHA-256 visitor hash computation are pure/async-pure and can be extracted cleanly.
- **Decision**: The implementer creates `src/lib/server/analytics.ts` exposing four functions: `parseDeviceType`, `parseOs`, `parseBrowser` (all `(ua: string | null) => ... | null`), and `computeVisitorHash(ip, ua, date, salt): Promise<string>`. `hooks.server.ts` imports from there. Tests import from there directly, bypassing the hook entirely.
- **Consequences**: One extra module. The hook stays thin (reads headers, calls helpers, writes to DB). All UA classification logic is isolated, testable, and reusable by future analytics routes. `$lib/server/analytics` is a server-only module (no `.server.ts` suffix needed since it lives under `lib/server/`).
- **Supersedes**: none

## D10: B13 test file uses `callIndex` mock pattern with generous padding for flexible DB call counts
- **Date**: 2026-05-21
- **By**: test-writer (B13)
- **Context**: The B13 load function will make multiple `db.select()` calls (trend-days, unique-visitors, paths, referrers, broadcasts, opens-agg, probes — exact count TBD by implementer). The existing `page.server.test.ts` uses a `callIndex` chain pattern where each mock call returns the next item in a `results` array. The new tests need to coexist without conflicting.
- **Decision**: The B13 tests live in `page.server.b13.test.ts` (different file, no `+` prefix per architecture convention). Each test provides 7 specific mock results followed by 10 empty-array padding entries via a `paddedResults()` helper. This gives the implementer latitude to split or merge queries (e.g. unique-visitors in a separate `select` vs. combined with trend-days) without breaking the tests. The mock chain also includes `.having()` in the chainable method list, which the B13 queries may need. Test assertions are against the *output shape* only, not against the number of DB calls.
- **Consequences**: Tests are robust to minor query refactoring. The implementer must return the correct shape regardless of how many internal queries are made. `vi.resetModules()` in `beforeEach` ensures the dynamic import re-evaluates the module for each test, so the `callIndex` counter resets correctly.
- **Supersedes**: none

## D11: B15 login action tested by calling the exported action function directly with mock cookies
- **Date**: 2026-05-21
- **By**: test-writer (B15)
- **Context**: The `login` action in `+page.server.ts` calls `cookies.set(name, value, opts)` with a plain options object. The spec requires asserting specific cookie attributes (`secure`, `path`, `httpOnly`, `sameSite`, `maxAge`). SvelteKit's built-in `cookies` object in tests is unavailable without a full request context.
- **Decision**: Call `actions.login({ request, cookies })` directly after mocking three modules: `$env/static/private` (returns a known `ADMIN_TOKEN`), `@sveltejs/kit` (mocks `redirect` to throw a catchable sentinel, `fail` to return an object), and `$lib/utils/auth` (returns a fixed session string). The `cookies` argument is a plain object with a `vi.fn()` spy on `set` that records all calls. Tests assert on the captured `opts` argument.
- **Consequences**: No browser or network layer is needed. The test is purely a unit test of the action function's call to `cookies.set`. The `vi.resetModules()` + dynamic `import()` pattern (same as B13 tests) ensures mocks apply to each test in isolation. AC1 (`secure: true`) and AC4 (`path: '/admin'`) fail against the current code; AC2, AC3, AC5, AC6 pass because those attributes are already correct.
- **Supersedes**: none

## D12: B14 OG endpoint tests use a closure-captured satori mock, not vi.spyOn
- **Date**: 2026-05-21
- **By**: test-writer (B14)
- **Context**: `vi.resetModules()` + dynamic `import('./+server.js')` causes the server module to bind to a freshly-resolved copy of `satori`. A `vi.spyOn` applied to the statically-imported `satori` module instance never intercepts calls made through the handler's own module copy. The node-inspection tests (AC5/AC6/AC7/AC8 truncation) need to see what was passed to satori.
- **Decision**: The `vi.mock('satori')` factory captures every call's `node` argument into a module-level `capturedSatoriNode` variable (reset in `beforeEach`). Because the factory closure is shared across all module instances in the same Vitest worker, the capture works regardless of how many times `resetModules` reloads the server module. `satori`, `@resvg/resvg-js`, and `sharp` are all mocked to avoid native binary dependencies in the test environment.
- **Consequences**: The mock satori always returns `<svg></svg>`. Tests assert on `capturedSatoriNode` directly. The Resvg mock must be a real `class` (not `vi.fn().mockImplementation(...)`) because the server calls `new Resvg(...)`. Sharp is mocked as a plain function returning a fluent chain. All three mocks are defined at module scope with `vi.mock()` hoisting, not inside individual tests.
- **Supersedes**: none

## D13: B16 hook guard tested by mocking $env/static/private per-test with vi.doMock + vi.resetModules
- **Date**: 2026-05-21
- **By**: test-writer (B16)
- **Context**: `hooks.server.ts` imports `VISITOR_HASH_SALT` from `$env/static/private`, a Vite/SvelteKit build-time virtual module. The test needs to supply two different salt values (the insecure default and a valid secret) in separate test cases to assert `console.error` fires only for the default. A single `vi.mock()` at file scope (hoisted) can only set one value.
- **Decision**: Use `vi.doMock('$env/static/private', ...)` (not hoisted) inside each `it` body, combined with `vi.resetModules()` in `afterEach` and a dynamic `await import('../../../../hooks.server.js')` per test. `console.error` is captured with `vi.spyOn(console, 'error').mockImplementation(() => {})` in `beforeEach` and restored in `afterEach`. `$lib/server/db` and `$app/environment` are mocked statically (they do not need per-test values). The test file lives at `src/routes/(private)/admin/analytics/page.server.b16.test.ts` per the spec's suggested location.
- **Consequences**: Each test gets a fresh module copy of `hooks.server.ts` with the intended salt value baked in. The pattern is consistent with B15 (vi.doMock + resetModules). One test (AC1) fails against the current code because the `console.error` call does not exist; AC2 and AC3 pass today because tracking already proceeds and no error is ever called — they remain correct constraints on the implementation.
- **Supersedes**: none

## D6 (proposed — pending Dexter): scoping of `@dxlbnl/ui` migration
- **Date**: 2026-05-18
- **By**: spec-writer (B3)
- **Context**: B3 introduces `@dxlbnl/ui` as the sole rendering path for the site's visual layer. D4 forbids utility-class frameworks but is silent on component libraries — D4 is preserved, not superseded. Several routes are functionally or visually unsuited to a generic component library and must be excluded from the migration up front.
- **Decision (proposed)**: `@dxlbnl/ui` is the canonical visual layer for **public marketing/content routes**. The following are **excluded** from `@dxlbnl/ui` migration: `src/lib/email/*` (Resend SSR, different runtime), `src/routes/(private)/invoices/*` (paper/print-specific renderer driven by DOM-height binary search), and `src/lib/invoice/*`. The `share/*` and `(private)/admin/*` routes are deferred (not excluded) to a later wave. First-page proving ground is `/order/cancel/`.
- **Consequences**: Email and invoice rendering keep their bespoke layers. Migration plan in `wiki/specs/B3-component-library-integration.md` lists waves 0–5 plus an explicit "out of plan" set. If `@dxlbnl/ui` is found to ship conflicting global tokens or a utility-class API, a follow-up ADR will be filed before bridging or constraining usage.
- **Supersedes**: none (extends D4)
