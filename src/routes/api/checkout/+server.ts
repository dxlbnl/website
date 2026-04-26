import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const { priceId, productId } = await request.json();

	if (!priceId || !productId) {
		error(400, 'Missing priceId or productId');
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: `${url.origin}/order/success`,
		cancel_url: `${url.origin}/catalogue/${productId}`,
		metadata: { productId, priceId },
	});

	return json({ url: session.url });
};
