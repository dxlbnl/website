import Stripe from 'stripe';
import {
	STRIPE_SECRET_KEY,
	STRIPE_SHIPPING_NL,
	STRIPE_SHIPPING_EU,
	STRIPE_SHIPPING_WORLD
} from '$env/static/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ALL_COUNTRIES, getRegion } from '$lib/utils/location';

export const prerender = false;
export const trailingSlash = 'ignore';

const SHIPPING_RATES_MAP: Record<'NL' | 'EU' | 'World', string> = {
	NL: STRIPE_SHIPPING_NL,
	EU: STRIPE_SHIPPING_EU,
	World: STRIPE_SHIPPING_WORLD
};

const STRIPE_OPTIONS: Stripe.Checkout.SessionCreateParams = {
	mode: 'payment',
	automatic_tax: { enabled: true }, // Turns on tax calculation
	tax_id_collection: { enabled: true }, // For EU B2B sales
	shipping_address_collection: {
		allowed_countries: ALL_COUNTRIES
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const { priceId, productId } = await request.json();

	const country = request.headers.get('x-vercel-ip-country') ?? '';
	const region = getRegion(country);

	if (!region) {
		error(400, 'Missing region');
	}

	if (!priceId || !productId) {
		error(400, 'Missing priceId or productId');
	}

	const session = await stripe.checkout.sessions.create({
		...STRIPE_OPTIONS,
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: `${url.origin}/order/success`,
		cancel_url: `${url.origin}/catalogue/${productId}`,
		shipping_options: [{ shipping_rate: SHIPPING_RATES_MAP[region] }],
		metadata: { productId, priceId }
	});

	return json({ url: session.url });
};
