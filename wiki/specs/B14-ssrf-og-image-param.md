# B14: Fix SSRF in /api/og image param

## Context

`src/routes/api/og/+server.ts` exposes a `GET /api/og` endpoint that generates Open
Graph images using satori + sharp. It accepts an `image` query parameter and passes the
value directly to `fetch()` (line 57) with no URL validation. A caller can supply an
arbitrary `https://` URL, turning the Vercel serverless function into an open image proxy
or SSRF vector — the function can reach cloud instance-metadata endpoints
(e.g. `http://169.254.169.254/`) and internal services not accessible from the public
internet.

The same endpoint accepts `title`, `subtitle`, and `cta` params with no length bounds,
enabling DoS via oversized inputs to the satori renderer. The background-image fetch has
no timeout, so a slow or stalled remote URL can hold the serverless instance open
indefinitely.

Legitimate callers (`SEO.svelte`) only ever pass relative paths like `/images/foo.webp`.
All three fixes have zero user-visible impact on normal operation.

Related pages:
- Item card: `wiki/backlog/doing/B14-ssrf-og-image-param.md`
- Architecture: `wiki/architecture.md` (api/og route)

## Acceptance criteria

### SSRF mitigation — image param

1. When the `image` query param contains `://` (e.g. `?image=https://evil.example.com/x.jpg`),
   the endpoint treats `rawImageUrl` as `null`: no fetch is made to that URL and the OG
   image is rendered with the solid background colour (`#0b0d0c`) instead.

2. When the `image` query param is a relative path that does not contain `://`
   (e.g. `?image=/images/foo.webp`), the endpoint proceeds normally: the `.webp` →
   `.jpg` replacement is applied, the image is fetched via the SvelteKit `fetch` helper,
   and the result is used as the background.

3. When the `image` query param is absent, the endpoint renders with the solid
   background colour — behaviour unchanged from before this fix.

4. The SSRF check is applied to `rawImageUrl` before the `.webp` → `.jpg` replacement
   step, so an attacker cannot smuggle an external URL by omitting a recognised image
   extension.

### Parameter length limits

5. When `title` exceeds 200 characters, the value is truncated to exactly 200 characters
   before being passed to the satori layout. The endpoint still returns HTTP 200 with a
   valid JPEG image.

6. When `subtitle` exceeds 200 characters, the value is truncated to exactly 200
   characters before being passed to the satori layout. The endpoint still returns HTTP
   200.

7. When `cta` exceeds 200 characters, the value is truncated to exactly 200 characters
   before being passed to the satori layout. The endpoint still returns HTTP 200.

8. Params at or below 200 characters are passed through unchanged (no truncation).

### Request timeout

9. The `fetchAssetAsBase64` call for the background image (the `imageUrl` path) uses
   `AbortSignal.timeout(5000)` so that a fetch that does not complete within 5 seconds
   is aborted. When aborted, `fetchAssetAsBase64` returns `""` (its existing catch-return
   path) and the OG image renders without a background image — the endpoint still returns
   HTTP 200.

10. The timeout applies only to the background-image fetch, not to the font or logo
    fetches (those assets are served from the same origin and are not attacker-controlled).

### No regression — valid relative paths

11. A request with `?image=/images/foo.webp&title=Hello&subtitle=World` returns HTTP 200
    with `content-type: image/jpeg` and a non-empty body, confirming the happy path is
    unaffected by the new validation.

12. A request with no query params returns HTTP 200 with `content-type: image/jpeg` (the
    default title / subtitle values are used).

### Regression — external URL is silently ignored

13. A request with `?image=https://external.example.com/photo.jpg` returns HTTP 200 with
    `content-type: image/jpeg`. The response body is a valid JPEG (the image is
    generated without a background). No fetch is attempted against
    `external.example.com`. This test must assert both that the response succeeds and
    that the external URL was not fetched (mock / spy on the `fetch` helper).

## Out of scope

- Rate-limiting or authentication on the `/api/og` endpoint — that is a separate concern.
- Validating that relative image paths actually resolve to files that exist on the server
  (a missing image already falls back gracefully via the `fetchAssetAsBase64` error path).
- Allowlisting specific relative path prefixes (e.g. `/images/`) — a scheme-only check
  is sufficient given the threat model and the single legitimate caller.
- Changing the response format, image dimensions, fonts, or palette.
- Migrating to a streaming or edge-function rendering approach.

## Open questions

None. The fix is fully specified by the item card and the source code. No blocking
questions.
