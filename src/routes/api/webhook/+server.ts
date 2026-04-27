import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const sig = request.headers.get('stripe-signature');
	const body = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, sig!, env.STRIPE_WEBHOOK_SECRET);
	} catch {
		error(400, 'Invalid webhook signature');
	}

	const session = event.data.object as Stripe.Checkout.Session;

	switch (event.type) {
		case 'checkout.session.completed': {
			// For async payment methods (SEPA, iDEAL, etc.) payment_status may still be 'unpaid'
			const status = session.payment_status === 'paid' ? 'paid' : 'pending';
			const shipping = session.collected_information?.shipping_details;
			const addr = shipping?.address;
			await db
				.insert(orders)
				.values({
					stripeSessionId: session.id,
					productId: session.metadata?.productId ?? '',
					priceId: session.metadata?.priceId ?? '',
					customerEmail: session.customer_details?.email ?? null,
					amountTotal: session.amount_total,
					currency: session.currency,
					status,
					shippingName: shipping?.name ?? null,
					shippingAddress: addr
						? {
								line1: addr.line1 ?? '',
								line2: addr.line2 ?? null,
								city: addr.city ?? '',
								state: addr.state ?? null,
								postal_code: addr.postal_code ?? '',
								country: addr.country ?? '',
							}
						: null,
				})
				.onConflictDoNothing();
			break;
		}
		case 'checkout.session.async_payment_succeeded':
			await db
				.update(orders)
				.set({ status: 'paid' })
				.where(eq(orders.stripeSessionId, session.id));
			break;
		case 'checkout.session.async_payment_failed':
			await db
				.update(orders)
				.set({ status: 'failed' })
				.where(eq(orders.stripeSessionId, session.id));
			break;
	}

	return new Response(null, { status: 200 });
};
