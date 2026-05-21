---
id: B25
title: Add tests for public API endpoints
type: feature
priority: high
created: 2026-05-21
---

## Description

Six of eight API routes have zero tests: `checkout`, `subscribe`, `stripe-webhook`, `resend-webhook`, `og`, and `share`. These handle payments, subscriptions, and webhook processing — regressions are invisible until production.

Minimum coverage per route:
- **checkout**: rejects missing/unknown product; rejects unsupported region; passes correct `unit_amount` for EU (incl) vs non-EU (excl) pricing
- **subscribe**: rejects invalid email; accepts valid email + optional firstName; propagates Resend error as 500
- **stripe-webhook**: rejects missing/invalid `Stripe-Signature`; processes `checkout.session.completed` event
- **resend-webhook**: rejects invalid Svix signature; processes `email.opened` event; ignores unknown types
- **og**: rejects external `image` URLs (after B14 fix); returns JPEG for valid relative path

## Notes

- Mirror the pattern in `src/routes/(private)/admin/analytics/page.server.test.ts`
- Mock Stripe and Resend SDK calls with `vi.mock`
- Webhook signature generation helpers can be derived from the existing HMAC pattern in `src/lib/utils/auth.ts`
