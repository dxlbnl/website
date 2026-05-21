# Research: Analytics Dashboard Best Practices

> For backlog item B11. Informs the redesign of `/admin/analytics/`.
> Schema available: `pageviews(id, path, referrer, visitedAt)` — no UA, no IP, no session.
> Stack: SvelteKit 2 + Svelte 5, no charting library yet, terminal/monospace admin aesthetic.

---

## 1. Key findings per question

### Q1: Is a time-series trend line more useful than raw counts?

**Yes, for a personal site — but only when the window is long enough to show shape.**

Raw counts tell you the total; trend shape tells you whether you're growing, decaying, or spiked. For a personal maker site the signal is almost always "did a post go viral on Reddit?" or "is this project still being discovered months later?" — both are shape questions, not total-count questions. A bar chart of daily visits for the last 30 days answers both at a glance. A single count (`1,342 views`) answers neither.

The UX literature is consistent: sparklines (inline mini line charts) are ideal for compact at-a-glance trend reading next to a metric value. A sparkline alongside a path-count row says "the 340 views on `/notes/003-conduit-pdx1` came mostly in one burst three weeks ago" without requiring a drill-down page. For the main trend overview, a daily bar chart (30-day window, one column per day) beats a line chart because visits are discrete counts, not continuous measurements — column charts communicate discreteness without distortion.

**Recommendation:** Replace the raw `visits` column with a 30-day bar chart (or sparkline) as the primary trend signal. Keep a total count as a secondary figure.

---

### Q2: How should the tiered URL hierarchy be presented?

The current flat list (all paths sorted by total visit count) loses the section-level picture. Google Analytics' Content Grouping approach is the industry pattern: aggregate first by section, drill into individual slugs on demand.

For this site's two-tier structure (`/notes` → `/notes/[slug]`) the right presentation is a **two-level grouped view**:

- **Level 1 (sections):** `/`, `/notes`, `/catalogue`, `/projects` with their summed totals and a trend spark. This is the default view — instantly answers "which section is getting traffic?"
- **Level 2 (slugs):** each section expands to show its child paths with individual counts and trend sparks. This answers "which specific note is popular?"

A collapsible tree (click to expand) is the natural UI, but it adds JS state and is harder to scan in a table. A simpler and equally effective approach for an admin panel is a **grouped flat list**: section headers rendered as distinct rows (amber/highlighted) with child rows indented below, always visible. No toggling, no state — just visual hierarchy via typography and indentation. Since this is private admin-only, there is no performance concern about rendering 50 rows.

**Recommendation:** Group by first path segment. Section-summary rows with total + trend sparkline. Child rows indented below with individual count + sparkline. Always-expanded (no collapsing needed).

---

### Q3: What to do with bot / 404 probe traffic?

The options are:
1. Filter silently — clean data, but information is lost
2. Show in a separate noise section — transparent, useful for security awareness
3. Surface as redirect candidates — highest signal, but requires intent scoring

The current server load already silently filters `/admin` and `/api`. The missing piece is WordPress/bot probes (`/wp-admin`, `/blog`, `/wordpress`, `/.env`, etc.).

**What the research says:** Bot 404s carry no value for content analytics — they distort path counts and make section totals meaningless. However, showing them in a dedicated collapsible "noise" section is useful for two reasons: (a) you can spot attack patterns (a new probe path appearing 500 times overnight), and (b) some probes like `/blog` or `/feed` indicate someone expects that URL to exist, which is a weak redirect signal.

Redirect candidacy should not be automatic — it requires the operator's judgment. The right pattern (from Botify/GA4 best practice) is: **filter bots silently from the main content view, but show aggregated noise stats in a separate section with a threshold** (e.g. only show paths that hit more than 10 times, to suppress one-off probes).

**Bot detection heuristic for this schema (no UA available):** Paths that contain `/wp-admin`, `/wp-login`, `/xmlrpc`, `/.env`, `/blog`, `/wordpress`, `/feed`, `/.git`, `/phpmyadmin`, `/administrator`, `/cgi-bin`, or any path ending in `.php` on a SvelteKit site. This is a static blocklist applied in the query `WHERE path NOT LIKE...` for the main view; the noise section runs the inverse query.

**Recommendation:**
- Main path view: filter out known bot-probe patterns at query time. Show only paths matching the site's actual URL space.
- Noise section (below the fold): show the top bot probes by count, last-seen date. Label it `// PROBE TRAFFIC`. No redirect automation — just visibility. If a path there looks like a legitimate 404 (e.g. `/blog` appearing from a real referrer), Dexter can manually decide to add a redirect.

---

### Q4: With only path + referrer + timestamp, what's actually worth showing?

The three fields support these signals, ranked by usefulness for a personal site:

