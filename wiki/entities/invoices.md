# Entity: Invoice System

The Dexterlabs invoice system is a markdown-based utility that generates professional PDF invoices directly from the browser.

## Data Source
- **Location**: `content/invoices/*.md`
- **Format**: YAML Frontmatter containing invoice metadata (date, client, items, etc.).

## Generation Stack
- **jspdf**: Core library for PDF generation.
- **html2canvas**: Used to capture the HTML representation of the invoice for high-fidelity conversion.
- **qrcode**: Generates payment QR codes (EPC/SEPA) embedded in the invoice.

## Workflow
1. User navigates to `/invoices/[invoicenr]`.
2. Svelte route loads the markdown content via `mdsvex`.
3. The page renders a clean "Lab Bench" styled invoice layout.
4. Client-side script handles the "Download PDF" action using the generation stack.

## Implementation Details
- Located in `src/routes/(private)/invoices/[invoicenr]/`.
- Uses Svelte 5 runes for state management (e.g., controlling the PDF generation status).
