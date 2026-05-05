# Feed

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

A chronological stream of short, titleless status updates. Low friction by design — one thought, one post, no editorial overhead. The latest entry is surfaced on the homepage as a live status indicator.

Route: `/feed/`.

## Core user stories

**Post a quick update**
Something shipped. I go to `/admin/feed/`, type a line, optionally add tags, and hit post. It appears at the top of the feed immediately. No title, no lede, no image pipeline.

**Check what's happening**
A visitor opens `/feed/` to see recent activity. Posts appear newest-first, each with a date and optional tags.

**Homepage status**
The most recent feed post appears on the homepage as a small status blurb with a blinking indicator — a quick signal that the site is alive and something is happening.

## Structure

Feed posts are stored in the `feedPosts` database table, not as files. Fields:

| Field | Notes |
|-------|-------|
| `id` | Auto-generated UUID |
| `body` | The post text |
| `date` | Timestamp |
| `tags` | String array |

There is no markdown body — the content is entirely in frontmatter-style fields in the DB. This is consistent with the old file-based feed format where `body` was a frontmatter field.

## Admin

Posts are created and deleted from `/admin/feed/`. No edit — delete and repost if something needs fixing.

## See Also

- [Content Architecture](../concepts/content-architecture.md)
