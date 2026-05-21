---
id: B23
title: Compute priceValidUntil dynamically in SEO JSON-LD
type: chore
priority: medium
created: 2026-05-21
---

## Description

`src/lib/ui/SEO.svelte:136` has `priceValidUntil: '2026-12-31'` hardcoded in the Product JSON-LD block. After year-end Google will flag the offer as expired and suppress the price badge in search results.

Replace with a derived value that always points to end-of-current-year:
```ts
new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
```

## Notes

- Affected line is inside `buildJsonLd()` in the `type === 'product'` branch
- `SEO.svelte` already uses `$derived` for `jsonLd` so this fits naturally
