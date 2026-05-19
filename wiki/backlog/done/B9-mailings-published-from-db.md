---
id: B9
title: Source mailing "published" state from the DB, drop the frontmatter flag
type: feature
priority: medium
flags: []
created: 2026-05-19
---

## Description

Today a mailing shows on `/mailings/` only when its frontmatter has
`published: true`. Setting that flag is a manual step after the broadcast
has been sent — easy to forget. The DB already has a `mailingBroadcasts`
table that records every broadcast Resend sent (slug, broadcastId, sentAt,
recipientCount).

Drop the frontmatter flag. Instead, derive "published" from the existence
of a `mailingBroadcasts` row for that slug. A mailing appears on the
archive index iff it has been broadcast.

## Notes

- Touches:
  - `src/routes/(console)/mailings/+page.ts` → `+page.server.ts` (DB read,
    sets `prerender = false` or queries at build time depending on the
    Vercel build environment).
  - `src/routes/(console)/mailings/[slug]/+page.ts` — likely the same
    server-load pattern so slug pages 404 before broadcast.
  - `MailingFrontmatter` type in `src/lib/types.ts` — drop the
    `published` field.
  - All existing mailing markdown files — remove the `published:` line
    (currently only `content/mailings/001-the-lab-is-open.md`).
  - `wiki/requirements.md` R4 — rewrite the rule.
  - `wiki/architecture.md` — note that `/mailings/` is the one
    public-content route that hits the DB (not just API routes / admin).

- **Overlaps with B1** (admin analytics view at `/admin/analytics/`,
  which already queries `mailingBroadcasts`). Consider doing them in
  the same item or sharing a helper that returns "broadcasted slugs".

- Surfaced 2026-05-19 during the `@dxlbnl/ui` migration of `/mailings/`:
  the only existing mailing has `published: false` and the archive
  renders empty even though the broadcast was sent.

- After the switch, the migration of `/mailings/[slug]/` doesn't need a
  re-do; only the loader changes. The route component stays.
