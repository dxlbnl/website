# Invoice System

> Sources: Internal, 2026-04-17
> Updated: 2026-04-26

## Overview

A private, client-side PDF invoice generator for Dexterlabs freelance work. No server, no SaaS - invoice data is markdown files, the browser renders and exports the PDF. Dutch BTW (VAT) context throughout.

## Why it exists

Dexter does freelance / project work alongside product sales. The invoice system handles that billing. It's a private route (`/(private)/invoices/`) - not linked from the public site.

## Key details

- Frontmatter fields are Dutch (`factuurnr`, `datum`, `regels`, `btw_verlegd`) - the whole system is NL-first
- QR code is a SEPA EPC payment link - lets clients pay directly from their banking app by scanning
- `btw_verlegd` flag handles reverse-charge VAT for B2B transactions

## What the code doesn't make obvious

Pagination uses binary search to fit content per page - it measures DOM height, not line counts. This was necessary because invoice line items vary wildly in height (multi-line descriptions, toelichting). Read `src/lib/invoice/pdf-generator.ts` for the implementation.

## See Also

- [Dexterlabs](dexterlabs.md)
