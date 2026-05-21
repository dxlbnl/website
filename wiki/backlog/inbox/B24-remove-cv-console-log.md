---
id: B24
title: Remove console.log from cv/+page.ts
type: chore
priority: medium
created: 2026-05-21
---

## Description

`src/routes/cv/+page.ts:15` contains `console.log(component, metadata)` — a debug statement that fires server-side on every CV page load in production.

Remove the line.

## Notes

- `src/routes/cv/+page.ts:15`
