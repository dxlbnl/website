---
id: B28
title: Enforce NoteKind type — tighten types.ts and extend tags test
type: feature
priority: medium
created: 2026-05-21
---

## Description

Three related issues around `kind` enforcement:

1. `src/lib/types.ts:25` has `kind?: string` — should be `kind?: NoteKind` (imported from `tags.ts`) so the compiler catches invalid values
2. `src/lib/content/tags.test.ts` validates tag vocabulary across all notes but never checks `kind` values — a note with `kind: PROJECT_LOG` (underscore, wrong) passes silently
3. Note components (`notes/+page.svelte:47`, `notes/[slug]/+page.svelte:42`) fall back to rendering `'LOG'` as the kind badge when `kind` is absent, but `'LOG'` is not in `NOTE_KINDS` — the fallback is inconsistent with the vocabulary

Fix all three together: update the type, add kind validation to the test, and change the fallback to a value that is in `NOTE_KINDS` (or remove the badge when kind is absent).

## Notes

- `NOTE_KINDS` exported from `src/lib/content/tags.ts:59`
- Test pattern to extend: `src/lib/content/tags.test.ts` — already globs note content
- Valid kind values: `BUILD`, `HARDWARE`, `TALK`, `PROJECT-LOG`, `OPEN-SOURCE`
