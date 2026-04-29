import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const POST: RequestHandler = async ({ request, url }) => {
	const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const { priceId, productId } = await request.json();

	if (!priceId || !productId) {
		error(400, 'Missing priceId or productId');
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: [{ price: priceId, quantity: 1 }],
		automatic_tax: {
			enabled: true // Turns on Stripe Tax for this transaction
		},
		tax_id_collection: {
			enabled: true // Allows B2B users to input their VAT number
		},
		shipping_address_collection: {
			// EU + UK, US, CA, AU, CH, NO, NZ, JP, SG
			allowed_countries: [
				'AT',
				'BE',
				'BG',
				'CY',
				'CZ',
				'DE',
				'DK',
				'EE',
				'ES',
				'FI',
				'FR',
				'GR',
				'HR',
				'HU',
				'IE',
				'IT',
				'LT',
				'LU',
				'LV',
				'MT',
				'NL',
				'PL',
				'PT',
				'RO',
				'SE',
				'SI',
				'SK',
				'GB',
				'US',
				'CA',
				'AU',
				'CH',
				'NO',
				'NZ',
				'JP',
				'SG'
			]
		},
		success_url: `${url.origin}/order/success`,
		cancel_url: `${url.origin}/catalogue/${productId}`,
		metadata: { productId, priceId }
	});

	return json({ url: session.url });
};
