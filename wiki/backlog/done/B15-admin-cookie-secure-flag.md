---
id: B15
title: Add secure flag to admin session cookie
type: bug
priority: high
created: 2026-05-21
spec: wiki/specs/B15-admin-cookie-secure-flag.md
---

## Description

The admin session cookie is set without `secure: true` in `src/routes/(private)/admin/+page.server.ts:19`. Without this flag the cookie can be transmitted over plain HTTP, making it capturable in transit.

Add `secure: true` to the cookie options. On localhost this has no effect (browsers ignore it for `http://localhost`), so it won't break local development.

## Notes

- Cookie set at `src/routes/(private)/admin/+page.server.ts` around line 19-24
- Options should be `{ httpOnly: true, sameSite: 'strict', secure: true, path: '/admin' }`
