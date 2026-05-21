---
id: B14
title: Fix SSRF in /api/og image param
type: bug
priority: high
created: 2026-05-21
---

## Description

`src/routes/api/og/+server.ts:45` accepts an `image` query param and passes it directly to `fetch()` with no URL validation. Any caller can pass an arbitrary `https://` URL, turning the endpoint into an open image proxy or SSRF vector — requests originate from the Vercel serverless function, which can reach cloud metadata endpoints (AWS/GCP instance metadata) or internal services.

The fix: validate that `rawImageUrl` is a relative path (no `://` scheme) before using it. Since `SEO.svelte` only ever passes paths like `/images/foo.webp`, this restriction has zero user-visible impact.

Also add parameter length limits (title, subtitle, cta) and a request timeout via `AbortSignal` to prevent DoS via oversized inputs or slow remote fetches.

## Notes

- Vulnerable fetch at `src/routes/api/og/+server.ts:44-48`
- Reject: `if (rawImageUrl?.includes('://')) { rawImageUrl = null }`
- Add `AbortSignal.timeout(5000)` to the image fetch
- Add max length guards on title/subtitle/cta params (e.g. 200 chars)
