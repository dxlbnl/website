---
id: B5
title: Vitest discovery for wiki/specs/*.test.ts
type: chore
priority: low
flags: []
created: 2026-05-18
---

## Description

The test-writer placed `wiki/specs/B3-spec.test.ts` outside the vitest `include`
glob (`src/**` only), so it never actually runs. Its assertions were duplicated
inside `src/routes/(console)/order/cancel/page.test.ts` as "Section E (mirror)"
to preserve coverage during B3. Either widen the vitest config to discover
`wiki/specs/**/*.test.ts`, or delete `wiki/specs/B3-spec.test.ts` and rely on
the mirror. Pick one to prevent drift.

## Notes

- Flagged by reviewer at the end of B3.
- If choosing the "widen the glob" path, the change goes in `vite.config.ts` (or
  wherever vitest's `test.include` is defined).
- If choosing the "delete" path: remove `wiki/specs/B3-spec.test.ts` only — the
  mirror inside `page.test.ts` covers the same criteria.
