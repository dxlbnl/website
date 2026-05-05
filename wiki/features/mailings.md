# Mailings

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

A newsletter system. Visitors can subscribe; mailings are written as Markdown files and broadcast to subscribers via Resend. Sent mailings are archived on the site at `/mailings/`.

Routes: `/mailings/` (archive), `/mailings/[slug]/` (individual issue).

## Core user stories

**Subscribe**
A visitor enters their email in the subscribe form. It gets added as a Resend contact in the configured segment. They'll receive future broadcasts.

**Write and send a mailing**
I write a new mailing as a Markdown file in `/content/mailings/`, set `published: false` until it's ready. When ready, I go to `/admin/mailings/[slug]/` and click Send. Resend broadcasts it to the segment. The mailing ID and recipient count are saved to the database.

**Read past mailings**
A visitor opens `/mailings/` and sees all published mailings sorted by date. They can open any issue without subscribing.

**Track opens**
Resend fires a webhook to `/api/resend-webhook` when an email is opened. The open is recorded in the `emailOpens` table and linked to the broadcast. The admin mailings page shows open counts per issue.

## Mailing content

Files live in `/content/mailings/*.md`. The filename is the slug.

| Field | Notes |
|-------|-------|
| `slug` | URL identifier |
| `title` | Display title on the archive page |
| `subject` | Email subject line |
| `date` | ISO date |
| `published` | `true` to show in archive and enable sending |

The markdown body is the mailing content. It's rendered using `MailingTemplate.svelte` for the email and the same template for the archive view.

## Email rendering

Mailings are rendered server-side as HTML using Svelte's SSR. A few transformations happen before sending:

- Image paths are rewritten to absolute Vercel-optimised URLs.
- The `RESEND_UNSUBSCRIBE_PLACEHOLDER` token is replaced with Resend's unsubscribe macro.

## Subscriber API

`POST /api/subscribe` accepts `{ email, firstName? }` and adds the contact to Resend. If `RESEND_SEGMENT_ID` is set, the contact is added to that segment.

## See Also

- [Content Architecture](../concepts/content-architecture.md)
