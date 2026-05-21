# B13: Analytics dashboard redesign

## Context

The current `/admin/analytics/` page (delivered by B1) shows two flat tables: a
per-path visit count list and an email opens table. It has no time dimension and no
section grouping, so it cannot answer "is traffic growing?" or "which section is
getting hits?". B12 landed seven new columns on `pageviews` (`sessionId`,
`visitorHash`, `country`, `city`, `deviceType`, `os`, `browser`) which make unique
visitor counts possible. This item replaces the flat path table with a rich
five-section dashboard, using the B11 research findings as the design brief.

Related wiki pages and source files:

- Item card: [`wiki/backlog/doing/B13-analytics-dashboard-redesign.md`](../backlog/doing/B13-analytics-dashboard-redesign.md)
- Research (design rationale): [`wiki/research/analytics-dashboard-best-practices.md`](../research/analytics-dashboard-best-practices.md)
- Prior spec (B1 — being extended): [`wiki/specs/B1-email-pageview-tracking.md`](./B1-email-pageview-tracking.md)
- Prior spec (B12 — schema dependency): [`wiki/specs/B12-analytics-schema-sessions-visitor-geoip-device.md`](./B12-analytics-schema-sessions-visitor-geoip-device.md)
- DB schema: [`src/lib/server/db/schema.ts`](../../src/lib/server/db/schema.ts) — `pageviews` now has the B12 columns.
- Current load function: [`src/routes/(private)/admin/analytics/+page.server.ts`](../../src/routes/(private)/admin/analytics/+page.server.ts)
- Current page: [`src/routes/(private)/admin/analytics/+page.svelte`](../../src/routes/(private)/admin/analytics/+page.svelte)
- Requirements: [R12](../requirements.md#admin) (admin panel, password-protected).

**Depends on B12 being merged** before this item is implemented.

---

## Acceptance criteria

### A. Load function shape

1. `+page.server.ts` exports a `load` function that returns an object with exactly
   these five top-level keys: `trend`, `paths`, `referrers`, `opens`, `probes`.
   TypeScript type-checks pass (`pnpm check`) with all five keys present and typed.

2. `trend` has the shape:
   ```ts
   {
     days: { day: string; visits: number }[]   // 30 entries, one per calendar day; days with 0 visits included
     totalVisits: number                        // sum of all visits in the 30-day window
     uniqueVisitors: number                     // COUNT(DISTINCT visitorHash) WHERE visitorHash IS NOT NULL
   }
   ```
   `day` is an ISO date string (`YYYY-MM-DD`). The array is ordered oldest-first
   (ascending by day). Days with no visits in the DB must still appear in the array
   with `visits: 0` — the load function fills gaps by iterating the 30-day window and
   merging DB rows. The DB query uses `date_trunc('day', visitedAt)` and the
   [bot filter](#bot-filter-definition) defined in criterion 8.

3. `paths` has the shape:
   ```ts
   {
     segment: string                  // first URL segment, e.g. '/', '/notes', '/catalogue'
     totalVisits: number              // sum of child path visits within this segment
     paths: {
       path: string
       visits: number
       lastSeen: string              // ISO string of MAX(visitedAt) for this path
     }[]
   }[]
   ```
   The top-level array is ordered by `totalVisits` descending. Within each group,
   child `paths` are ordered by `visits` descending. The data covers the top 50
   paths overall (bot-filtered, admin-filtered, api-filtered), then grouped. The
   first-segment logic: `'/'` maps to paths where the first segment is empty (i.e.
   the path is exactly `'/'`); all others use the first non-empty segment (e.g.
   `/notes/003-conduit` → `/notes`).

4. `referrers` has the shape:
   ```ts
   { referrer: string; count: number; pct: number }[]
   ```
   `pct` is a number in the range `[0, 1]` representing this referrer's share of
   the total referred traffic (i.e. `count / sum(count)` across the returned rows,
   not across all pageviews). Top 20 rows, ordered by `count` descending. Null
   referrers and referrers matching `%dexterlabs.nl%` are excluded. Bot-filtered.

5. `opens` is identical to the B1 contract — unchanged. Shape:
   ```ts
   {
     slug: string
     broadcastId: string
     sentAt: string          // ISO string
     recipientCount: number
     uniqueOpens: number
     totalOpens: number
   }[]
   ```
   Ordered by `sentAt` descending.

6. `probes` has the shape:
   ```ts
   { path: string; hits: number; lastSeen: string }[]
   ```
   Top 20 bot paths by `hits` descending. `lastSeen` is an ISO string of
   `MAX(visitedAt)`. The [bot filter](#bot-filter-definition) is the *positive*
   match — the probe query selects only rows that match at least one bot pattern.
   Admin (`/admin%`) and API (`/api%`) paths are excluded from the probe results
   (they are logged but are not probes).

### B. Bot filter definition

7. A single bot-filter expression is defined once in `+page.server.ts` (not
   duplicated per query). It is a Drizzle `or(like(...), ...)` expression built from
   this exact list of `LIKE` patterns applied to `pageviews.path`:
   - `/wp-%`
   - `/blog%`
   - `/.env%`
   - `%.php`
   - `/.git%`
   - `/phpmyadmin%`
   - `/administrator%`
   - `/cgi-bin%`
   - `/feed%`
   - `/xmlrpc%`
   - `/wordpress%`

   Call this expression `isBot`. The complement `not(isBot)` is `isNotBot`.

8. Every query for sections 1–3 (trend, paths, referrers) applies `isNotBot`.
   Admin/API paths are also excluded from sections 1–3 via
   `not(like(pageviews.path, '/admin%'))` and `not(like(pageviews.path, '/api%'))`.
   The probe query (section 5) applies `isBot` as a positive filter (and also
   excludes `/admin%`, `/api%`).

9. Given a DB state containing only rows with paths
   `['/notes/001', '/wp-admin/setup', '/.env', '/notes/002']`:
   - The `trend.days` visit count for that day is 2 (the two `/notes/` paths).
   - `probes` contains both `/wp-admin/setup` and `/.env`.
   - The bot filter is identical in both queries (same pattern list, same Drizzle
     expression); the test asserts `isBot` and `isNotBot` together cover all rows
     (union is the full set, intersection is empty).

### C. MiniBarChart component

10. A new Svelte 5 component exists at `src/lib/ui/MiniBarChart.svelte`. It accepts
    exactly one prop:
    ```ts
    let { data }: { data: { day: string; visits: number }[] } = $props()
    ```

11. The component renders an `<svg>` element with `width="100%"` and a fixed
    `height` attribute (value between 40 and 56, implementer's choice). The SVG
    uses `preserveAspectRatio="none"` or an equivalent technique so it scales
    horizontally with the container.

12. For each element in `data`, the component renders a `<rect>` element. The
    `width` of each rect is `(100 / data.length)%` of the SVG viewport (bars fill
    the full width with no gaps, or a 1-unit gap — implementer's choice). The
    `height` of each rect is proportional to `visits / maxVisits` where `maxVisits`
    is the maximum `visits` value in `data`. A day with `visits: 0` renders a rect
    with height 0 (or 1px minimum — implementer's choice for visual clarity).

13. Rect fill uses `var(--amber)`. A background rect covering the full SVG area
    uses `var(--rule)` as fill (rendered behind the bars). No axis labels, no tick
    marks, no tooltip. No external library used — the component is self-contained
    SVG.

14. When `data` is an empty array, the component renders the `<svg>` element with
    no `<rect>` children (no crash, no JS error).

15. `MiniBarChart.svelte` uses Svelte 5 runes syntax (`$props()`, no `export let`).
    `pnpm check` passes with the component in place.

### D. Page renders all five sections

16. `+page.svelte` renders five `<section>` elements in this order, each preceded
    by a `<div class="section-label">` (or equivalent) showing the label in
    `var(--mono)` / `var(--ink-faint)` styling consistent with the existing page:
    1. `// TREND — LAST 30 DAYS`
    2. `// TOP PATHS`
    3. `// REFERRERS`
    4. `// OPENS PER BROADCAST`
    5. `// PROBE TRAFFIC`

17. **Section 1 — TREND**: renders the `MiniBarChart` component, passing
    `data={data.trend.days}`. Above or alongside the chart, renders two figures:
    total visits (`data.trend.totalVisits`) and unique visitors
    (`data.trend.uniqueVisitors`), each labelled. The unique visitors figure is
    labelled `VISITORS` (or similar); the total is labelled `VISITS` (or similar).
    Both figures use `var(--amber)` for the number and `var(--ink-faint)` for the
    label, consistent with the monospace aesthetic.

18. **Section 2 — TOP PATHS**: for each segment group in `data.paths`, renders a
    **section header row** showing the segment label and `totalVisits`. Below each
    header, renders one **child row** per path showing `path`, `visits`, and
    `fmtDate(lastSeen)`. Child rows are visually indented relative to the header
    row (CSS `padding-left: 24px` or equivalent). Section header rows are visually
    distinct from child rows (e.g. amber colour for the segment label, or a
    different font weight — implementer's choice, must be distinguishable).

19. **Section 2 empty state**: when `data.paths` is an empty array, renders
    `// NO PAGEVIEWS RECORDED` in the same `.empty` style.

20. **Section 3 — REFERRERS**: for each row in `data.referrers`, renders the
    `referrer` string, `count`, and a CSS proportion bar. The proportion bar is a
    `<div>` with `style="--pct: {row.pct}"` and a child `<div>` (or
    `::after` pseudo-element) whose CSS `width` is `calc(var(--pct) * 100%)`. No
    SVG used for the bar. Amber fill.

21. **Section 3 empty state**: when `data.referrers` is an empty array, renders
    `// NO REFERRERS RECORDED`.

22. **Section 4 — OPENS PER BROADCAST**: unchanged from B1. Renders the same
    columns as today: `slug`, `fmtDate(sentAt)`, unique-opens / recipient-count,
    total-opens. Empty state `// NO BROADCASTS SENT YET` unchanged.

23. **Section 5 — PROBE TRAFFIC**: for each row in `data.probes`, renders `path`,
    `hits`, and `fmtDate(lastSeen)`. Empty state `// NO PROBE TRAFFIC`.

24. The page imports `MiniBarChart` from `$lib/ui/MiniBarChart.svelte`. It does not
    import any external charting library.

25. `+page.svelte` follows the existing admin styling contract: `PageHero` with
    `eyebrow="// ADMIN · ANALYTICS"` and `heading="Analytics."`. Scoped `<style>`
    block uses CSS variable tokens only (`var(--mono)`, `var(--amber)`,
    `var(--ink-faint)`, `var(--rule)`, etc.). No Tailwind, no inline `style`
    attributes except for the `--pct` custom property on referrer proportion bars.

### E. Unit tests

26. The existing test file
    `src/routes/(private)/admin/analytics/page.server.test.ts` (co-located,
    matching the architecture convention — no `+` prefix) continues to pass
    without modification, or is updated to reflect the new load function shape
    while retaining coverage of the opens logic from B1.

27. The test file covers the new load function's five return keys. At minimum, tests
    assert:
    - **Trend gap-fill**: given DB returns rows for only 2 of the 30 days, the
      returned `trend.days` array has length 30, the 2 days with data have the
      correct `visits` values, and the remaining 28 days have `visits: 0`.
    - **Unique visitor count**: `trend.uniqueVisitors` equals
      `COUNT(DISTINCT visitorHash)` from the mock — specifically, given mock rows
      where 3 distinct `visitorHash` values appear across 5 rows (one `visitorHash`
      is null), `uniqueVisitors` is 3.
    - **Path grouping**: given paths `['/notes/001', '/notes/002', '/']`, the
      `paths` array contains a group with `segment: '/notes'` (2 child paths, sum
      totalVisits correct) and a group with `segment: '/'` (1 child path).
    - **Bot filter exclusion**: given rows mixing clean paths and bot-pattern paths,
      the trend/paths/referrers sections do not contain bot paths; the probes
      section contains only bot paths.
    - **Referrer pct**: given two referrers with counts 8 and 2, the first has
      `pct: 0.8` and the second `pct: 0.2`.
    - **Opens unchanged**: the opens logic from B1 continues to work — a broadcast
      with no matching opens rows has `uniqueOpens: 0`, `totalOpens: 0`.

28. `MiniBarChart.svelte` has a co-located unit test
    `src/lib/ui/MiniBarChart.test.ts` (or `.test.svelte.ts`) that covers:
    - Renders an `<svg>` element.
    - Renders exactly N `<rect>` children when passed N data points (excluding the
      background rect — test asserts at least N rects where N > 0).
    - Renders without error when passed an empty array.

### F. No regressions

29. `pnpm check` passes — no new TypeScript errors.
30. `pnpm lint` passes — Prettier + ESLint.
31. `pnpm test` passes — all existing tests continue to pass.
32. No new npm dependencies added. The `MiniBarChart` component is hand-rolled SVG;
    no charting library is installed.
33. `prerender = false` remains set in `+page.server.ts`.

---

## Out of scope

- **Per-path sparklines.** The B11 research mentions 7-day sparklines per path row
  in section 2. This spec deliberately omits them to keep query complexity bounded.
  The `MiniBarChart` component established here can be reused in a follow-up item.
- **Country / city / device / OS / browser breakdowns.** The B12 columns are
  captured, but surfacing them as dashboard sections is a separate item.
- **Collapsible path groups.** Section 2 is always-expanded. No JavaScript toggle
  state needed.
- **CSV / JSON export.** Not needed for a single-operator admin.
- **Real-time / auto-refresh.** Page reload is sufficient.
- **Pagination.** All queries are capped (30 days, top 50 paths, top 20 referrers,
  top 20 probes).
- **Redirect automation for probe paths.** Show the data; let Dexter decide manually.
- **Per-email open drilldown.** Not in scope (also excluded from B1).
- **Hour-of-day heatmap.** Not actionable for a low-traffic content site.
- **`@dxlbnl/ui` migration of other admin pages.** This item does not touch
  `/admin/orders/` or `/admin/mailings/`.
- **`/(private)/admin/+layout.svelte` nav change.** The `ANALYTICS` nav entry was
  added by B1. No nav changes needed here.

---

## Open questions

1. **Gap-fill calendar anchor.** The 30-day window should be "today minus 29 days
   through today inclusive". The gap-fill loop should use the server's clock at
   load time. No blocking issue — implementer picks UTC as the day boundary (the
   DB `visitedAt` is stored with timezone).

2. **First-segment logic for nested paths.** The spec defines `/` as paths that are
   exactly `'/'`, and all others use the first segment. A path like `/notes` (no
   trailing slug) falls into the `/notes` group. This is unambiguous for the current
   site's URL shape, but if an unusual path like `/notes/` (trailing slash) appears
   it should be treated as `/notes`. Implementer should normalise by trimming
   trailing slashes before extracting the first segment.

3. **`visitorHash` null handling.** `COUNT(DISTINCT visitorHash)` in PostgreSQL
   ignores NULL values by default, so rows where `visitorHash IS NULL` are excluded
   from the unique count automatically. The spec relies on this SQL behaviour.
   No code change needed, but the test mock must include at least one null row to
   verify the count is not inflated.

None of the above are blocking. The item does not need to be flagged `review`.
