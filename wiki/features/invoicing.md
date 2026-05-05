# Invoicing

> Sources: Internal, 2026-05-03
> Updated: 2026-05-03

## What it is

A client-side PDF invoice generator for Dutch ZZP freelance work. Invoices are written as Markdown files with Dutch-format frontmatter. The rendered page produces a print-ready PDF with proper VAT handling and a SEPA QR code for payment.

Route: `/invoices/[factuurnr]/` — only accessible in development. Redirects to 404 in production.

## Core user stories

**Generate a PDF for a client**
I've done some freelance work. I create a new `.md` file in `/content/invoices/`, fill in the line items and client details, open the invoice route in dev, and print/export to PDF from the browser.

**Reverse charge (btw verlegd)**
The client is an EU business. I set `btw_verlegd: true` in the frontmatter. The invoice omits VAT and adds the statutory reverse charge notice.

**Multi-page invoice**
The invoice has many line items. The renderer uses binary search to fit as much content as possible per page before inserting a page break.

## Invoice content

Files live in `/content/invoices/*.md`. The filename is the invoice number.

Key frontmatter fields (Dutch):

| Field | Notes |
|-------|-------|
| `factuurnr` | Invoice number (e.g. `2026-0001`) |
| `datum` | Invoice date (ISO) |
| `vervaldatum` | Payment due date (ISO) |
| `verzender` | Sender block: naam, gegevens[], kvk, btw, iban |
| `klant` | Client block: naam, adres[], btw_id? |
| `regels` | Line items: omschrijving, toelichting, aantal, tarief, btw_tarief? |
| `btw_verlegd` | `true` for EU B2B reverse charge |
| `valuta` | Currency (defaults to EUR) |
| `taal` | Language (defaults to NL) |

## SEPA QR code

Each invoice includes a machine-readable SEPA QR code generated from the IBAN and amount. Dutch mobile banking apps can scan this to pre-fill a transfer.

## See Also

- [Invoices entity](../entities/invoices.md)
