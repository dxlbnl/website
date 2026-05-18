---
id: B1
title: Email & page-view tracking
type: feature
priority: high
flags: []
created: 2026-05-18
---

## Description

The DB schema already has `emailOpens` and `pageviews` tables wired up — webhook writes open events, and pageviews are presumably logged somewhere. What's missing is surfacing this data in the admin UI. The goal is a lightweight analytics view in `/admin/` that shows: open counts per mailing broadcast, and a recent pageview log (path + referrer + date). Nothing fancy — a table per data type is enough.

## Notes

- `emailOpens` is populated via `/api/resend-webhook` when Resend fires an open event.
- `pageviews` table exists in schema; confirm where writes happen (hooks? middleware?).
- Admin panel is at `/(private)/admin/` — extend the existing layout.
- No charting library; plain tables are fine and consistent with the phosphor aesthetic.
