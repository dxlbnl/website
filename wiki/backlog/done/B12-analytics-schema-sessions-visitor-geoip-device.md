---
id: B12
title: Analytics schema — sessions, visitor hash, geoIP, device tracking
type: feature
priority: medium
flags: [review]
created: 2026-05-21
spec: wiki/specs/B12-analytics-schema-sessions-visitor-geoip-device.md
---

## Description

Extend the `pageviews` table to capture enough signal for meaningful analytics without cookie consent banners. Add a browser-session-scoped cookie (`sessionId`, no `Max-Age`/`Expires`) for session grouping, a daily-rotating visitor hash (`sha256(IP+UA+date+salt)`) for unique-visitor counts, and read Vercel's built-in geo headers (`x-vercel-ip-country`, `x-vercel-ip-city`) plus UA-parsed device/OS/browser strings — all server-side in `hooks.server.ts`, no client JS.

New columns: `sessionId text`, `visitorHash text`, `country text`, `city text`, `deviceType text` (mobile/tablet/desktop), `os text`, `browser text`.

## Notes

- Session cookie: no `Max-Age`/`Expires` = browser-session-scoped = not a tracking cookie = no consent banner required
- Visitor hash: `sha256(IP + UA + date + salt)`, rotated daily — privacy-preserving, no PII stored
- GeoIP via Vercel headers — no external DB or API key needed
- UA parsing: basic regex sufficient for browser/OS/device type detection; no library required
- Requires a Drizzle schema migration (`drizzle-kit push`)
- Analytics page redesign (time-series charts, URL grouping, bot filtering per B11 research) can follow as a separate item once this schema lands
