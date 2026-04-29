import type { LayoutServerLoad } from './$types';

const EU = new Set([
	'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
	'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
	'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
]);

export const load: LayoutServerLoad = ({ request }) => {
	const country = request.headers.get('x-vercel-ip-country') ?? '';
	return { isEU: EU.has(country) };
};
