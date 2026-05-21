---
id: B18
title: Add rate limiting to public API endpoints
type: feature
priority: medium
created: 2026-05-21
---

## Description

`/api/subscribe`, `/api/checkout`, and `/api/share` have no rate limiting. This allows:
- Subscribe: spam Resend with fake emails at no cost to the attacker
- Checkout: generate unlimited Stripe checkout sessions (Stripe charges per session)
- Share: enumerate all active sessions

On Vercel, the `x-forwarded-for` header provides the client IP. A simple per-IP sliding window (e.g. 10 requests / minute for subscribe, 5 / minute for checkout) implemented in `hooks.server.ts` or per-endpoint middleware would cover the main abuse vectors.

## Notes

- No Redis available — consider an in-memory Map with TTL, or Vercel KV if already in the stack
- Alternatively, Vercel's built-in WAF / DDoS protection covers some of this at the edge
- Check if `@vercel/kv` is already a dependency before choosing an approach
