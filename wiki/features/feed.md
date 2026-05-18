# Feed

> **STATUS: DROPPED.** The feed feature has been removed from the codebase. This page
> is kept for historical reference only. Do not reintroduce feed routes, DB tables, or
> references to `/admin/feed/`.

---

## What it was

A chronological stream of short, titleless status updates. The latest entry was intended
to surface on the homepage as a live status indicator.

## Why it was dropped

The feature was planned as a DB-backed micro-post system (`feedPosts` table) but that
table was never created and the route was never shipped. The concept was abandoned before
it reached production.

## Current state

- No feed routes exist in `src/routes/`.
- No `feedPosts` table in `src/lib/server/db/schema.ts`.
- No feed content files in `content/`.
- The homepage no longer has a feed/status indicator section.

## See Also

- [Content Architecture](../concepts/content-architecture.md) — for what content types remain.
