---
id: B30
title: Disallow /admin/ in robots.txt
type: chore
priority: low
created: 2026-05-21
---

## Description

`static/robots.txt` only disallows `/api/`. The `/admin/` route is protected at the app layer but crawlers will still hit it, follow the redirect to the login page, and potentially index it. Adding a `Disallow` entry keeps it out of crawl budgets entirely.

Add `Disallow: /admin/` to `static/robots.txt`.

## Notes

- `static/robots.txt` — one-line addition