| Signal | How derived | Usefulness |
|---|---|---|
| Daily/weekly visit trend per section | `COUNT(*) GROUP BY date_trunc('day', visitedAt)` | High — shows growth, spikes, decay |
| Top paths by visit count + trend | `COUNT(*) GROUP BY path` + per-path time series | High — content performance |
| Top referrers | `COUNT(*) GROUP BY referrer` (filtered, not null) | High — traffic source attribution |
| Section-level totals | First-segment grouping | High — which area is active |
| Last-seen date per path | `MAX(visitedAt) GROUP BY path` | Medium — is this content still getting hits? |
| Direct vs referred split | `referrer IS NULL` vs `referrer IS NOT NULL` | Medium — simple two-bucket |
| External referrers (off-site) | `referrer NOT LIKE '%dexterlabs.nl%'` | Medium — inbound link quality |
| Referrer-per-path drilldown | Filter by path, group referrer | Medium — where does this note's traffic come from? |
| Bot/probe traffic volume | Path blocklist inverse | Low but useful for security awareness |
| Hour-of-day distribution | `EXTRACT(hour FROM visitedAt)` | Low — not actionable for a static content site |
| Bounce / exit path (next page) | Not possible without session ID | Not buildable |
| Unique visitors | Not possible without IP or session | Not buildable |
| Geographic distribution | Not possible without IP | Not buildable |
| Device type | Not possible without UA | Not buildable |

**Do not try to infer sessions, users, or geography.** The data cannot support it. Any attempt (e.g. using timestamp proximity to group "sessions") would be statistically misleading.

---

### Q5: What lightweight charting approach fits the terminal/monospace aesthetic?

Three options evaluated:

**Option A: CSS-only bar chart (no library)**
Pure CSS horizontal bars using `width: calc(var(--pct) * 100%)` on a `<div>` with a monochrome fill. Works inline in a table row. Zero bundle impact. Limitation: no time-series trend — only magnitude comparison. Can be done with a `style` attribute on the bar element.

