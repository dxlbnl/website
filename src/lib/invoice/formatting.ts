import type { InvoiceFrontmatter } from '$lib/types';
import { fmtCurrency, fmtDate } from '$lib/utils/fmt';

export function formatCurrency(amount: number, invoice: InvoiceFrontmatter): string {
	return fmtCurrency(amount, invoice.valuta || 'EUR', invoice.taal || 'nl-NL');
}

/** @deprecated Use fmtCurrency from $lib/utils/fmt */
export function formatCurrencyWithLocale(
	amount: number,
	locale: string = 'nl-NL',
	currency: string = 'EUR'
): string {
	return fmtCurrency(amount, currency, locale);
}

export function formatDate(dateStr: string): string {
	return fmtDate(dateStr);
}

export function generatePaymentUrl(
	amount: number,
	invoiceNumber: string,
	merchantHandle: string = 'dexterlabs'
): string {
	const formattedAmount = amount.toFixed(2);
	const description = encodeURIComponent(`Factuur ${invoiceNumber}`);
	return `https://bunq.me/${merchantHandle}/${formattedAmount}/${description}`;
}
