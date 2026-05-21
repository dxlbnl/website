---
id: B21
title: Add observability to silent pageview DB insert failure
type: chore
priority: low
created: 2026-05-21
---

## Description

`src/hooks.server.ts:67` silently swallows all DB insert errors with `.catch(() => {})`. Analytics data is lost without any signal — if the database is down, quota is hit, or there's a schema mismatch, it's invisible.

Replace the empty catch with a `console.error` at minimum. The fire-and-forget approach is correct (don't fail requests over analytics), but errors should be observable.

## Notes

- `src/hooks.server.ts:54-67`
- Change `.catch(() => {})` to `.catch((err) => console.error('[pageview]', err.message))`
