---
id: B2
title: Module interest / pre-order subscribe
type: feature
priority: high
flags: []
created: 2026-05-18
---

## Description

When a product is `coming-soon`, visitors should be able to register their interest without going through a full checkout. A simple email capture on the product page: "Notify me when this is available" — adds them to a Resend contact or a dedicated segment. Gives Dexter a warm list to email when the module ships, and reduces reliance on social reach.

## Notes

- Product status `coming-soon` is already defined in `ProductFrontmatter` and `ProductStatus`.
- Resend subscriber API already exists at `/api/subscribe` — may be reusable or need a separate endpoint with a different segment.
- The `Pricebox.svelte` component on the product detail page is the right place to conditionally render the interest form vs. the buy button.
- Consider storing interest in a DB table (vs. Resend-only) so we can query it without hitting the API.
