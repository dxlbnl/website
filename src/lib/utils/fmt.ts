/** "28 apr. 2026" */
export function fmtDate(d: string | Date): string {
	return new Date(d).toLocaleDateString('en-NL', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/** "28 apr. 2026 · 14:32" */
export function fmtDateTime(d: string | Date): string {
	const date = new Date(d);
	const datePart = date.toLocaleDateString('en-NL', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
	const timePart = date.toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' });
	return `${datePart} · ${timePart}`;
}

/** "28 apr." - no year, for compact display */
export function fmtDateShort(d: string | Date): string {
	return new Date(d).toLocaleDateString('en-NL', { day: 'numeric', month: 'short' });
}
/** "€ 12,50" */
export function fmtCurrency(amount: number, currency = 'EUR', locale = 'en-NL'): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/** Converts cents to currency string; returns "-" for null */
export function fmtCents(cents: number | null, currency?: string | null): string {
	if (cents == null) return '-';
	return fmtCurrency(cents / 100, currency ?? 'EUR');
}

/** bunq.me/dexterlabs/12.50/Factuur%202026-001 */
export function generatePaymentUrl(
	amount: number,
	invoiceNumber: string,
	merchantHandle: string = 'dexterlabs'
): string {
	const formattedAmount = amount.toFixed(2);
	const description = encodeURIComponent(`Factuur ${invoiceNumber}`);
	return `https://bunq.me/${merchantHandle}/${formattedAmount}/${description}`;
}
