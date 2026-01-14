import type { InvoiceFrontmatter } from '$lib/types';

/**
 * Format a number as currency based on invoice locale
 */
export function formatCurrency(amount: number, invoice: InvoiceFrontmatter): string {
	return new Intl.NumberFormat(invoice.taal || 'nl-NL', {
		style: 'currency',
		currency: invoice.valuta || 'EUR'
	}).format(amount);
}

/**
 * Format a number as currency with specific locale/currency
 * (For use in list page where invoice object might not be available)
 */
export function formatCurrencyWithLocale(
	amount: number,
	locale: string = 'nl-NL',
	currency: string = 'EUR'
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(amount);
}

/**
 * Format ISO date string to localized format
 * Uses nl-NL format: DD-MM-YYYY
 */
export function formatDate(dateStr: string, locale: string = 'nl-NL'): string {
	return new Date(dateStr).toLocaleDateString(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}

/**
 * Generate bunq.me payment URL
 */
export function generatePaymentUrl(
	amount: number,
	invoiceNumber: string,
	merchantHandle: string = 'dexterlabs'
): string {
	const formattedAmount = amount.toFixed(2);
	const description = encodeURIComponent(`Factuur ${invoiceNumber}`);
	return `https://bunq.me/${merchantHandle}/${formattedAmount}/${description}`;
}
