---
id: B4
title: Remove feed feature remnants
type: chore
priority: medium
flags: []
created: 2026-05-18
---

## Description

The feed feature (short titleless status updates) was dropped before it shipped. The DB table was never created and no route exists, but there may be stale references in the codebase — wiki mentions `/admin/feed/`, old content files, or lingering imports. This chore audits and cleans up any remnants.

## Notes

- `wiki/features/feed.md` already marked DROPPED — no wiki changes needed.
- Audit targets: `src/routes/` for any feed-related route files; `src/lib/server/db/schema.ts` for a feedPosts table (expected to not exist); `content/` for any feed markdown files; any lingering `feedPosts` references in source.
- No spec page needed — chore track goes straight to implementer → reviewer.
