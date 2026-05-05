# Catalogue

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

The product storefront. Lists hardware for sale with specs, pricing, and a buy button that goes straight to Stripe Checkout. No cart — each product is bought individually.

Route: `/catalogue/` (list), `/catalogue/[id]/` (product detail with checkout).

## Core user stories

**Browse available products**
A visitor lands on `/catalogue/` and sees all products sorted by status: available first, then coming-soon, then sold-out.

**Buy a module**
I open the product page for the Distrans AR-1. I see the price, specs, and a buy button. I click it. I land on a Stripe Checkout page with shipping calculated for my region and tax handled automatically. After payment I get a confirmation email.

**Pre-order**
The product status is `coming-soon`. The buy button still works — it's a pre-order. I pay now, the order is logged, and I get a receipt noting it's a pre-order.

## Product content

Products are Markdown files in `/content/products/*.md`. The file slug is the product ID.

Key frontmatter fields:

| Field | Notes |
|-------|-------|
| `id` | URL slug and internal identifier |
| `name` | Display name |
| `status` | `available`, `sold-out`, `coming-soon` |
| `priceIncl` | EUR cents, VAT-inclusive (shown to EU buyers) |
| `priceExcl` | EUR cents, VAT-exclusive (shown to non-EU buyers) |
| `stripeProduct` | Stripe product ID — required for checkout to work |
| `specs` | Key-value pairs, rendered as a spec table |
| `tindieUrl` | Optional alternative purchase link |
| `images` | Gallery image paths |

## Checkout flow

1. Visitor clicks Buy on `/catalogue/[id]/`.
2. Browser POSTs to `/api/checkout` with the product ID.
3. The server detects the visitor's country from the Vercel `x-vercel-ip-country` header.
4. A Stripe Checkout session is created with:
   - The correct shipping rate for the region (NL / EU / World).
   - Automatic tax calculation enabled.
   - Tax ID collection enabled (EU B2B reverse charge).
   - `isPreorder` flag in metadata if status is `coming-soon`.
5. Visitor is redirected to Stripe Checkout.
6. On success, Stripe fires a webhook to `/api/stripe-webhook`, which:
   - Writes the order to the `orders` database table.
   - Sends an order confirmation email to the customer via Resend.
   - Sends a plain-text notification to the admin email.

## Shipping rates

Rates are set as Stripe shipping rate IDs in environment variables:

| Region | Env var |
|--------|---------|
| Netherlands | `SHIPPING_PRICE_NL` |
| EU (excluding NL) | `SHIPPING_PRICE_EU` |
| Rest of world | `SHIPPING_PRICE_WORLD` |

## See Also

- [Stripe Configuration](../expertise/stripe.md)
- [Content Architecture](../concepts/content-architecture.md)
