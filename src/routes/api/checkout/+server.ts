import Stripe from 'stripe';
import {
	STRIPE_SECRET_KEY,
	STRIPE_SHIPPING_NL,
	STRIPE_SHIPPING_EU,
	STRIPE_SHIPPING_WORLD
} from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALL_COUNTRIES, getRegion, isEU } from '$lib/utils/location';
import { z } from 'zod';
import type { ProductFrontmatter } from '$lib/types';

export const prerender = false;
export const trailingSlash = 'ignore';

type ProductModule = { metadata: ProductFrontmatter };

const productModules = import.meta.glob<ProductModule>('/content/products/*.md');

const SHIPPING_RATES_MAP: Record<'NL' | 'EU' | 'World', string> = {
	NL: STRIPE_SHIPPING_NL,
	EU: STRIPE_SHIPPING_EU,
	World: STRIPE_SHIPPING_WORLD
};

const bodySchema = z.object({
	product: z.string()
});

const loadProduct = async (productSlug: string) => {
	const productModule = productModules[`/content/products/${productSlug}.md`];
	if (productModule) {
		return (await productModule()).metadata;
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const parseResult = bodySchema.safeParse(await request.json());

	if (!parseResult.success) {
		error(400, 'Missing product');
	}
	const product = await loadProduct(parseResult.data.product);

	const country = request.headers.get('x-vercel-ip-country') ?? '';
	const region = getRegion(country);
	const eu = isEU(region);

	if (!region) {
		error(400, 'Missing region');
	}
	if (!product?.stripeProduct) {
		error(400, 'Not a valid product');
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		automatic_tax: { enabled: true }, // Turns on tax calculation
		tax_id_collection: { enabled: true }, // For EU B2B sales
		shipping_address_collection: {
			allowed_countries: ALL_COUNTRIES
		},
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: 'eur',
					product: product?.stripeProduct,
					unit_amount: eu ? product.priceIncl * 100 : product.priceExcl * 100,
					tax_behavior: eu ? 'inclusive' : 'exclusive'
				}
			}
		],
		success_url: `${url.origin}/order/success/`,
		cancel_url: `${url.origin}/catalogue/${product.id}/`,
		shipping_options: [{ shipping_rate: SHIPPING_RATES_MAP[region] }],
		metadata: { productId: product.id }
	});

	return json({ url: session.url });
};
