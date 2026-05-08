import type { InvoiceFrontmatter } from "$lib/types";

/**
 * VAT rate breakdown entry [rate, amount]
 */
export type VATBreakdownEntry = [rate: number, amount: number];

/**
 * Complete invoice calculations
 */
export interface InvoiceCalculations {
  subtotal: number;
  vatBreakdown: VATBreakdownEntry[];
  vatAmount: number;
  hasMultipleRates: boolean;
  total: number;
}

/**
 * Calculate subtotal (sum of all line items excluding VAT)
 */
export function calculateSubtotal(invoice: InvoiceFrontmatter): number {
  return invoice.regels.reduce((sum, regel) => sum + regel.aantal * regel.tarief, 0);
}

/**
 * Calculate VAT breakdown grouped by rate
 * Returns sorted array (highest rate first)
 * Returns empty array if VAT is reversed
 */
export function calculateVATBreakdown(invoice: InvoiceFrontmatter): VATBreakdownEntry[] {
  if (invoice.btw_verlegd) {
    return [];
  }

  const breakdown = new Map<number, number>();

  invoice.regels.forEach((regel) => {
    const lijnTotaal = regel.aantal * regel.tarief;
    const btwPercentage = regel.btw_tarief ?? 21; // Default to 21%
    const lijnBtw = lijnTotaal * (btwPercentage / 100);

    breakdown.set(btwPercentage, (breakdown.get(btwPercentage) || 0) + lijnBtw);
  });

  // Sort by rate descending
  return Array.from(breakdown.entries()).sort((a, b) => b[0] - a[0]);
}

/**
 * Calculate total VAT amount
 * Returns 0 if VAT is reversed
 */
export function calculateVATAmount(invoice: InvoiceFrontmatter): number {
  if (invoice.btw_verlegd) {
    return 0;
  }

  const breakdown = calculateVATBreakdown(invoice);
  return breakdown.reduce((sum, [, amount]) => sum + amount, 0);
}

/**
 * Check if invoice uses multiple VAT rates
 */
export function hasMultipleVATRates(invoice: InvoiceFrontmatter): boolean {
  const breakdown = calculateVATBreakdown(invoice);
  return breakdown.length > 1;
}

/**
 * Calculate invoice total (subtotal + VAT)
 */
export function calculateTotal(invoice: InvoiceFrontmatter): number {
  const subtotal = calculateSubtotal(invoice);
  const vatAmount = calculateVATAmount(invoice);
  return subtotal + vatAmount;
}

/**
 * Complete invoice calculations
 * Returns all calculated values in one object
 */
export function calculateInvoice(invoice: InvoiceFrontmatter): InvoiceCalculations {
  const subtotal = calculateSubtotal(invoice);
  const vatBreakdown = calculateVATBreakdown(invoice);
  const vatAmount = invoice.btw_verlegd
    ? 0
    : vatBreakdown.reduce((sum, [, amount]) => sum + amount, 0);
  const hasMultipleRates = vatBreakdown.length > 1;
  const total = subtotal + vatAmount;

  return {
    subtotal,
    vatBreakdown,
    vatAmount,
    hasMultipleRates,
    total,
  };
}
