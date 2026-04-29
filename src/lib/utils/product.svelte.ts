import type { ProductFrontmatter } from '$lib/types';
import { fmtCurrency } from '$lib/utils/fmt';
import { isEU, type Region } from '$lib/utils/location';

type StockInfo = { label: string; cls: string; led: 'ok' | 'amber' | 'off'; ship?: string };

const STOCK_MAP: Record<
	string,
	Omit<StockInfo, 'label'> & { label: (orderable: boolean) => string }
> = {
	available: { label: () => 'IN STOCK', cls: 'ok', led: 'ok', ship: 'SHIPS IN 3–5 DAYS' },
	'sold-out': { label: () => 'SOLD OUT', cls: 'out', led: 'off' },
	'coming-soon': { label: (o) => (o ? 'PREORDER' : 'COMING SOON'), cls: 'low', led: 'amber' }
};

export function useProduct(getProduct: () => ProductFrontmatter, getRegion: () => Region) {
	const eu = $derived(isEU(getRegion()));
	const price = $derived(eu ? getProduct().priceIncl : getProduct().priceExcl);
	const displayPrice = $derived(price ? fmtCurrency(price) : '');
	const taxLabel = $derived(eu ? 'incl. BTW' : 'excl. VAT');
	const orderable = $derived(Boolean(getProduct().stripeProduct));
	const cta = $derived(
		getProduct().status === 'coming-soon' ? (orderable ? 'PREORDER' : 'COMING SOON') : 'ADD TO RACK'
	);
	const stock = $derived((): StockInfo => {
		const entry = STOCK_MAP[getProduct().status];
		if (!entry) return { label: getProduct().status, cls: '', led: 'off' };
		return { ...entry, label: entry.label(orderable) };
	});

	return {
		get eu() {
			return eu;
		},
		get price() {
			return price;
		},
		get displayPrice() {
			return displayPrice;
		},
		get taxLabel() {
			return taxLabel;
		},
		get orderable() {
			return orderable;
		},
		get cta() {
			return cta;
		},
		get stock() {
			return stock();
		}
	};
}
