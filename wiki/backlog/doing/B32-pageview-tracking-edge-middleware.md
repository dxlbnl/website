---
id: B32
title: Move pageview tracking to Vercel edge middleware using Neon HTTP driver
type: feature
priority: high
flags: []
created: 2026-05-21
---

## Description

All public routes are prerendered and served as static files from Vercel's CDN —
`hooks.server.ts` never runs for them, so only `/admin/analytics` currently appears
in the pageviews table. Move tracking to a Vercel edge middleware (`middleware.ts`
at the project root) so every request, including static pages, is captured. Use the
Neon serverless HTTP driver (`@neondatabase/serverless`) for the DB write since the
edge runtime has no Node.js and cannot use the existing Drizzle/TCP connection.
Remove the tracking block from `hooks.server.ts` entirely once middleware is in place.

## Notes

- Edge middleware has `request.ip`, Vercel geo headers (`x-vercel-ip-country`, etc.),
  and the `user-agent` header — same inputs as the current hook.
- The `sid` session cookie logic should move to middleware too.
- `building` guard is no longer needed once tracking is out of hooks.server.ts.
- Neon HTTP driver: `neon(process.env.DATABASE_URL)` — returns a tagged-template SQL
  function usable in edge without a connection pool.
