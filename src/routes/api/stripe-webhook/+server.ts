import Stripe from 'stripe';
import { Resend } from 'resend';
import {
	STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET,
	RESEND_API_KEY,
	RESEND_FROM
} from '$env/static/private';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { renderOrderEmail } from '$lib/email/render';
import type { RequestHandler } from './$types';

export const prerender = false;
export const trailingSlash = 'ignore';

export const POST: RequestHandler = async ({ request }) => {
	const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
	const sig = request.headers.get('stripe-signature');
	const body = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, sig!, STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error('[webhook] signature verification failed', err);
		error(400, 'Invalid webhook signature');
	}

	const session = event.data.object as Stripe.Checkout.Session;

	switch (event.type) {
		case 'checkout.session.completed': {
			try {
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
									country: addr.country ?? ''
								}
							: null,
						isPreorder: session.metadata?.isPreorder === 'true'
					})
					.onConflictDoNothing();

				if (session.customer_details?.email) {
					try {
						const resend = new Resend(RESEND_API_KEY);
						const html = renderOrderEmail({
							productId: session.metadata?.productId ?? '',
							amountTotal: session.amount_total ?? 0,
							currency: session.currency ?? 'eur',
							customerName: session.customer_details.name ?? undefined,
							isPreorder: session.metadata?.isPreorder === 'true'
						});
						const { data: emailData } = await resend.emails.send({
							from: RESEND_FROM ?? 'DEXTERLABS <hello@dxlb.nl>',
							to: session.customer_details.email,
							subject: 'Order received — DEXTERLABS',
							html
						});
						if (emailData?.id) {
							await db
								.update(orders)
								.set({ resendEmailId: emailData.id })
								.where(eq(orders.stripeSessionId, session.id));
						}
					} catch (err) {
						console.error('[webhook] order email failed', err);
					}
				}
			} catch (err) {
				console.error('[webhook] failed to process checkout.session.completed', session.id, err);
				throw err;
			}
			break;
		}
		case 'checkout.session.async_payment_succeeded':
			await db.update(orders).set({ status: 'paid' }).where(eq(orders.stripeSessionId, session.id));
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