**Option B: Hand-rolled inline SVG sparkline**
A `<polyline>` with points computed from the data array in a Svelte component. 15-30 lines of Svelte, zero npm dependencies. Full control over color, stroke, size. Fits naturally in the terminal aesthetic (fine amber line on dark background). The `fnando/sparkline` approach (as documented at [alexplescan.com](https://alexplescan.com/posts/2023/07/08/easy-svg-sparklines/)) shows this can be a tiny function: normalize values to a viewport, map to polyline points string. Works server-side too.

**Option C: `sparkline-svelte` npm package**
A ready-made Svelte 5 sparkline component built specifically for dashboards, based on the fnando/sparkline algorithm, with reactive data updates. Install: `pnpm add sparkline-svelte`. The package appears to be lightweight (SVG-based, no D3 dependency) and Svelte 5 runes-compatible. Still an npm dependency with maintenance risk; overkill if the hand-rolled path is only 20 lines.

**Option D: LayerChart**
Full composable charting framework for Svelte. Powerful, but requires `d3-scale` as a peer dependency and is substantially larger. Install: `pnpm add layerchart d3-scale`. Overkill for sparklines and status counts. Worth it only if bar/area charts are needed.

---

## 2. Recommended display structure

The redesigned `/admin/analytics/` page should have these sections, in this order:

### Section 1: `// TREND — LAST 30 DAYS`
A 30-day daily bar chart. One bar per day, height proportional to visit count. Rendered as an inline SVG (or CSS bar chart). Shows the full picture at a glance — growth, plateaus, Reddit spikes. No axis clutter; just the bars and a faint grid line at the max.

**Query:** `SELECT date_trunc('day', visitedAt) AS day, COUNT(*) AS visits FROM pageviews WHERE visitedAt > now() - interval '30 days' AND [bot filter] GROUP BY day ORDER BY day`

### Section 2: `// TOP PATHS`
Grouped by first URL segment. Section rows (amber, slightly larger) show segment totals. Child rows (indented) show individual slugs. Each row has: path, visit count, a tiny 7-day sparkline (hand-rolled SVG), last-seen date.

**Query per path:** `SELECT path, COUNT(*) AS visits, MAX(visitedAt) AS lastSeen FROM pageviews WHERE [bot filter] GROUP BY path ORDER BY visits DESC`
**Sparkline data per path (top N paths only):** per-path 7-day bucketed counts.

### Section 3: `// REFERRERS`
Top 20 referrers by count. Null referrer rendered as `(direct)`. External referrers only (filter out self-referrals `dexterlabs.nl`). Each row: referrer domain, count, percentage of total referred traffic. A CSS width bar visualizes the proportion.

**Query:** `SELECT referrer, COUNT(*) AS visits FROM pageviews WHERE referrer IS NOT NULL AND referrer NOT LIKE '%dexterlabs.nl%' AND [bot filter] GROUP BY referrer ORDER BY visits DESC LIMIT 20`

### Section 4: `// OPENS PER BROADCAST`
Unchanged from the B1 implementation — this is already correct and complete.

### Section 5: `// PROBE TRAFFIC` (collapsible or below fold)
Top bot probes by count. Shown so Dexter can see attack patterns or spot legitimate 404 candidates. Each row: path, count, last-seen. No trend chart needed here.

**Query:** `SELECT path, COUNT(*) AS hits, MAX(visitedAt) AS lastSeen FROM pageviews WHERE [bot pattern match] GROUP BY path ORDER BY hits DESC LIMIT 20`

---

## 3. Charting recommendation

**Use hand-rolled inline SVG sparklines. No library.**

Rationale:
- The terminal aesthetic already uses `<StatusBar>` with oscilloscope SVG animations — custom SVG is established in the codebase.
- Two chart shapes are needed: a 30-day bar chart (Section 1) and per-path 7-day sparklines (Section 2). Both are trivially constructable from SVG `<rect>` and `<polyline>` with normalized data.
- A sparkline component is ~25 lines of Svelte. A 30-day bar chart is ~35 lines. Total: one small `src/lib/ui/Sparkline.svelte` and one `src/lib/ui/BarChart.svelte`, or a single polymorphic `MiniChart.svelte`.
- Zero new npm dependencies. No bundle size impact. No maintenance risk. Full control over colors (amber on dark, matching existing CSS variables).
- The `sparkline-svelte` package is Svelte 5 compatible but adds a dependency for what is essentially a `<polyline points="...">`. If the hand-rolled approach takes more than 1 hour, fall back to `pnpm add sparkline-svelte` — it's a clean package with no transitive dependencies.

**If a library is needed anyway:** `pnpm add sparkline-svelte`. It is Svelte 5 native, SVG-based, no D3, reactive. Avoid LayerChart for this use case — it's more than needed.

**CSS bar chart for referrers (Section 3):** Use the CSS custom property width technique (`style="--pct: {pct}"`, `width: calc(var(--pct) * 100%)`) for the referrer proportion bars. No SVG needed — pure CSS, inline on the row.

---

## 4. Bot / 404 handling

**Concrete implementation:**

Define a bot-path filter as a Drizzle `or(like(...))` expression used in all main queries:

```ts
// src/routes/(private)/admin/analytics/+page.server.ts
const BOT_PATTERNS = [
  '/wp-admin%', '/wp-login%', '/xmlrpc%', '/.env%', '/blog%',
  '/wordpress%', '/feed%', '/.git%', '/phpmyadmin%',
  '/administrator%', '/cgi-bin%', '%/.well-known/traffic-advice%',
  '%.php', '%/robots.txt'  // robots.txt is fine but skip from content view
]
const isBot = or(...BOT_PATTERNS.map(p => like(pageviews.path, p)))
const isNotBot = not(isBot)
```

- **Main views (Sections 1–3):** add `AND isNotBot` to every query.
- **Probe section (Section 5):** run a separate query with `WHERE isBot` for the top 20 probe paths.
- **Do not build redirect automation.** Show the probe table; let Dexter decide manually whether `/blog` warrants a 301.

---

## 5. What to drop

These are not worth building given the minimal schema:

- **Unique visitor count** — not computable without IP or session ID. Displaying raw pageview count as "visitors" would be misleading. Drop it.
- **Bounce rate / session depth** — requires session grouping. Not possible.
- **Geographic map / country breakdown** — no IP. Drop it.
- **Device/browser breakdown** — no UA. Drop it.
- **Hour-of-day heatmap** — for a personal content site, time-of-day is not actionable. Drop it.
- **Conversion funnel** — no e-commerce events tracked in pageviews. Stripe orders are a separate table; connecting them to pageviews is not possible without session linkage.
- **Real-time view** — the admin panel reloads on demand. A live counter would require SSE/WebSocket and adds complexity for no clear gain on a low-traffic personal site.
- **Redirect automation** — deciding whether `/blog` should 301 to `/notes` is a one-time judgment call, not a dashboard feature. Show probe data; let Dexter decide.
- **Per-email drilldown** — already excluded from B1 scope. Keep it out of scope here too.
- **CSV export** — overkill for a solo operator. The DB is directly accessible via `pnpm db:studio`.
- **Pagination** — cap queries at 30 days / top-50 paths / top-20 referrers. That fits one scroll. Pagination adds complexity with no clear win on a site of this scale.

---

## Summary recommendation

The redesigned page should show four actionable views in this order: (1) 30-day daily bar chart trend, (2) top paths grouped by section with 7-day sparklines, (3) top referrers with CSS proportion bars, (4) email opens table (unchanged). Below the fold: probe traffic table for noise visibility.

Use hand-rolled SVG sparklines and a CSS bar chart for referrers — no npm charting library required. Define a bot-path blocklist at the query layer to keep the content views clean; expose probe data explicitly in a clearly-labelled section rather than silently dropping it.

The current flat count-per-path table (implemented in B1) should be replaced, not extended — it lacks time dimension and section grouping, which are the two things that make the data actionable.
