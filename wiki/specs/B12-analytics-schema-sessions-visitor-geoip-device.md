# B12: Analytics schema — sessions, visitor hash, geoIP, device tracking

## Context

The `pageviews` table (defined in `src/lib/server/db/schema.ts`) currently records only `path`, `referrer`, and `visited_at`. This is enough to count raw hits, but not enough to answer questions like "how many unique visitors did I have this week?" or "what share of readers are on mobile?".

This item extends the table with seven new columns to enable session grouping, daily-rotating unique-visitor counting, geoIP lookups (free, via Vercel request headers), and UA-parsed device/OS/browser classification — all computed server-side in `src/hooks.server.ts`. No client-side JavaScript is added; no cookie consent banner is required.

**Related pages**

- Item card: `wiki/backlog/doing/B12-analytics-schema-sessions-visitor-geoip-device.md`
- DB schema: `src/lib/server/db/schema.ts` (the `pageviews` table)
- Server hook: `src/hooks.server.ts` (the `handle` function that writes pageview rows)
- Architecture: `wiki/architecture.md` (Drizzle + Neon, `pnpm db:push` to sync)
- SvelteKit hooks reference: `wiki/expertise/sveltekit.md`
- Research context: `wiki/research/analytics-dashboard-best-practices.md`

## Acceptance criteria

### 1 — Schema: seven new columns on `pageviews`

The `pageviews` table definition in `src/lib/server/db/schema.ts` must include exactly these additional columns, all typed `text` (nullable unless noted), in addition to the existing columns:

| Column name   | Drizzle definition            | Notes |
|---------------|-------------------------------|-------|
| `sessionId`   | `text('session_id')`          | nullable; raw UUID from `sid` cookie |
| `visitorHash` | `text('visitor_hash')`        | nullable; sha256 hex digest |
| `country`     | `text('country')`             | nullable; two-letter ISO code |
| `city`        | `text('city')`                | nullable |
| `deviceType`  | `text('device_type')`         | nullable; one of `mobile \| tablet \| desktop` |
| `os`          | `text('os')`                  | nullable; see criterion 6 |
| `browser`     | `text('browser')`             | nullable; see criterion 7 |

Running `pnpm db:push` after editing `schema.ts` must succeed (no SQL errors).

### 2 — Session cookie: `sid` set on every HTML response that lacks one

When the hook writes a pageview row for an HTML response (i.e. the `text/html` content-type branch that already exists) and the incoming request does not carry a `sid` cookie:

- A `sid` cookie must be set with value `crypto.randomUUID()`.
- Cookie attributes: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`.
- No `Max-Age` and no `Expires` are set — the cookie is browser-session-scoped.
- **SvelteKit constraint**: `event.cookies.set()` must be called *before* `resolve(event)`, not after. The content-type check for whether to write a DB row can still happen after `resolve()` — only the cookie set must precede it.

When the incoming request already has a `sid` cookie, no new cookie is set and the existing value is used unchanged.

### 3 — `sessionId` column populated from `sid` cookie

The `sessionId` value written to the DB is the raw UUID read from (or freshly assigned as) the `sid` cookie. If for any reason the cookie value is absent, the column is `null`.

### 4 — `visitorHash` computed server-side with daily rotation

`visitorHash` must be computed as the hex-encoded SHA-256 digest of the concatenated string:

```
<IP address> + <User-Agent header> + <YYYY-MM-DD date in UTC> + <salt>
```

- IP address: `event.getClientAddress()`.
- User-Agent: `event.request.headers.get('user-agent') ?? ''`.
- Date: today's date in UTC formatted as `YYYY-MM-DD` (e.g. `2026-05-21`).
- Salt: value of the `VISITOR_HASH_SALT` env var (`$env/static/private`). If the env var is absent or empty, fall back to the constant string `'dxlb-default-salt'`. The fallback must not throw; it only weakens uniqueness slightly.
- The hash is computed using the Web Crypto API (`crypto.subtle.digest`), which is available in the Vercel Node 20 runtime.
- The result stored in the DB is the lowercase hex string (64 characters).

Two pageviews from the same IP + UA on the same UTC day must produce the same `visitorHash`. Two pageviews from the same IP + UA on different UTC days must produce different hashes.

### 5 — `country` and `city` populated from Vercel headers

- `country`: value of the `x-vercel-ip-country` request header, stored as-is. `null` if the header is absent (e.g. in local dev).
- `city`: value of the `x-vercel-ip-city` request header, stored as-is. `null` if absent.

No transformation or validation is applied to these values.

### 6 — `deviceType` and `os` derived from User-Agent

UA classification is done with plain regex — no third-party library. Rules, applied in order:

**`deviceType`** (`'mobile' | 'tablet' | 'desktop'`):

1. If UA matches `/tablet|ipad/i` → `'tablet'`
2. Else if UA matches `/mobile|android|iphone|ipod/i` → `'mobile'`
3. Else → `'desktop'`

If the User-Agent header is absent, store `null`.

**`os`** (`'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other'`):

1. `/iphone|ipad|ipod/i` → `'iOS'`
2. `/android/i` → `'Android'`
3. `/windows/i` → `'Windows'`
4. `/macintosh|mac os x/i` → `'macOS'`
5. `/linux/i` → `'Linux'`
6. Otherwise → `'Other'`

If the User-Agent header is absent, store `null`.

### 7 — `browser` derived from User-Agent

**`browser`** (`'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other'`):

Rules applied in this exact order (order is load-bearing because Chrome's UA contains "Safari" and Edge's UA contains "Chrome"):

1. `/edg\//i` → `'Edge'` (matches `Edg/` in modern Edge UA strings)
2. `/firefox\//i` → `'Firefox'`
3. `/chrome\//i` → `'Chrome'`
4. `/safari\//i` → `'Safari'`
5. Otherwise → `'Other'`

