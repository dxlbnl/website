# B1: Email & page-view tracking

## Context

The database already collects two signals:

- `emailOpens` rows are written by `src/routes/api/resend-webhook/+server.ts` when
  Resend fires an `email.opened` event. Each row carries `resendEmailId`,
  `broadcastId` (nullable), `recipientEmail` (nullable), `openedAt`.
- `pageviews` rows are written by `src/hooks.server.ts:33` for any non-API HTML
  response. Each row carries `path`, `referrer` (nullable, normalised to
  `origin + pathname` of the `Referer` header), `visitedAt`.

What's missing is a way to actually look at this data. Today the admin panel
([`/admin/orders/`](../../src/routes/(private)/admin/orders/+page.svelte),
[`/admin/mailings/`](../../src/routes/(private)/admin/mailings/+page.svelte))
surfaces orders and mailings but no analytics view. The mailings list does show a
per-broadcast open count, but there is no pageview log at all and no single page
that lets the operator see "what's happening on the site".

This item adds a lightweight analytics view inside `/(private)/admin/` with two
tables: open counts per mailing broadcast, and a recent pageview log.

Related wiki / source:

- Item card: [`wiki/backlog/doing/B1-email-pageview-tracking.md`](../backlog/doing/B1-email-pageview-tracking.md)
- Requirements: [R12](../requirements.md#admin) (`/admin/` exists, password-protected),
  [R14](../requirements.md#admin) (email opens stored via Resend webhook).
- DB schema: [`src/lib/server/db/schema.ts`](../../src/lib/server/db/schema.ts) —
  `emailOpens`, `mailingBroadcasts`, `pageviews`.
- Feature page: [`wiki/features/mailings.md`](../features/mailings.md) — what an
  `emailOpens` row means in context.
- Admin layout: [`src/routes/(private)/admin/+layout.svelte`](../../src/routes/(private)/admin/+layout.svelte)
  and [`+layout.server.ts`](../../src/routes/(private)/admin/+layout.server.ts) —
  pattern for new admin routes; auth via `verifyAdminSession` (Section A).
- Date formatter: [`src/lib/utils/fmt.ts`](../../src/lib/utils/fmt.ts) —
  `fmtDate`, `fmtDateTime`.
- Component-library scope: [`wiki/specs/B3-component-library-integration.md`](./B3-component-library-integration.md)
  "Out of plan" — `/(private)/admin/*` is **deferred** from the `@dxlbnl/ui`
  migration, so B1's new admin pages follow the existing admin styling.

## Decisions baked into this spec

1. **Route shape**: one page, `/(private)/admin/analytics/`, with both tables on
   it. Two tables, no charts. Rationale: the admin layout's nav
   ([`+layout.svelte`](../../src/routes/(private)/admin/+layout.svelte)) is a flat
   list of top-level items (`ORDERS`, `MAILINGS`); a single `ANALYTICS` entry
   matches that pattern and avoids deeper navigation for two small tables. Both
   datasets are read in one server load, both rendered on one page. Splitting
   into `/admin/analytics/opens/` and `/admin/analytics/pageviews/` would double
   the auth round-trips for what is two `SELECT` statements.
2. **Opens-count formula**: per broadcast, **unique opens** =
   `COUNT(DISTINCT recipientEmail) FILTER (WHERE recipientEmail IS NOT NULL)`
   plus a **total-opens** raw `COUNT(*)`. The table displays unique opens as the
   primary figure (`14 / 122 OPENED`) and total opens as a secondary mono-text
   column (`17 TOTAL`). Rationale: a single recipient can open repeatedly, and
   Resend can fire multiple `email.opened` events per delivery; unique opens are
   the figure that matches what an operator means when they say "open rate".
   Showing total alongside lets the operator spot weirdly high re-open ratios
   (bots, image pre-fetchers, the operator's own previews). The
   `recipientEmail IS NOT NULL` filter is the documented fallback: rows with a
   null recipient are counted in total but not in unique.
3. **Pageview log cap**: `LIMIT 100`, ordered by `visitedAt DESC`. Rationale: an
   admin's-eye view of the last day or so of traffic is the use case; 100 rows
   fits one scroll and keeps the query cheap. Pagination is not in scope. If the
   cap proves wrong, file a follow-up; do not add a query param.
4. **Time formatting**: `fmtDate` from `src/lib/utils/fmt.ts` for the opens table's
   `sentAt` (date only is enough — broadcasts go out at most once a day) and
   `fmtDateTime` for the pageview log's `visitedAt` (time-of-day matters for
   spotting bursts). Both are already used by sibling admin pages.
5. **Test strategy**: pure-function unit tests of the load function with a mocked
   Drizzle client. No real Neon connection in tests. The load function is
   extracted (or shaped) so it accepts a database client and returns a typed
   payload, so the test can pass in a fake. See criterion 13. This sets the
   pattern for future admin tests, of which there are none today.

## Acceptance criteria

> Each criterion is mechanically checkable by `test-writer`. Where a criterion
> targets a query shape, the named Drizzle operators/columns are the contract.

### A. Route exists and is admin-protected

1. A new route exists at `src/routes/(private)/admin/analytics/+page.svelte` with
   a sibling `src/routes/(private)/admin/analytics/+page.server.ts`.
2. `+page.server.ts` exports `prerender = false` (matches sibling admin pages —
   it reads the DB).
3. The route is protected by the existing admin auth: `verifyAdminSession`
   gating in [`(private)/admin/+layout.server.ts`](../../src/routes/(private)/admin/+layout.server.ts)
   already applies to descendants. The new route adds **no** auth code of its
   own and **does not** override the layout. A request to `/admin/analytics/`
   without a valid `admin_session` cookie redirects to `/admin/` (303), the same
   redirect target the layout uses today.
4. `src/routes/(private)/admin/+layout.svelte` has a const `adminItems` array.
   Append `{ label: 'ANALYTICS', href: '/admin/analytics' }` to it, after the
   `MAILINGS` entry (nav order: `ORDERS · MAILINGS · ANALYTICS`). No other
   change to the layout.

### B. Opens table: query and shape

5. The `+page.server.ts` load function produces an `opens` array, one entry per
   `mailingBroadcasts` row that has at least one corresponding `emailOpens` row
   **and** for every `mailingBroadcasts` row with zero opens (so broadcasts with
   no opens still appear with zeros — silence is information). Each entry has
   the shape:

   ```ts
   {
     slug: string;            // mailingBroadcasts.slug
     broadcastId: string;     // mailingBroadcasts.broadcastId
     sentAt: string;          // ISO string of mailingBroadcasts.sentAt
     recipientCount: number;  // mailingBroadcasts.recipientCount
     uniqueOpens: number;     // COUNT(DISTINCT recipientEmail) WHERE recipientEmail IS NOT NULL
     totalOpens: number;      // COUNT(*) of emailOpens with this broadcastId
   }
   ```

6. The opens are derived from **at most two** Drizzle queries:
   - `db.select().from(mailingBroadcasts)` to read every broadcast row.
   - One aggregate query against `emailOpens` grouped by `broadcastId`, returning
     `{ broadcastId, totalOpens: count(), uniqueOpens: countDistinct(emailOpens.recipientEmail) }`.
     `countDistinct` is `drizzle-orm`'s `countDistinct` helper; if for any
     reason it is not available, the equivalent is
     `sql<number>\`count(distinct ${emailOpens.recipientEmail})\``. Rows whose
     `broadcastId` is `NULL` are excluded from the grouping (they cannot be
     attributed to a broadcast).
7. The `opens` array is sorted by `sentAt` **descending** (newest broadcast
   first), matching the convention used on `/admin/mailings/`.
8. A broadcast with zero matching `emailOpens` rows has `uniqueOpens: 0` and
   `totalOpens: 0` in the payload (i.e. the join is a left-join in spirit — the
   broadcast survives, the count is zero).

### C. Pageview log: query and shape

9. The `+page.server.ts` load function produces a `pageviews` array with at most
   **100** entries, ordered by `visitedAt` descending, with shape:

   ```ts
   {
     id: number;
     path: string;
     referrer: string | null;
     visitedAt: string; // ISO string
   }
   ```

10. The query is the literal Drizzle equivalent of
    `SELECT id, path, referrer, visited_at FROM pageviews ORDER BY visited_at DESC LIMIT 100`
    — i.e. `db.select(...).from(pageviews).orderBy(desc(pageviews.visitedAt)).limit(100)`.
    `desc` and `pageviews` come from the same imports used by
    `/admin/orders/+page.server.ts`.

### D. Page renders both tables with the existing admin styling

11. `src/routes/(private)/admin/analytics/+page.svelte` follows the same
    structure as `/admin/orders/+page.svelte` and `/admin/mailings/+page.svelte`:
    - `import { PageHero } from '@dxlbnl/ui'` — `PageHero` props are
      `eyebrow="// ADMIN · ANALYTICS"` and `heading="Analytics."` (the prop is
      `heading`, not `title`).
    - Two `<section>` blocks, each with a `<div class="section-label">` in the
      same monospace style the siblings use:
      - `// OPENS PER BROADCAST` — rows of `data.opens`. Each row shows: slug,
        `fmtDate(sentAt)`, `{uniqueOpens} / {recipientCount} OPENED`,
        `{totalOpens} TOTAL`.
      - `// RECENT PAGEVIEWS` — rows of `data.pageviews`. Each row shows:
        `fmtDateTime(visitedAt)`, `path`, referrer rendered as `—` when null
        (the test asserts the literal string `null` does not appear).
    - Scoped `<style>` block using CSS variable tokens (`var(--mono)`,
      `var(--amber)`, `var(--ink-faint)`, etc.) — same idiom as siblings.
    - No imports from `$lib/ui/*` — that directory no longer contains admin
      components. Use `@dxlbnl/ui` for any library component needed.
12. Empty states:
    - When `data.opens.length === 0`, the opens section renders the text
      `// NO BROADCASTS SENT YET` in the same `.empty` style used by
      `/admin/orders/+page.svelte` (its `// NO RECORDS FOUND` empty state).
    - When `data.pageviews.length === 0`, the pageviews section renders
      `// NO PAGEVIEWS RECORDED`.
    - Both sections render their empty-state element instead of an empty list;
      the heading + section-label remain visible.

### E. Load function is unit-testable with a mocked DB

13. The load function can be exercised in a Vitest test without touching Neon.
    Two acceptable shapes — implementer picks one:
    - **(a)** The load function imports `db` from `$lib/server/db` as today, and
      the test uses `vi.mock('$lib/server/db', ...)` to swap it for a fake
      whose `.select(...).from(...).groupBy(...)` / `.orderBy(...).limit(...)`
      chains return canned arrays.
    - **(b)** The load logic is extracted into a pure function
      `loadAnalytics(db: typeof import('$lib/server/db').db)` exported from
      `+page.server.ts` (or a co-located `analytics.ts` helper), and the
      `load: PageServerLoad` is a one-line wrapper. The test imports
      `loadAnalytics` and passes a fake `db`.

    The test file is `src/routes/(private)/admin/analytics/+page.server.test.ts`
    (Vitest, co-located, matching the convention noted in
    [`wiki/architecture.md`](../architecture.md#test-setup)).

14. The unit test(s) cover at minimum:
    - Opens roll-up: given two `mailingBroadcasts` rows (slugs `A`, `B`, each
      with `recipientCount: 100`) and a synthetic `emailOpens` aggregation
      result for `A` only (`uniqueOpens: 7`, `totalOpens: 10`), the returned
      payload has `opens` of length 2 with the correct numbers, `B`'s counts
      are zero, and the array is ordered by `sentAt` descending.
    - Null `recipientEmail` handling: a fake aggregation result where
      `uniqueOpens < totalOpens` (e.g. because some rows had null recipients)
      passes through verbatim. The load function does **not** alter the
      numbers — the SQL is responsible for the distinct-count semantics. The
      test asserts the load function returns whatever the aggregation returned.
    - Pageviews cap: when the fake DB returns 100 rows in `visitedAt`-desc
      order, the payload contains 100 rows in the same order. The fake's
      `.limit(...)` call is asserted to have been called with `100`.
    - Pageview with `referrer: null` round-trips as `null` in the payload (the
      svelte component is responsible for the empty-state glyph, not the load
      function).

### F. No regressions

15. `pnpm check` passes (no new TypeScript errors).
16. `pnpm lint` passes (Prettier + ESLint).
17. The build succeeds (`pnpm build`) — the new route is server-rendered, not
    prerendered, consistent with sibling admin pages.
18. No new environment variables. No new dependencies.

## Out of scope

- **Charting**. Plain tables only. No Chart.js, no D3, no inline SVG charts.
- **CSV / JSON export.** Operator copy-pastes if they need to. Filing a separate
  item is fine if a real need shows up.
- **Per-email drilldown.** No "click an open to see which recipient opened
  when" view. The data is in `emailOpens` if needed; this spec does not surface
  it.
- **Real-time / live updates.** No WebSocket, no Server-Sent Events, no
  auto-refresh. Reload the page to refresh.
- **Per-path aggregation** of pageviews ("top 10 paths this week"). Useful but
  it's a different shape of query and is its own backlog item.
- **Filtering or pagination** of the pageview log. The cap is the cap.
- **Bot / known-crawler exclusion.** Pageviews are logged as-is by
  `hooks.server.ts`; this spec does not change that behaviour.
- **`@dxlbnl/ui` migration of other admin pages.** Sibling admin pages (`/admin/orders/`, `/admin/mailings/`) have already been migrated to `@dxlbnl/ui`. This item does not touch them further.
- **Backfill or schema changes.** `emailOpens.recipientEmail` and
  `emailOpens.broadcastId` stay nullable. `pageviews` stays as-is.

## Open questions

None blocking. Two non-blocking notes for Dexter to confirm or wave through:

1. **Empty-referrer glyph.** The spec leaves it to the implementer to pick
   between rendering `—` or `(direct)` for a null `referrer`. Either reads
   fine; the test only asserts that the literal string `null` does not appear.
   If Dexter has a preference, mention it on review.
2. **Opens-table secondary column placement.** The spec puts `{totalOpens} TOTAL`
   as a secondary mono column on the same row. If that looks visually noisy
   alongside the primary `{uniqueOpens} / {recipientCount} OPENED` figure, the
   reviewer may ask to move it to a hover/title attribute. That's a styling
   tweak, not a contract change — leaving it inline for now keeps the data
   visible.
