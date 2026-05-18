# B3: Component library integration (`@dxlbnl/ui`)

## Context

Dexter has published a personal component library, `@dxlbnl/ui`
(https://www.npmjs.com/package/@dxlbnl/ui), and wants the site's visual layer to be
served entirely from it. Today the site uses ad-hoc components in
[`src/lib/ui/`](../codebase.md#ui-components-srclibui) and per-route `<style>` blocks
built on the tokens in [`src/app.css`](../../src/app.css) (phosphor + paper palettes).

This spec extends — does not supersede —
[D4: No utility class framework — semantic CSS with CSS variables](../decisions.md#d4-no-utility-class-framework--semantic-css-with-css-variables).
D4 forbids utility-class frameworks (Tailwind/UnoCSS/etc.); it does **not** forbid a
semantic component library. `@dxlbnl/ui` is a component library, not a utility framework,
so D4 is preserved by this work. If, when integrating, it turns out the library ships
global CSS or design tokens that conflict with `app.css`, that is a fresh decision and
must be filed as a new ADR (proposed D6) before resolving — see Open questions.

Related wiki:

- Item card: [`wiki/backlog/doing/B3-component-library-integration.md`](../backlog/doing/B3-component-library-integration.md)
- Constraints from Dexter: see the "Constraints (Dexter, 2026-05-18)" block on the item card.
- Routes and current UI inventory: [`wiki/codebase.md`](../codebase.md)
- Visual language being preserved: [`wiki/concepts/brand-voice.md`](../concepts/brand-voice.md)
- Gap tracker: [`wiki/missing-components.md`](../missing-components.md)

### Migration shape (summary)

- **Distribution**: install `@dxlbnl/ui` from npm via `pnpm`. No git submodule, no monorepo, no vendored copy.
- **Incremental, page by page** — not component-family by component-family.
- **No fallback HTML/CSS** in app code. Gaps are logged in `wiki/missing-components.md` and the surface is left unmigrated.
- **First page is a proving ground.** This spec proves the integration end-to-end on a single low-risk route. Every other route is migrated in a follow-up backlog item that uses the plan in this spec as its starting point.

### First page selected: `/order/cancel/`

Justified below; see acceptance criterion 3 and "Migration plan" for the rationale and the order of the rest.

## Acceptance criteria

> Each criterion is mechanically checkable by `test-writer`. Where a check is a regex
> or import-graph assertion, the target file is named so the test can be specific.

### A. Library installed and importable

1. `@dxlbnl/ui` appears in `dependencies` (not `devDependencies`) of
   [`package.json`](../../package.json), at a pinned version (no `*`, no `latest`,
   no `workspace:*`). The version must satisfy `pnpm install --frozen-lockfile`.
2. `pnpm-lock.yaml` contains an entry for `@dxlbnl/ui` and resolves cleanly under
   `pnpm install --frozen-lockfile` (no install warnings about peer mismatch with
   Svelte 5 / SvelteKit 2).
3. `pnpm check` (svelte-check) passes with at least one TypeScript import of a named
   export from `@dxlbnl/ui` in a route file. (i.e. the package ships types that
   resolve under SvelteKit's `bundler` module resolution.)
4. `pnpm build` succeeds with the library imported. The migrated first page
   prerenders without runtime errors.

### B. Global CSS / token wiring

5. If `@dxlbnl/ui` ships a global CSS file (e.g. `@dxlbnl/ui/styles.css` or
   `@dxlbnl/ui/dist/index.css`), it is imported **exactly once**, from
   [`src/routes/+layout.svelte`](../../src/routes/+layout.svelte), **before** the
   existing `import '../app.css';` line. (Site tokens win over library defaults
   because they load later.)
6. The two existing palettes continue to work: visiting the first page with
   `document.documentElement.dataset.palette === 'phosphor'` (default) renders with
   the dark, green-tinted palette; toggling to `paper` renders with the warm-beige
   palette. The toggle mechanism in `+layout.svelte` is not changed.
7. The CSS custom properties defined in `src/app.css` (`--bg`, `--ink`, `--amber`,
   `--cyan`, `--rule`, `--mono`, `--sans`, `--t-*`, `--u`, `--radius`, `--radius-card`,
   etc.) remain defined on `:root` and `[data-palette="paper"]` after the migration.
   No token deletions are part of B3.
8. If `@dxlbnl/ui` defines its own design tokens under a different prefix (e.g.
   `--ui-*`), no `--ui-*` → `--*` bridging is added in this spec. Bridging, if needed,
   is filed as a separate decision (see Open questions Q1) and a separate backlog item.
9. The fonts currently loaded in `+layout.svelte` (`@fontsource/inter-tight`,
   `@fontsource/jetbrains-mono`) remain loaded. No new font imports are introduced
   unless `@dxlbnl/ui` documents a required font face — in which case the requirement
   is logged in `wiki/missing-components.md` and the font is **not** added in B3
   (deferred to a follow-up).

### C. First page rendered entirely through `@dxlbnl/ui`

The first page is `src/routes/(console)/order/cancel/+page.svelte`.

10. The route file `src/routes/(console)/order/cancel/+page.svelte` contains:
    - **Zero** `<style>` or `<style lang="...">` blocks. (Regex: `/<style[\s>]/` must
      not match.)
    - **Zero** `style="..."` inline attributes on any element. (Regex: `/\sstyle=/`
      must not match in the template region.)
    - **Zero** HTML element tags inside the template region. The template region is
      everything outside `<script>...</script>` and `<svelte:head>...</svelte:head>`.
      No `<div>`, `<section>`, `<main>`, `<article>`, `<header>`, `<footer>`,
      `<nav>`, `<aside>`, `<p>`, `<h1>`–`<h6>`, `<span>`, `<ul>`, `<ol>`, `<li>`,
      `<a>`, `<button>`, `<img>`, `<figure>`, `<figcaption>`, `<form>`, `<input>`,
      `<label>`, `<br>`, `<hr>`. Any text/markup must be rendered through a component
      from `@dxlbnl/ui`.
    - **Zero** imports from `$lib/ui/...` (regex: `from '\$lib/ui/`).
    - **Zero** imports from `$lib/styles/...` or other ad-hoc style modules.
    - **At least one** import from `@dxlbnl/ui` (regex: `from '@dxlbnl/ui'` or a
      sub-path like `from '@dxlbnl/ui/...'`).
11. The following content from the existing page is preserved on the migrated page
    (functional equivalence, not pixel-identical):
    - The page title "Order Cancelled" and the meta description "Your order was not
      completed. No charge was made." reach the document `<head>` (via whatever
      `@dxlbnl/ui` SEO/head component exists, or via `<svelte:head>` in the route
      file — `<svelte:head>` is explicitly allowed; see (15) below).
    - The visible heading text "No charge made."
    - The amber LED status indicator paired with the label "ORDER CANCELLED".
    - The body copy "You cancelled the checkout. Nothing was charged. Head back to
      the catalogue if you'd like to try again."
    - A back link to `/catalogue/` with the label "RETURN TO CATALOGUE" (the leading
      arrow is decorative and may be omitted if the library's back-link component
      renders its own affordance).
    - The Dexterlabs sign-off block (currently `Signature.svelte`).
12. Clicking the back link navigates to `/catalogue/` (asserted via a route smoke
    test using `@sveltejs/kit` test utilities or a Vitest browser test).
13. The page renders without runtime warnings or errors under both palettes
    (`phosphor` and `paper`). The amber LED is visibly amber-toned in both palettes
    per `app.css` palette overrides.
14. **`src/lib/ui/` is not modified** as part of B3. The legacy components remain
    on disk so that unmigrated routes keep rendering. (Deletion is out of scope —
    see Out of scope.)
15. **Allowed in the migrated route file**, despite (10):
    - `<script>` and `<script lang="ts">` blocks.
    - `<svelte:head>` blocks (until a stable `@dxlbnl/ui` head/SEO component is
      confirmed — see Open questions Q3).
    - Svelte template directives that are not HTML tags: `{#if}`, `{#each}`,
      `{:else}`, `{@render}`, `{#snippet}`, `{@html}` (only inside a `@dxlbnl/ui`
      component's snippet).
    - Whitespace and text nodes inside `@dxlbnl/ui` component snippets.

### D. Gap tracking

16. If any surface on the first page cannot be rendered through `@dxlbnl/ui` because
    the required component / prop / variant is missing, a new row is appended to the
    "Open gaps" table in [`wiki/missing-components.md`](../missing-components.md)
    with columns: page (`/order/cancel/`), needed component or capability, date
    first noticed, fallback ("surface left unmigrated").
17. If a gap is logged per (16), the corresponding surface in
    `src/routes/(console)/order/cancel/+page.svelte` is **removed** from the
    migrated route or guarded behind a comment indicating it is deferred. The route
    file must still pass criterion (10). It is **never** acceptable to put raw HTML
    or `<style>` back to fill a gap.
18. If there are zero gaps on the first page, the "Open gaps" table is left empty
    and a one-line note is appended to `wiki/progress.md` reading
    `B3: /order/cancel/ migrated to @dxlbnl/ui with no gaps logged.`

### E. Migration plan exists in this spec

19. The "Migration plan" section below lists every route currently in the codebase
    grouped into waves with one-line rationale per route. This is the source of
    truth for the follow-up backlog items the manager will file (B5, B6, ...).
    Any route added between now and migration end gets appended to this plan.
20. No follow-up route is migrated as part of B3. The implementer's scope is the
    first page only. Subsequent routes require their own backlog item with their
    own spec page referencing this one.

## Migration plan

Migration waves are ordered by risk (lowest first). Each route in the table will
become its own backlog item once B3 is reviewed, using this spec as the template
for the "done per page" rules (criteria 10, 11, 13–17).

### Wave 0 — proving ground (this spec)

| Route | Rationale |
|---|---|
| `/order/cancel/` | Tiny surface: heading, paragraph, LED, back-link, sign-off. No data loader. No forms. No Stripe code on the page itself. Failure mode is contained. |

### Wave 1 — small static routes, no forms, no loaders

| Route | Rationale |
|---|---|
| `/legal/` | Index of links. Lowest content variation. |
| `/legal/[slug]/` | Renders a `LegalFrontmatter` markdown body via `MarkdownBody`. Tests prose styling through `@dxlbnl/ui`. |
| `/about/` | Multi-section static page; exercises section headers, eyebrow labels, two-column splits, and lists. First medium-sized page. |

### Wave 2 — content lists and detail pages (no commerce)

| Route | Rationale |
|---|---|
| `/notes/` | List view with tag filtering. Exercises `NoteCard` and `TagPill` replacements. |
| `/notes/[slug]/` | Long-form prose; exercises `MarkdownBody` + `PageHero` replacements + code blocks (Shiki). |
| `/projects/` | Project list — `ProjectCard` replacement. |
| `/projects/[slug]/` | Project detail — `ImageCarousel` replacement (carousel is a known component-library risk area). |
| `/mailings/` | Mailing archive list. |
| `/mailings/[slug]/` | Renders via `MailingTemplate` — note this template is **also used for email rendering**; the route page can switch to `@dxlbnl/ui` but `src/lib/email/MailingTemplate.svelte` is explicitly **out of scope for B3 and all UI follow-ups** (email goes through Resend SSR and has different constraints). |

### Wave 3 — contact + subscribe (form coupling)

| Route | Rationale |
|---|---|
| `/contact/` | Has `SubscribeForm` which POSTs to `/api/subscribe`. The form is a coupling risk: confirm `@dxlbnl/ui` ships a form input + submit-state component before migrating. Likely gap candidate. |

### Wave 4 — commerce surfaces (highest risk)

| Route | Rationale |
|---|---|
| `/catalogue/` | Product list; `ProductCard` replacement; status badges. |
| `/catalogue/[id]/` | Product detail + `Pricebox` + `ProductCta` (Stripe Checkout button + checkout state machine). Stripe coupling — migrate visual layer only, do not refactor the `createCheckoutState` rune. |
| `/order/success/` | Has a server load (`+page.server.ts`). Visual migration only. |
| `/` | Homepage. Composes hero + product grid + project grid + notes grid. Migrate after all card components are proven. |

### Wave 5 — layout shells

| File | Rationale |
|---|---|
| `src/routes/+layout.svelte` | Root layout. Carries the palette toggle effect and analytics; visual surface is `<svelte:head>` + `{@render children()}`. Verify `@dxlbnl/ui` does not require a root provider component before tagging this done. |
| `src/routes/(console)/+layout.svelte` (if it gains markup) | Nav + Footer wrapper. Tied to `Nav.svelte` and `Footer.svelte` migrations. |
| `Nav.svelte` replacement | Top nav + theme toggle + active route highlight. High-touch component; isolate as its own item. |
| `Footer.svelte` replacement | Lower risk than Nav. |
| `StatusBar.svelte` replacement | Animated oscilloscope waveform — likely missing-component candidate. |

### Out of plan (B3 and all UI follow-ups)

- `/share/*` — WebRTC P2P routes. Deferred: many components, transient state, QR pairing flow. Visit only after Wave 5 stabilises.
- `/(private)/admin/*` — Admin surfaces. Lower priority and lower visibility.
- `/(private)/invoices/[invoicenr]/` — Invoice PDF renderer. Driven by binary-search pagination over DOM measurements; the visual layer is **paper-and-print specific** and will likely never use `@dxlbnl/ui`. Leave alone.
- `/api/*`, `/sitemap.xml`, `/notes/rss.xml`, `/cv/`, `+error.svelte` — out of plan
  unless visually trivial (`+error.svelte` may be revisited at the end).
- `src/lib/email/*` — Email rendering goes via Resend SSR; different runtime
  constraints from in-browser. Not part of this migration.

## Out of scope

- Migrating any route other than `/order/cancel/`. Each remaining route becomes its
  own backlog item (B5, B6, ...) referencing this spec.
- Modifying `@dxlbnl/ui` itself. Filling library gaps is a separate workstream on
  the library repo, not in this app.
- Deleting `src/lib/ui/` components. Deletion happens only after **every** importer
  of a given component has been migrated; that final cleanup is its own backlog
  item filed at the end of the migration.
- Refactoring the palette toggle (`src/lib/theme.svelte`) or `app.css` tokens. The
  tokens are kept as-is so unmigrated routes keep rendering.
- Touching `src/lib/email/MailingTemplate.svelte`, the invoice renderer, the share
  tool, or admin pages.
- Touching server loaders (`+page.server.ts`) or API endpoints.
- Visual redesign. The migrated page is functionally equivalent in voice and
  hierarchy; pixel parity is **not** required.

## Resolved — README inspection (2026-05-18, manager)

The library tarball was inspected against `node_modules/@dxlbnl/ui/` after
`pnpm add @dxlbnl/ui` (Dexter ran the install). Findings below supersede the
defensive open-questions section that originally lived here.

- **Q1 — Token bridging.** No bridge needed. `@dxlbnl/ui/tokens/tokens.css`
  defines all CSS custom properties on `:root` with the **same names and values**
  as the site's existing `src/app.css` (`--bg #0b0d0c`, `--ink #d6e2dc`,
  `--amber #ffb347`, `--cyan #7cc7d1`, `--rule`, `--mono`, `--sans`, `--t-*`,
  `--u`, `--radius`, `--radius-card`). Library superset adds spacing rungs
  `--u2..--u10`, `--bg-rail`, `--bg-elev`, `--bg-sunken`, `--overlay`,
  `--transition`. **Decision**: import `@dxlbnl/ui/tokens/tokens.css` once, in
  `src/app.css` at the very top (before `app.css`'s own `:root` block). The
  library is the canonical token source; `app.css`'s redundant token block
  remains for now (identical values; will be deleted in a follow-up cleanup item
  once all routes are migrated). **No new ADR required** — D4 stays intact.
- **Q2 — Palette parity.** Identical mechanism. Library uses `data-palette`
  on `<html>` exactly as the site does (`+layout.svelte` already sets
  `document.documentElement.dataset.palette = 'phosphor' | 'paper'`). Plug-and-play.
- **Q3 — SEO / head component.** Library does **not** ship an SEO-equivalent.
  The migrated route uses an inline `<svelte:head>` block per criterion (15).
  A site-wide replacement for `src/lib/ui/SEO.svelte` is a long-term gap; log
  one row in `wiki/missing-components.md` so the library can grow one later.
- **Q4 — Coverage on `/order/cancel/`.** Every surface maps:
  - Page shell → `Container size="lg"` + `Stack gap="lg"`.
  - Amber LED → `Led color="amber"` (note: prop is `color`, not the site's
    legacy `tone`).
  - Eyebrow label → `Text variant="eyebrow"`.
  - Display heading → `Heading level={1}` (level 1, default variant maps to `h1`).
  - Body prose → `Text` (default `variant="body"`, `color="dim"` to match).
  - Back link → `Button as="a" href="..." variant="back"` (back variant exists).
  - Signature block → composed from `Rule` + `Spread gap="md"` + two
    `Stack gap="xs"` with `Text variant="eyebrow"` and `Text variant="lede"`.
    No direct `Signature` export — composition is what the library is designed
    for, so this counts as a full migration, not a gap.
- **Q5 — Provider component.** None required. The library has no `UIProvider`
  / `ThemeProvider`. `ToastRegion` is the only globally-mounted component, and
  it's deferred to a later wave (no toasts on the first page).
- **Q6 — D4 supersession.** Library API is purely components-with-props; no
  utility classes. D4 is not threatened.
- **Q7 — Versioning.** `@dxlbnl/ui` is already in `package.json` as `^1.0.0`
  (caret). Dexter installed it; spec relaxes to **caret on 1.x** for this run.
  Tighten to exact pin only if the library's 1.x line introduces breaking
  visual changes.

### Concrete library mapping for `/order/cancel/`

```
import { Container, Stack, Inline, Spread, Rule, Heading, Text, Led, Button }
  from '@dxlbnl/ui';
```

Top-level template structure expected:

```
<Container size="lg">
  <Stack gap="lg">
    <Stack gap="md">                <!-- main message block -->
      <Inline gap="xs">
        <Led color="amber" />
        <Text variant="eyebrow" color="amber">ORDER CANCELLED</Text>
      </Inline>
      <Heading level={1}>No charge made.</Heading>
      <Text color="dim">You cancelled...</Text>
      <Button as="a" href={resolve('/catalogue/')} variant="back">
        RETURN TO CATALOGUE
      </Button>
    </Stack>

    <Rule />                        <!-- signature block -->
    <Spread gap="md">
      <Stack gap="xs">
        <Text variant="eyebrow">// SIGNED</Text>
        <Text variant="lede">— Dexter, in the lab</Text>
      </Stack>
      <Stack gap="xs">
        <Text variant="eyebrow">// SHIPPED BY</Text>
        <Text variant="lede">DEXTERLABS / a one-person lab</Text>
      </Stack>
    </Spread>
  </Stack>
</Container>
```

The implementer is not required to match this exactly — only the "done per page"
rules in section C bind. The mapping is provided so the test-writer can write
targeted assertions and the reviewer has a reference shape.

### Updated criteria (resolved README answers)

- **Criterion 5 rewritten**: `@dxlbnl/ui/tokens/tokens.css` is imported **once**,
  at the **top** of [`src/app.css`](../../src/app.css), as the first non-comment
  line (using a CSS `@import` statement). `@dxlbnl/ui/tokens/typography.css` is
  **not** imported in B3 — `app.css`'s own reset stays as-is on unmigrated
  routes; we'll switch to the library's typography reset in a follow-up cleanup
  item once every page is migrated.
- **Criterion 11 addendum**: the LED prop is `color="amber"`, not `tone="amber"`.
  The existing `src/lib/ui/Led.svelte` uses `tone`; the library uses `color`.
  The migrated route uses the library's prop name.
- **Criterion 15 addendum**: `<svelte:head>` is **definitely required** on this
  page (library has no SEO component). Test-writer asserts the `<title>` and
  `<meta name="description">` reach the document head.

## Remaining open question

Just one, and it does not block B3:

1. **D4 housekeeping**. The site's `app.css` contains utility classes
   (`.btn-back`, `.btn-cta`, `.btn-ghost`, `.btn-primary`, `.btn-del`, `.eyebrow`,
   `.card-grid`) that exist only to back unmigrated routes. These are not a
   utility-class framework (D4 forbids that) — they are page-level utilities for
   in-flight migration. They will be deleted in a follow-up cleanup item once
   every route has been migrated. No ADR action needed during B3.