If the User-Agent header is absent, store `null`.

### 8 — All seven columns populated on every pageview write

The `db.insert(pageviews).values(...)` call in `hooks.server.ts` must include all seven new columns on every invocation of the HTML-response branch. None of the new columns may be omitted from the insert; they should be `null` only when the source data is genuinely unavailable (no UA header, no Vercel geo headers, cookie value absent).

### 9 — `pnpm check` passes with no TypeScript errors

After the schema and hook changes, `pnpm check` (which runs `svelte-check`) must exit with zero errors. The Drizzle-inferred insert type for `pageviews` must accept the new nullable columns without casts.

### 10 — Existing analytics test suite continues to pass

`src/routes/(private)/admin/analytics/page.server.test.ts` must pass unchanged. That test mocks `$lib/server/db` entirely; the new schema columns do not affect it. No modifications to that test file are permitted as part of this item.

### 11 — New columns do not appear in non-HTML requests

The pageview write only fires in the existing branch that guards on `content-type: text/html` and non-`/api/` paths. This guard must remain in place; API and asset responses must not trigger pageview writes and must not attempt to set the `sid` cookie.

## Out of scope

- **Analytics UI changes** — displaying the new columns (charts, device breakdown, country map) is a follow-on item. B12 is schema + data capture only.
- **Bot filtering** — filtering crawlers and headless browsers from writes is addressed in the B11 research; it is not required here.
- **Session expiry or invalidation server-side** — `sessionId` is opaque; no session table or TTL is needed. When the browser closes and reopens, a new UUID is generated automatically.
- **Visitor hash de-anonymisation** — the hash is a privacy primitive. No reversal, lookup, or IP storage is required or permitted.
- **UA library integration** — a third-party UA parsing library (e.g. `ua-parser-js`) is explicitly out of scope; regex is sufficient and adds no dependency.
- **`drizzle-kit generate` migration files** — the project uses `pnpm db:push` (schema push directly to Neon), not migration file generation. No `drizzle/migrations/` files are produced.
- **`VISITOR_HASH_SALT` key rotation procedure** — key rotation causes the hash to change for all visitors (intentional: it's a privacy feature). No rotation tooling is required here.

## Open questions

1. **`$env/static/private` vs `$env/dynamic/private` for `VISITOR_HASH_SALT`**: `$env/static/private` values are inlined at build time on Vercel. If the salt ever needs to rotate without a redeploy, `$env/dynamic/private` would be required. The current design uses static. This is a deliberate trade-off (see Out of scope above) but should be confirmed before implementation so the implementer imports from the correct module. **Not blocking** — static is the correct choice given existing project conventions, but noting it for the decision log.

2. **`crypto.randomUUID()` availability in hooks context**: the Web Crypto `crypto` global is available in Node 20 (this project's runtime). In Vitest, `crypto` is also available via the `node:crypto` polyfill. If a test for the hook itself is written, the test environment must expose `crypto.randomUUID`. **Not blocking** — the test-writer should verify the Vitest config exposes `crypto` (or import from `node:crypto` if needed).

3. **SHA-256 via `crypto.subtle.digest` is async**: the `handle` hook's pageview write is already fire-and-forget (`.catch(() => {})`). Computing the hash requires one `await` before the insert. This means the hash computation happens inline in the async hook body before the fire-and-forget insert, which is fine. **Not blocking** — calling this out so the implementer does not accidentally move the hash computation inside the `.catch` chain.
