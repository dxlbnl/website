---
id: B20
title: Fix paginaType typo in InvoiceFrontmatter
type: chore
priority: medium
created: 2026-05-21
---

## Description

`src/lib/types.ts:67` has `paginaType: 'factuur'` — the field is named `paginaType` (Dutch: "page type") while every other frontmatter type uses `pageType`. This makes it impossible to write a union type over all frontmatter variants without a special case.

Rename to `pageType: 'invoice'` in the type definition, and update any content files or load functions that reference `paginaType`.

## Notes

- `src/lib/types.ts:67`
- Search for `paginaType` in content and src to find all usages before renaming
