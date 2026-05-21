# B16: Guard against missing VISITOR_HASH_SALT in production

## Context

`src/hooks.server.ts` imports `VISITOR_HASH_SALT` from `$env/static/private` and
uses it to salt the per-day visitor hash computed in `computeVisitorHash`. Because
`$env/static/private` variables are inlined by Vite at build time, the variable can
never be literally `undefined` at runtime — Vite would throw at build time if the env
var was absent entirely.

The real risk is a deployment where the env var is set to the well-known default string
`'dxlb-default-salt'` (the value that was previously used as a fallback literal in the
source). In that situation visitor hashes become deterministic and predictable, defeating
the entire purpose of the rotating salt privacy mechanism.

The current code on line 48 of `src/hooks.server.ts` reads:

```ts
const salt = VISITOR_HASH_SALT || 'dxlb-default-salt';
```

This must be replaced with a runtime check that detects the known-insecure value and
emits a loud warning, while still proceeding with tracking (a hard fail on a
misconfigured salt would be worse than a silent one — it would break visitor tracking
entirely for every page request in a misconfigured environment).

Related pages: [architecture.md](../architecture.md),
[item card](../backlog/doing/B16-visitor-hash-salt-guard.md),
[B12 spec](B12-analytics-schema-sessions-visitor-geoip-device.md).

## Acceptance criteria

1. When `VISITOR_HASH_SALT` equals the exact string `'dxlb-default-salt'`, the handle
   function calls `console.error` with a message that includes the substring
   `'VISITOR_HASH_SALT'` before the pageview insert is attempted. The exact wording of
   the message is not tested, only the presence of `console.error` being called with a
   string containing `'VISITOR_HASH_SALT'`.

2. When `VISITOR_HASH_SALT` equals `'dxlb-default-salt'`, the pageview insert still
   executes — `db.insert(pageviews).values(...)` is called, not skipped. The guard is
   observability-only.

3. When `VISITOR_HASH_SALT` is any value other than `'dxlb-default-salt'` (e.g.
   `'my-real-secret-salt'`), `console.error` is not called.

4. The fallback literal `'dxlb-default-salt'` may remain in the source as a build-time
   compatibility value (since `$env/static/private` requires the var to exist at build
   time). However, the `||` short-circuit that silently uses it at runtime must be
   removed: the constant `VISITOR_HASH_SALT` must be used directly as the salt, with the
   runtime guard checking whether its value equals `'dxlb-default-salt'`.

5. A co-located unit test at
   `src/routes/(private)/admin/analytics/page.server.b16.test.ts` (or another
   co-located path agreed with the test-writer) asserts that `console.error` is called
   when the salt matches the default value. The test must mock `console.error`, invoke
   the handle hook with a synthetic request that passes the HTML-response tracking
   condition, and assert the spy was called.

6. The same test asserts that `console.error` is not called when a non-default salt is
   provided.

## Out of scope

- Throwing a hard startup error or rejecting requests when the salt is insecure — the
  guard is a warning only.
- Rotating the salt on a schedule or deriving it from a secondary secret.
- Any changes to `computeVisitorHash` in `src/lib/server/analytics.ts` — the function
  signature and hashing logic are unchanged.
- Any changes to the analytics DB schema or the dashboard.
- Alerting, metrics, or log aggregation — the `console.error` is sufficient for Vercel's
  log drain to surface it.

## Open questions

None. The scope is narrow and the constraint (warn, do not hard-fail) is explicitly
stated. No blocking questions.
